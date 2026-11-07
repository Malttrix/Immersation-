"""Offline tests; never contact Vercel, Supabase, WordPress or Telegram."""
import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import tempfile
import unittest
import socket
import ssl
from email.message import Message
from unittest.mock import patch
from urllib.error import HTTPError

spec = importlib.util.spec_from_file_location('grok', Path(__file__).parents[1] / 'tools/mira/grok-staging.py')
g = importlib.util.module_from_spec(spec)
spec.loader.exec_module(g)


def credentials():
    return {'origin': g.ORIGIN, 'project': g.PROJECT, 'supabase_ref': g.SUPABASE_REF, 'agent_token': 'a' * 64, 'bypass': 'fixture-bypass'}


class GrokStagingTests(unittest.TestCase):
    def test_rotated_token_format_matches_server_contract(self):
        import secrets
        token = secrets.token_urlsafe(48)
        self.assertEqual(len(token), 64)
        self.assertEqual(g.normalize_agent_token(token), token)
        self.assertEqual(g.normalize_agent_token(' \t' + token + '\r\n'), token)
        for bad in ['a' * 42, 'a' * 129, 'a' * 43 + ' ' + 'b', 'é' * 64, 'a' * 63 + '/', 'a' * 63 + '+', 'a' * 63 + '=']:
            with self.subTest(kind='invalid-format'), self.assertRaises(g.Blocked):
                g.normalize_agent_token(bad)

    def test_bad_first_prompt_never_asks_for_bypass_or_logs_input(self):
        for bad in ['immersation-staging-mira-agent-token', 'Bearer ' + 'a' * 64, '"' + 'a' * 64 + '"', 'short']:
            with patch.object(g.getpass, 'getpass', return_value=bad) as ask, contextlib.redirect_stdout(io.StringIO()) as output:
                with self.assertRaises(g.Blocked):
                    g.prompt_credentials()
                self.assertEqual(ask.call_count, 1)
                if bad != 'immersation-staging-mira-agent-token':
                    self.assertNotIn(bad, output.getvalue())

    def test_separate_prompts_normalize_padding_and_reject_same_secret(self):
        token = 'a' * 64
        with patch.object(g.getpass, 'getpass', side_effect=['\t' + token + '\n', ' fixture-bypass\n']), contextlib.redirect_stdout(io.StringIO()) as output:
            result = g.prompt_credentials()
        self.assertEqual(result['agent_token'], token)
        self.assertEqual(result['bypass'], 'fixture-bypass')
        self.assertNotIn(token, output.getvalue())
        self.assertNotIn('fixture-bypass', output.getvalue())
        with patch.object(g.getpass, 'getpass', side_effect=[token, token]), contextlib.redirect_stdout(io.StringIO()), self.assertRaises(g.Blocked):
            g.prompt_credentials()

    def test_embedded_client_matches_reviewed_source_with_only_origin_change(self):
        source = (Path(__file__).parents[1] / 'tools/mira/immersation.py').read_text()
        old = "    base=os.environ.get('IMMERSATION_API_BASE','https://immersation.com').rstrip('/')"
        replacement = "    base=os.environ.get('IMMERSATION_API_BASE','')\n    if base != 'https://immersation-staging.vercel.app': raise ClientError('configuration','STAGING_ORIGIN_REQUIRED')"
        self.assertIn(old, source)
        self.assertEqual(g.base64.b64decode(g.CLIENT_B64), source.replace(old, replacement, 1).encode())

    def test_wrong_host_stops_before_credentials_or_network(self):
        with patch.object(g.socket, 'gethostname', return_value='other-server'), patch.object(g.platform, 'system', return_value='Linux'):
            with self.assertRaises(g.Blocked):
                g.require_host()

    def test_credentials_reject_wrong_targets_or_invalid_secrets(self):
        for key, value in [('origin', 'https://immersation.com'), ('project', 'prj_other'), ('supabase_ref', 'zoneqvjrbcowlzwiyinq'), ('agent_token', 'short'), ('bypass', 'bad\nheader')]:
            sample = credentials()
            sample[key] = value
            with self.subTest(key=key), self.assertRaises(g.Blocked):
                g.validate_credentials(sample)

    def test_explicit_paused_cron_only_and_no_mutation(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'jobs.json'
            for value in [{'jobs': [{'enabled': True}]}, {'jobs': [{}]}, {'unknown': []}, 'invalid']:
                path.write_text(json.dumps(value))
                before = path.read_bytes()
                with self.assertRaises(g.Blocked):
                    g.verify_paused([path])
                self.assertEqual(path.read_bytes(), before)
            path.write_text(json.dumps({'jobs': [{'enabled': False, 'state': 'paused'}]}))
            self.assertEqual(g.verify_paused([path]), 1)

    def test_embedded_client_pins_staging_and_preserves_uncertainty(self):
        with patch.dict(os.environ, {}, clear=True):
            module = g.client(credentials())
            os.environ['IMMERSATION_API_BASE'] = 'https://immersation.com'
            with self.assertRaises(module.ClientError) as exc:
                module.config()
            self.assertEqual(exc.exception.code, 'STAGING_ORIGIN_REQUIRED')
            with tempfile.TemporaryDirectory() as directory:
                path = Path(directory) / 'state.json'
                state = {'version': 1, 'keys': {}}
                key = module.key_for(state, path, 'upload:cover', 'digest')
                state['keys']['upload:cover']['uncertain'] = True
                with self.assertRaises(module.ClientError):
                    module.key_for(state, path, 'upload:cover', 'digest')
                self.assertEqual(key, state['keys']['upload:cover']['key'])

    def test_client_integrity_tampering_fails(self):
        with patch.object(g, 'CLIENT_SHA256', '0' * 64):
            with self.assertRaises(g.Blocked):
                g.client(credentials())

    def test_package_repeat_preserves_payload_images_and_state(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(g, 'ROOT', Path(directory)):
            root = g.prepare_test()
            package = (root / 'package.json').read_bytes()
            state = root / '.mira-state.json'
            state.write_text('{"do-not-replace": true}')
            media = {p.name: p.read_bytes() for p in (root / 'media').iterdir()}
            self.assertEqual(g.prepare_test(), root)
            self.assertEqual((root / 'package.json').read_bytes(), package)
            self.assertEqual(state.read_text(), '{"do-not-replace": true}')
            self.assertEqual(media, {p.name: p.read_bytes() for p in (root / 'media').iterdir()})

    def test_private_credentials_and_symlink_guard(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'credentials.json'
            g.atomic_write(path, json.dumps(credentials()).encode())
            with patch.object(g, 'CREDS', path):
                self.assertEqual(g.load_credentials()['origin'], g.ORIGIN)
                path.chmod(0o644)
                with self.assertRaises(g.Blocked):
                    g.load_credentials()
            link = Path(directory) / 'link'
            link.symlink_to(path)
            with self.assertRaises(g.Blocked):
                g.atomic_write(link, b'no')

    def test_setup_preserves_existing_profile_and_is_repeatable(self):
        with tempfile.TemporaryDirectory() as directory:
            profile = Path(directory) / 'profile'
            profile.mkdir()
            root = profile / 'mira-staging'
            root.mkdir()
            launcher = Path(directory) / 'immersation-editor'
            launcher.write_text('existing launcher')
            env = profile / '.env'
            env.write_text('TELEGRAM_BOT_TOKEN=private-fixture\n')
            config = profile / 'config.yaml'
            config.write_text('existing config')
            cron = profile / 'cron'
            cron.mkdir()
            jobs = cron / 'jobs.json'
            jobs.write_text('{"jobs":[{"enabled":false}]}')
            secrets_path = root / 'credentials.json'
            g.atomic_write(secrets_path, json.dumps(credentials()).encode())
            expected = {p: p.read_bytes() for p in (launcher, env, config, jobs, secrets_path)}
            with patch.multiple(g, PROFILE=profile, ROOT=root, CREDS=secrets_path, LAUNCHER=launcher,
                                INSTALLED=root / 'grok-staging.py', SKILL=profile / 'skills/test/SKILL.md'), patch.object(g, 'auth_check'), contextlib.redirect_stdout(io.StringIO()) as output:
                g.setup()
                first = (root / 'test-package/package.json').read_bytes()
                g.setup()
                self.assertEqual((root / 'test-package/package.json').read_bytes(), first)
            self.assertEqual(expected, {p: p.read_bytes() for p in expected})
            self.assertNotIn('private-fixture', output.getvalue())
            self.assertNotIn(credentials()['agent_token'], output.getvalue())

    def test_api_probe_accepts_only_authenticated_not_found(self):
        class Fake:
            def __init__(self, status, body):
                self.status, self.body = status, body

            def open(self, req, timeout):
                self.req = req
                raise HTTPError(req.full_url, self.status, 'fixture', {}, io.BytesIO(self.body))

        for code, body, ok in [(404, b'{"code":"NOT_FOUND"}', True), (401, b'{"code":"UNAUTHORIZED"}', False), (302, b'', False), (503, b'{"code":"UNAVAILABLE"}', False)]:
            fake = Fake(code, body)
            with patch.object(g.request, 'build_opener', return_value=fake):
                output = io.StringIO()
                with contextlib.redirect_stdout(output):
                    if ok:
                        g.auth_check(credentials())
                    else:
                        with self.assertRaises(g.Blocked):
                            g.auth_check(credentials())
                self.assertNotIn(credentials()['agent_token'], output.getvalue())
                self.assertNotIn(credentials()['bypass'], output.getvalue())
                self.assertTrue(fake.req.full_url.startswith(g.ORIGIN + '/api/editorial/agent/'))

    def test_media_read_checks_status_mime_signature_and_failure_categories(self):
        asset = {'id': 10, 'url': 'https://staging-cms.immersation.com/wp-content/uploads/test.png', 'mime': 'image/png'}
        class Response:
            status = 200
            def __init__(self, mime, data):
                self.headers = Message()
                self.headers['Content-Type'] = mime
                self.data = data
            def __enter__(self): return self
            def __exit__(self, *_): pass
            def read(self, n): return self.data[:n]
        class Fake:
            def __init__(self, result): self.result = result
            def open(self, req, timeout):
                self.req = req
                if isinstance(self.result, Exception): raise self.result
                return self.result
        good = Fake(Response('image/png', b'\x89PNG\r\n\x1a\nmore'))
        self.assertIsNone(g.inspect_media('cover', asset, good)['error'])
        self.assertEqual(good.req.get_header('Referer'), g.ORIGIN + '/')
        cases = [
            (Response('text/html', b'<html>'), 'CONTENT_TYPE'),
            (Response('image/jpeg', b'\xff\xd8\xff'), 'MIME_MISMATCH'),
            (Response('image/png', b'not-image'), 'IMAGE_SIGNATURE'),
            (HTTPError(asset['url'], 403, 'forbidden', Message(), None), 'HTTP_ERROR'),
            (HTTPError(asset['url'], 302, 'redirect', Message(), None), 'REDIRECT_REJECTED'),
            (g.error.URLError(ssl.SSLCertVerificationError('private fixture detail')), 'TLS_CERTIFICATE'),
            (g.error.URLError(socket.gaierror('private fixture detail')), 'DNS_ERROR'),
            (g.error.URLError(TimeoutError('private fixture detail')), 'TIMEOUT'),
        ]
        for response, expected in cases:
            with self.subTest(expected=expected):
                result = g.inspect_media('cover', asset, Fake(response))
                self.assertEqual(result['error'], expected)
                self.assertNotIn('private fixture detail', json.dumps(result))

    def test_media_diagnostic_reads_existing_state_without_credentials_or_writes(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory) / 'test-package'
            root.mkdir()
            package = {'article': {'submissionId': 'grok-staging-test-a5c9f25642cb'}}
            assets = {role: {'id': i, 'url': 'https://staging-cms.immersation.com/wp-content/uploads/' + role + '.png', 'mime': 'image/png'} for i, role in enumerate(('cover', 'pinterest1', 'pinterest2'), 10)}
            state = {'keys': {'upload:' + role: {'key': role + 'x' * 40, 'uncertain': False} for role in assets}}
            for name, value in [('package.json', package), ('confirmed-assets.json', assets), ('.mira-state.json', state)]:
                (root / name).write_text(json.dumps(value))
            before = {p: p.read_bytes() for p in root.iterdir()}
            def probe(role, asset): return {'role': role, 'id': asset['id'], 'http': 200, 'mime': 'image/png', 'error': None}
            with patch.multiple(g, ROOT=Path(directory)), patch.object(g, 'require_host'), patch.object(g, 'load_credentials', side_effect=AssertionError('credentials accessed')), patch.object(g, 'verify_paused', side_effect=AssertionError('cron accessed')), patch.object(g, 'inspect_media', side_effect=probe), contextlib.redirect_stdout(io.StringIO()) as out:
                g.run('diagnose-media')
            self.assertEqual(before, {p: p.read_bytes() for p in root.iterdir()})
            self.assertIn('PASS: saved assets readable', out.getvalue())
            for entry in state['keys'].values(): self.assertNotIn(entry['key'], out.getvalue())

    def test_status_recovery_never_resubmits_or_changes_original_state(self):
        from types import SimpleNamespace
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory) / 'test-package'
            root.mkdir()
            sid = 'grok-staging-test-a5c9f25642cb'
            assets = {role: {'id': i, 'url': 'https://staging-cms.immersation.com/wp-content/uploads/' + role + '.png', 'mime': 'image/png'} for i, role in enumerate(('cover', 'pinterest1', 'pinterest2'), 10)}
            state = {'keys': {'upload:' + role: {'key': role + 'x' * 40} for role in assets}}
            for name, value in [('package.json', {'article': {'submissionId': sid}}), ('confirmed-assets.json', assets), ('.mira-state.json', state)]:
                (root / name).write_text(json.dumps(value))
            before = {p: p.read_bytes() for p in root.iterdir()}
            calls = []
            def api(stage, path, method='GET', body=None, headers=None):
                calls.append((stage, path, method))
                if stage.startswith('verify:'):
                    role = stage.split(':', 1)[1]
                    self.assertEqual(headers['Idempotency-Key'], state['keys']['upload:' + role]['key'])
                    return {'verified': True, 'role': role, 'id': assets[role]['id']}
                return {'status': 'pending_review', 'revision': 4, 'reviewUrl': g.ORIGIN + '/admin'}
            def forbidden_submit(*args, **kwargs): raise AssertionError('status attempted a submission')
            fake = SimpleNamespace(api=api, submit=forbidden_submit, verified_review_url=lambda x: x, ClientError=Exception)
            with patch.multiple(g, ROOT=Path(directory)), patch.object(g, 'require_host'), patch.object(g, 'verify_paused', return_value=0), patch.object(g, 'load_credentials', return_value=credentials()), patch.object(g, 'auth_check'), patch.object(g, 'client', return_value=fake), patch.object(g, 'inspect_media', side_effect=AssertionError('VM fetched WordPress')), contextlib.redirect_stdout(io.StringIO()) as out:
                g.run('status')
            self.assertEqual(calls, [('status', '/drafts/' + sid, 'GET')] + [('verify:' + role, '/drafts/' + sid + '/assets/' + role + '/verify', 'GET') for role in assets])
            self.assertEqual(before, {p: p.read_bytes() for p in root.iterdir()})
            self.assertIn('pending_review', out.getvalue())


if __name__ == '__main__':
    unittest.main()
