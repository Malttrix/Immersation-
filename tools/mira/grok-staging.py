#!/usr/bin/env python3
"""Self-contained staging bridge for the existing immersation-editor profile.

Run setup inside the named Grok VM. No package install, gateway restart,
Telegram reconfiguration, cron mutation, approval, or publication commands.
"""
import argparse
import base64
import contextlib
import getpass
import hashlib
import json
import io
import os
from pathlib import Path
import platform
import re
import socket
import ssl
import stat
import struct
import sys
import tempfile
import types
from urllib import request, error
import zlib

HOST = 'grok-bot-vm-524035276'
PROFILE = Path('/home/box/.hermes/profiles/immersation-editor')
INSTALLATION = Path('/home/box/.hermes/hermes-agent')
LAUNCHER = Path('/home/box/.local/bin/immersation-editor')
ORIGIN = 'https://immersation-staging.vercel.app'
PROJECT = 'prj_Ip7SJfJuqk1B7OfTkm0Jl1ceBwk0'
SUPABASE_REF = 'dibfotxdupgdhbmhmrnl'
ROOT = PROFILE / 'mira-staging'
CREDS = ROOT / 'credentials.json'
INSTALLED = ROOT / 'grok-staging.py'
SKILL = PROFILE / 'skills' / 'immersation-staging-editorial' / 'SKILL.md'
CLIENT_SHA256 = 'd8a58e25aacffdbf4fa0929b22d050562d01da1b30937dea01ab47e030c8fe4f'
CLIENT_B64 = 'IyEvdXNyL2Jpbi9lbnYgcHl0aG9uMwoiIiJIZXJtZXMtY29tcGF0aWJsZSBkcmFmdC1vbmx5IGNsaWVudC4gTmV2ZXIgYWNjZXB0cyBhZG1pbiBjcmVkZW50aWFscy4iIiIKaW1wb3J0IGFyZ3BhcnNlLCBoYXNobGliLCBqc29uLCBvcywgc2VjcmV0cywgc3RhdCwgc3lzLCB0ZW1wZmlsZQpmcm9tIHBhdGhsaWIgaW1wb3J0IFBhdGgKZnJvbSB1cmxsaWIgaW1wb3J0IHJlcXVlc3QsIGVycm9yLCBwYXJzZQoKQ1VSUkVOVF9TVUJNSVNTSU9OID0gTm9uZQpST0xFUyA9IHsnY292ZXInLCdiYWNrZ3JvdW5kJywncGludGVyZXN0MScsJ3BpbnRlcmVzdDInfSB8IHtmJ2luc3RhZ3JhbXtpfScgZm9yIGkgaW4gcmFuZ2UoMSwxMCl9CmNsYXNzIENsaWVudEVycm9yKEV4Y2VwdGlvbik6CiAgICBkZWYgX19pbml0X18oc2VsZiwgc3RhZ2UsIGNvZGUsIHVuY2VydGFpbj1GYWxzZSwgY29ycmVsYXRpb249Tm9uZSk6CiAgICAgICAgc2VsZi5zdGFnZSwgc2VsZi5jb2RlLCBzZWxmLnVuY2VydGFpbiwgc2VsZi5jb3JyZWxhdGlvbiA9IHN0YWdlLCBjb2RlLCB1bmNlcnRhaW4sIGNvcnJlbGF0aW9uCgpkZWYgY29uZmlnKCk6CiAgICBiYXNlPW9zLmVudmlyb24uZ2V0KCdJTU1FUlNBVElPTl9BUElfQkFTRScsJycpCiAgICBpZiBiYXNlICE9ICdodHRwczovL2ltbWVyc2F0aW9uLXN0YWdpbmcudmVyY2VsLmFwcCc6IHJhaXNlIENsaWVudEVycm9yKCdjb25maWd1cmF0aW9uJywnU1RBR0lOR19PUklHSU5fUkVRVUlSRUQnKQogICAgdXJsPXBhcnNlLnVybHNwbGl0KGJhc2UpCiAgICBpZiB1cmwudXNlcm5hbWUgb3IgdXJsLnBhc3N3b3JkIG9yIHVybC5xdWVyeSBvciB1cmwuZnJhZ21lbnQgb3IgdXJsLnBhdGggbm90IGluICgnJywnLycpIG9yIG5vdCAodXJsLnNjaGVtZT09J2h0dHBzJyBvciAodXJsLnNjaGVtZT09J2h0dHAnIGFuZCB1cmwuaG9zdG5hbWUgaW4gKCdsb2NhbGhvc3QnLCcxMjcuMC4wLjEnLCc6OjEnKSkpOgogICAgICAgIHJhaXNlIENsaWVudEVycm9yKCdjb25maWd1cmF0aW9uJywnSU5WQUxJRF9BUElfT1JJR0lOJykKICAgIHRva2VuPW9zLmVudmlyb24uZ2V0KCdNSVJBX0FHRU5UX1RPS0VOJywnJykKICAgIGlmIGxlbih0b2tlbik8NDMgb3Igbm90IGFsbChjLmlzYWxudW0oKSBvciBjIGluICdfLScgZm9yIGMgaW4gdG9rZW4pOiByYWlzZSBDbGllbnRFcnJvcignY29uZmlndXJhdGlvbicsJ01JU1NJTkdfQUdFTlRfVE9LRU4nKQogICAgcmV0dXJuIGJhc2UsIHRva2VuCgpjbGFzcyBOb1JlZGlyZWN0KHJlcXVlc3QuSFRUUFJlZGlyZWN0SGFuZGxlcik6CiAgICBkZWYgcmVkaXJlY3RfcmVxdWVzdChzZWxmLCByZXEsIGZwLCBjb2RlLCBtc2csIGhlYWRlcnMsIG5ld3VybCk6IHJldHVybiBOb25lCgpkZWYgYXBpKHN0YWdlLCBwYXRoLCBtZXRob2Q9J0dFVCcsIGJvZHk9Tm9uZSwgaGVhZGVycz1Ob25lKToKICAgIGJhc2UsIHRva2VuPWNvbmZpZygpCiAgICBleHRyYT17fQogICAgYnlwYXNzPW9zLmVudmlyb24uZ2V0KCdNSVJBX1ZFUkNFTF9CWVBBU1NfU0VDUkVUJywnJykKICAgIGlmIGJ5cGFzczoKICAgICAgICBpZiBiYXNlICE9ICdodHRwczovL2ltbWVyc2F0aW9uLXN0YWdpbmcudmVyY2VsLmFwcCcgb3Igbm90IGJ5cGFzcy5pc2FzY2lpKCkgb3Igbm90IDEgPD0gbGVuKGJ5cGFzcykgPD0gNTEyIG9yIGFueShvcmQoYykgPCAzMyBvciBvcmQoYykgPiAxMjYgZm9yIGMgaW4gYnlwYXNzKToKICAgICAgICAgICAgcmFpc2UgQ2xpZW50RXJyb3IoJ2NvbmZpZ3VyYXRpb24nLCdJTlZBTElEX1NUQUdJTkdfQllQQVNTJykKICAgICAgICBleHRyYVsneC12ZXJjZWwtcHJvdGVjdGlvbi1ieXBhc3MnXT1ieXBhc3MKICAgIHJlcT1yZXF1ZXN0LlJlcXVlc3QoYmFzZSsnL2FwaS9lZGl0b3JpYWwvYWdlbnQnK3BhdGgsZGF0YT1ib2R5LG1ldGhvZD1tZXRob2QsaGVhZGVycz17J0F1dGhvcml6YXRpb24nOidCZWFyZXIgJyt0b2tlbiwqKmV4dHJhLCoqKGhlYWRlcnMgb3Ige30pfSkKICAgIHRyeToKICAgICAgICB3aXRoIHJlcXVlc3QuYnVpbGRfb3BlbmVyKE5vUmVkaXJlY3QoKSkub3BlbihyZXEsdGltZW91dD00NSkgYXMgcmVzOiByZXR1cm4ganNvbi5sb2FkKHJlcykKICAgIGV4Y2VwdCBlcnJvci5IVFRQRXJyb3IgYXMgZXhjOgogICAgICAgIHRyeTogZGF0YT1qc29uLmxvYWRzKGV4Yy5yZWFkKDMyNzY4KSkKICAgICAgICBleGNlcHQgRXhjZXB0aW9uOiBkYXRhPXt9CiAgICAgICAgY29kZT1kYXRhLmdldCgnY29kZScsJ0hUVFBfRVJST1InKQogICAgICAgIHJhaXNlIENsaWVudEVycm9yKHN0YWdlLGNvZGUsIHN0YWdlLnN0YXJ0c3dpdGgoJ3VwbG9hZDonKSBhbmQgKGRhdGEuZ2V0KCdyZXRyeVNhZmUnKSBpcyBGYWxzZSBvciBleGMuY29kZT49NTAwKSwgZXhjLmhlYWRlcnMuZ2V0KCdYLUNvcnJlbGF0aW9uLUlkJykpIGZyb20gTm9uZQogICAgZXhjZXB0IEV4Y2VwdGlvbjogcmFpc2UgQ2xpZW50RXJyb3Ioc3RhZ2UsJ05FVFdPUktfRVJST1InLHN0YWdlLnN0YXJ0c3dpdGgoJ3VwbG9hZDonKSkgZnJvbSBOb25lCgpkZWYgdmVyaWZpZWRfcmV2aWV3X3VybCh2YWx1ZSk6CiAgICBiYXNlLF89Y29uZmlnKCkKICAgIGV4cGVjdGVkPXBhcnNlLnVybHNwbGl0KGJhc2UpOyBhY3R1YWw9cGFyc2UudXJsc3BsaXQodmFsdWUgaWYgaXNpbnN0YW5jZSh2YWx1ZSxzdHIpIGVsc2UgJycpCiAgICBpZiAoYWN0dWFsLnNjaGVtZSxhY3R1YWwuaG9zdG5hbWUsYWN0dWFsLnBvcnQpIT0oZXhwZWN0ZWQuc2NoZW1lLGV4cGVjdGVkLmhvc3RuYW1lLGV4cGVjdGVkLnBvcnQpIG9yIGFjdHVhbC51c2VybmFtZSBvciBhY3R1YWwucGFzc3dvcmQgb3IgYWN0dWFsLnBhdGggIT0gJy9hZG1pbicgb3IgYWN0dWFsLnF1ZXJ5IG9yIGFjdHVhbC5mcmFnbWVudDoKICAgICAgICByYWlzZSBDbGllbnRFcnJvcigncmV2aWV3X3VybCcsJ0lOVkFMSURfUkVWSUVXX1VSTCcpCiAgICByZXR1cm4gdmFsdWUKCmRlZiByZWFkX3N0YXRlKHBhdGgpOgogICAgaWYgbm90IHBhdGguZXhpc3RzKCk6IHJldHVybiB7J3ZlcnNpb24nOjEsJ2tleXMnOnt9fQogICAgaWYgcGF0aC5pc19zeW1saW5rKCkgb3Igbm90IHN0YXQuU19JU1JFRyhwYXRoLnN0YXQoKS5zdF9tb2RlKTogcmFpc2UgQ2xpZW50RXJyb3IoJ3N0YXRlJywnSU5WQUxJRF9TVEFURV9GSUxFJykKICAgIHJldHVybiBqc29uLmxvYWRzKHBhdGgucmVhZF90ZXh0KCkpCgpkZWYgc2F2ZV9zdGF0ZShwYXRoLHN0YXRlKToKICAgIGZkLG5hbWU9dGVtcGZpbGUubWtzdGVtcChwcmVmaXg9Jy5taXJhLXN0YXRlLScsZGlyPXBhdGgucGFyZW50KQogICAgdHJ5OgogICAgICAgIHdpdGggb3MuZmRvcGVuKGZkLCd3JykgYXMgaGFuZGxlOiBqc29uLmR1bXAoc3RhdGUsaGFuZGxlLHNvcnRfa2V5cz1UcnVlKTsgaGFuZGxlLmZsdXNoKCk7IG9zLmZzeW5jKGhhbmRsZS5maWxlbm8oKSkKICAgICAgICBvcy5yZXBsYWNlKG5hbWUscGF0aCk7IG9zLmNobW9kKHBhdGgsMG82MDApCiAgICBmaW5hbGx5OgogICAgICAgIGlmIG9zLnBhdGguZXhpc3RzKG5hbWUpOiBvcy51bmxpbmsobmFtZSkKCmRlZiBrZXlfZm9yKHN0YXRlLHBhdGgsc3RhZ2UsZGlnZXN0KToKICAgIGV4aXN0aW5nPXN0YXRlWydrZXlzJ10uZ2V0KHN0YWdlKQogICAgaWYgZXhpc3RpbmcgYW5kIGV4aXN0aW5nLmdldCgndW5jZXJ0YWluJyk6IHJhaXNlIENsaWVudEVycm9yKHN0YWdlLCdSRUNPTkNJTElBVElPTl9SRVFVSVJFRCcsVHJ1ZSkKICAgIGlmIGV4aXN0aW5nIGFuZCBleGlzdGluZ1snZGlnZXN0J109PWRpZ2VzdDogcmV0dXJuIGV4aXN0aW5nWydrZXknXQogICAga2V5PXNlY3JldHMudG9rZW5fdXJsc2FmZSgzMikKICAgIHN0YXRlWydrZXlzJ11bc3RhZ2VdPXsnZGlnZXN0JzpkaWdlc3QsJ2tleSc6a2V5fQogICAgc2F2ZV9zdGF0ZShwYXRoLHN0YXRlKQogICAgcmV0dXJuIGtleQoKZGVmIHN1Ym1pdChkaXJlY3RvcnksIHJlc3VtZV9yZWNvbmNpbGVkPUZhbHNlLCByZXRyeV9jb25maXJtZWRfYWJzZW50PU5vbmUpOgogICAgZ2xvYmFsIENVUlJFTlRfU1VCTUlTU0lPTgogICAgcm9vdD1QYXRoKGRpcmVjdG9yeSkucmVzb2x2ZSgpOyBtYW5pZmVzdD1qc29uLmxvYWRzKChyb290LydwYWNrYWdlLmpzb24nKS5yZWFkX3RleHQoKSkKICAgIHBheWxvYWQ9bWFuaWZlc3RbJ2FydGljbGUnXTsgbWVkaWE9bWFuaWZlc3RbJ21lZGlhJ107IHN1Ym1pc3Npb249cGF5bG9hZFsnc3VibWlzc2lvbklkJ107IENVUlJFTlRfU1VCTUlTU0lPTj1zdWJtaXNzaW9uCiAgICBpZiBub3Qgeydjb3ZlcicsJ3BpbnRlcmVzdDEnLCdwaW50ZXJlc3QyJ30gPD0gc2V0KG1lZGlhKSBvciBub3Qgc2V0KG1lZGlhKTw9Uk9MRVM6IHJhaXNlIENsaWVudEVycm9yKCd2YWxpZGF0aW9uJywnSU5WQUxJRF9NRURJQV9ST0xFUycpCiAgICBib2R5PWpzb24uZHVtcHMocGF5bG9hZCxlbnN1cmVfYXNjaWk9RmFsc2Usc2VwYXJhdG9ycz0oJywnLCc6JykpLmVuY29kZSgpCiAgICBzdGF0ZV9wYXRoPXJvb3QvJy5taXJhLXN0YXRlLmpzb24nOyBzdGF0ZT1yZWFkX3N0YXRlKHN0YXRlX3BhdGgpCiAgICBrZXk9a2V5X2ZvcihzdGF0ZSxzdGF0ZV9wYXRoLCdkcmFmdCcsaGFzaGxpYi5zaGEyNTYoYm9keSkuaGV4ZGlnZXN0KCkpCiAgICByZXN1bHQ9YXBpKCdkcmFmdCcsJy9kcmFmdHMnLCdQT1NUJyxib2R5LHsnQ29udGVudC1UeXBlJzonYXBwbGljYXRpb24vanNvbicsJ0lkZW1wb3RlbmN5LUtleSc6a2V5fSkKICAgIGZvciByb2xlLCByZWxhdGl2ZSBpbiBtZWRpYS5pdGVtcygpOgogICAgICAgIHBhdGg9KHJvb3QvcmVsYXRpdmUpLnJlc29sdmUoKQogICAgICAgIGlmIHJvb3Qgbm90IGluIHBhdGgucGFyZW50cyBvciBub3QgcGF0aC5pc19maWxlKCk6IHJhaXNlIENsaWVudEVycm9yKCd2YWxpZGF0aW9uJywnSU5WQUxJRF9NRURJQV9QQVRIJykKICAgICAgICBjb250ZW50PXBhdGgucmVhZF9ieXRlcygpCiAgICAgICAgaWYgbm90IDA8bGVuKGNvbnRlbnQpPD0zKjEwMjQqMTAyNDogcmFpc2UgQ2xpZW50RXJyb3IoJ3ZhbGlkYXRpb24nLCdJTlZBTElEX01FRElBX1NJWkUnKQogICAgICAgIHN0YWdlPSd1cGxvYWQ6Jytyb2xlCiAgICAgICAgZXhpc3Rpbmc9c3RhdGVbJ2tleXMnXS5nZXQoc3RhZ2UpCiAgICAgICAgZGlnZXN0PWhhc2hsaWIuc2hhMjU2KGNvbnRlbnQpLmhleGRpZ2VzdCgpCiAgICAgICAgaWYgZXhpc3RpbmcgYW5kIGV4aXN0aW5nLmdldCgndW5jZXJ0YWluJykgYW5kIHJldHJ5X2NvbmZpcm1lZF9hYnNlbnQ9PXJvbGU6CiAgICAgICAgICAgIG91dGNvbWU9YXBpKCd1cGxvYWRfc3RhdHVzOicrcm9sZSwnL2RyYWZ0cy8nK3BhcnNlLnF1b3RlKHN1Ym1pc3Npb24sc2FmZT0nJykrJy9hc3NldHMvJytyb2xlKycvc3RhdHVzJyxoZWFkZXJzPXsnSWRlbXBvdGVuY3ktS2V5JzpleGlzdGluZ1sna2V5J119KQogICAgICAgICAgICBpZiBvdXRjb21lLmdldCgnc3RhdGUnKSAhPSAnZmFpbGVkJzogcmFpc2UgQ2xpZW50RXJyb3Ioc3RhZ2UsJ0FCU0VOQ0VfTk9UX0NPTkZJUk1FRCcsVHJ1ZSkKICAgICAgICAgICAgc3RhdGUuc2V0ZGVmYXVsdCgnaGlzdG9yeScsW10pLmFwcGVuZCh7J3N0YWdlJzpzdGFnZSwgKipleGlzdGluZ30pCiAgICAgICAgICAgIGRlbCBzdGF0ZVsna2V5cyddW3N0YWdlXTsgc2F2ZV9zdGF0ZShzdGF0ZV9wYXRoLHN0YXRlKTsgZXhpc3Rpbmc9Tm9uZQogICAgICAgIGlmIGV4aXN0aW5nIGFuZCBleGlzdGluZy5nZXQoJ3VuY2VydGFpbicpIGFuZCByZXN1bWVfcmVjb25jaWxlZCBhbmQgZXhpc3RpbmdbJ2RpZ2VzdCddPT1kaWdlc3Q6CiAgICAgICAgICAgIGV4aXN0aW5nLnBvcCgndW5jZXJ0YWluJyk7IHNhdmVfc3RhdGUoc3RhdGVfcGF0aCxzdGF0ZSkKICAgICAgICBrZXk9a2V5X2ZvcihzdGF0ZSxzdGF0ZV9wYXRoLHN0YWdlLGRpZ2VzdCkKICAgICAgICAjIFBlcnNpc3QgdW5jZXJ0YWludHkgKmJlZm9yZSogdGhlIG5ldHdvcmsgY2FsbCBzbyBwcm9jZXNzIHRlcm1pbmF0aW9uIGlzIHNhZmUuCiAgICAgICAgc3RhdGVbJ2tleXMnXVtzdGFnZV1bJ3VuY2VydGFpbiddPVRydWU7IHNhdmVfc3RhdGUoc3RhdGVfcGF0aCxzdGF0ZSkKICAgICAgICB0cnk6CiAgICAgICAgICAgIGFwaShzdGFnZSwnL2RyYWZ0cy8nK3BhcnNlLnF1b3RlKHN1Ym1pc3Npb24sc2FmZT0nJykrJy9hc3NldHMvJytyb2xlLCdQT1NUJyxjb250ZW50LHsnQ29udGVudC1UeXBlJzonYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJywnSWRlbXBvdGVuY3ktS2V5JzprZXksJ1gtT3JpZ2luYWwtRmlsZW5hbWUnOnBhdGgubmFtZS5lbmNvZGUoJ2FzY2lpJywncmVwbGFjZScpLmRlY29kZSgpfSkKICAgICAgICBleGNlcHQgQ2xpZW50RXJyb3IgYXMgZXhjOgogICAgICAgICAgICBpZiBub3QgZXhjLnVuY2VydGFpbjogc3RhdGVbJ2tleXMnXVtzdGFnZV0ucG9wKCd1bmNlcnRhaW4nLE5vbmUpOyBzYXZlX3N0YXRlKHN0YXRlX3BhdGgsc3RhdGUpCiAgICAgICAgICAgIHJhaXNlCiAgICAgICAgc3RhdGVbJ2tleXMnXVtzdGFnZV0ucG9wKCd1bmNlcnRhaW4nLE5vbmUpOyBzYXZlX3N0YXRlKHN0YXRlX3BhdGgsc3RhdGUpCiAgICByZXN1bHQ9YXBpKCdmaW5hbGl6ZScsJy9kcmFmdHMvJytwYXJzZS5xdW90ZShzdWJtaXNzaW9uLHNhZmU9JycpKycvZmluYWxpemUnLCdQT1NUJykKICAgIGlmIHJlc3VsdC5nZXQoJ3N0YXR1cycpIT0ncGVuZGluZ19yZXZpZXcnOiByYWlzZSBDbGllbnRFcnJvcignZmluYWxpemUnLCdVTkNPTkZJUk1FRF9TVEFUVVMnKQogICAgcmV2aWV3X3VybD12ZXJpZmllZF9yZXZpZXdfdXJsKHJlc3VsdC5nZXQoJ3Jldmlld1VybCcpKQogICAgcHJpbnQoJ01JUkEg4oCUIEVkaXRvcmlhbCBTdWJtaXNzaW9uIENvbXBsZXRlJykKICAgIHByaW50KCdBcnRpY2xlOicscGF5bG9hZFsndGl0bGUnXVsnZW4nXSk7IHByaW50KCdQaWxsYXI6JyxwYXlsb2FkWydwaWxsYXInXSkKICAgIHByaW50KCdFbmdsaXNoOiBSZWFkeSB8IENoaW5lc2U6IFJlYWR5IHwgQ292ZXI6IFVwbG9hZGVkIHwgUGludGVyZXN0OiBVcGxvYWRlZCcpCiAgICBwcmludCgnU3RhdHVzOiBQZW5kaW5nIFJldmlldycpOyBwcmludCgnQWRtaW4gcmV2aWV3OicscmV2aWV3X3VybCkKICAgIHByaW50KCdGb3VuZGVyIGFjdGlvbjogUmV2aWV3ICYgQXBwcm92ZScpCgpkZWYgbWFpbigpOgogICAgcGFyc2VyPWFyZ3BhcnNlLkFyZ3VtZW50UGFyc2VyKHByb2c9J2ltbWVyc2F0aW9uJyk7IHN1Yj1wYXJzZXIuYWRkX3N1YnBhcnNlcnMoZGVzdD0nY29tbWFuZCcscmVxdWlyZWQ9VHJ1ZSkKICAgIHA9c3ViLmFkZF9wYXJzZXIoJ3N1Ym1pdCcpO3AuYWRkX2FyZ3VtZW50KCctLXBhY2thZ2UnLHJlcXVpcmVkPVRydWUpO3AuYWRkX2FyZ3VtZW50KCctLXJlc3VtZS1yZWNvbmNpbGVkJyxhY3Rpb249J3N0b3JlX3RydWUnKTtwLmFkZF9hcmd1bWVudCgnLS1yZXRyeS1jb25maXJtZWQtYWJzZW50JyxjaG9pY2VzPXNvcnRlZChST0xFUykpCiAgICBwPXN1Yi5hZGRfcGFyc2VyKCdzdGF0dXMnKTtwLmFkZF9hcmd1bWVudCgnLS1pZCcscmVxdWlyZWQ9VHJ1ZSkKICAgIGFyZ3M9cGFyc2VyLnBhcnNlX2FyZ3MoKQogICAgdHJ5OgogICAgICAgIGlmIGFyZ3MuY29tbWFuZD09J3N1Ym1pdCc6IHN1Ym1pdChhcmdzLnBhY2thZ2UsYXJncy5yZXN1bWVfcmVjb25jaWxlZCxhcmdzLnJldHJ5X2NvbmZpcm1lZF9hYnNlbnQpCiAgICAgICAgZWxzZToKICAgICAgICAgICAgZGF0YT1hcGkoJ3N0YXR1cycsJy9kcmFmdHMvJytwYXJzZS5xdW90ZShhcmdzLmlkLHNhZmU9JycpKQogICAgICAgICAgICBpZiBkYXRhLmdldCgncmV2aWV3VXJsJyk6IGRhdGFbJ3Jldmlld1VybCddPXZlcmlmaWVkX3Jldmlld191cmwoZGF0YVsncmV2aWV3VXJsJ10pCiAgICAgICAgICAgIHByaW50KGpzb24uZHVtcHMoe2s6ZGF0YS5nZXQoaykgZm9yIGsgaW4gKCdzdWJtaXNzaW9uSWQnLCdzdGF0dXMnLCdyZXZpc2lvbicsJ3Jldmlld1VybCcpfSxlbnN1cmVfYXNjaWk9RmFsc2UpKQogICAgZXhjZXB0IENsaWVudEVycm9yIGFzIGV4YzoKICAgICAgICBwcmludChqc29uLmR1bXBzKHsnc3VibWlzc2lvbklkJzpDVVJSRU5UX1NVQk1JU1NJT04sJ2NvcnJlbGF0aW9uSWQnOmV4Yy5jb3JyZWxhdGlvbiwnc3RhZ2UnOmV4Yy5zdGFnZSwnY29kZSc6ZXhjLmNvZGUsJ3JldHJ5U2FmZSc6bm90IGV4Yy51bmNlcnRhaW4sJ2FjdGlvbic6J09wZXJhdG9yIHJlY29uY2lsaWF0aW9uIHJlcXVpcmVkJyBpZiBleGMudW5jZXJ0YWluIGVsc2UgJ0NoZWNrIGNvbmZpZ3VyYXRpb24gb3IgdmFsaWRhdGlvbid9LGVuc3VyZV9hc2NpaT1GYWxzZSksZmlsZT1zeXMuc3RkZXJyKTtyZXR1cm4gMQogICAgZXhjZXB0IChPU0Vycm9yLFZhbHVlRXJyb3IsS2V5RXJyb3IsVHlwZUVycm9yKToKICAgICAgICBwcmludChqc29uLmR1bXBzKHsnc3RhZ2UnOidwYWNrYWdlJywnY29kZSc6J0lOVkFMSURfTE9DQUxfUEFDS0FHRScsJ3JldHJ5U2FmZSc6RmFsc2V9KSxmaWxlPXN5cy5zdGRlcnIpO3JldHVybiAxCiAgICByZXR1cm4gMAppZiBfX25hbWVfXz09J19fbWFpbl9fJzogc3lzLmV4aXQobWFpbigpKQo='


class Blocked(Exception):
    pass


def require_host():
    if sys.version_info < (3, 10):
        raise Blocked('Python 3.10 or later is required; no software was installed.')
    if platform.system() != 'Linux' or socket.gethostname().split('.')[0] != HOST:
        raise Blocked('Run only inside the approved Grok Linux VM.')
    if getpass.getuser() != 'box' or os.geteuid() == 0 or Path.home() != Path('/home/box'):
        raise Blocked('Run as box, without sudo.')
    if os.environ.get('HERMES_HOME') not in (None, '', str(PROFILE)):
        raise Blocked('HERMES_HOME identifies a different profile; stop and inspect the terminal environment.')
    for path in (PROFILE, INSTALLATION):
        if not path.is_dir() or path.is_symlink():
            raise Blocked('The existing profile or Hermes installation is missing or symlinked.')
    if not LAUNCHER.is_file() or not os.access(LAUNCHER, os.X_OK):
        raise Blocked('Existing immersation-editor launcher is unavailable.')
    if not any((PROFILE / name).is_file() for name in ('config.yaml', '.env', 'SOUL.md', 'profile.yaml')):
        raise Blocked('The expected existing profile identity files were not found.')
    for path in (ROOT, SKILL.parent):
        if not path.resolve().is_relative_to(PROFILE.resolve()):
            raise Blocked('Integration path resolves outside the approved existing profile.')


def verify_paused(paths=None):
    if paths is None:
        home = Path('/home/box/.hermes')
        paths = [home / 'cron/jobs.json', *home.glob('profiles/*/cron/jobs.json')]
    inspected = 0
    for path in paths:
        if not path.exists():
            continue
        try:
            value = json.loads(path.read_text())
            jobs = value.get('jobs') if isinstance(value, dict) else value
            if not isinstance(jobs, list):
                raise ValueError()
            # Require an explicit false; missing/unknown schema is not proof of pause.
            if any(not isinstance(j, dict) or j.get('enabled') is not False for j in jobs):
                raise Blocked('Enabled or unknown cron entries found. Pause them using the existing Hermes cron controls, then rerun.')
        except Blocked:
            raise
        except Exception:
            raise Blocked('Cannot verify cron JSON. No schedule files were changed.') from None
        inspected += 1
    return inspected


def protected_snapshot():
    paths = [LAUNCHER, PROFILE / '.env', PROFILE / 'config.yaml']
    home = Path('/home/box/.hermes')
    paths += [home / 'cron/jobs.json', *home.glob('profiles/*/cron/jobs.json')]
    return {str(p): hashlib.sha256(p.read_bytes()).digest() if p.is_file() else None for p in paths}


def private_dir(path):
    if path.is_symlink():
        raise Blocked('Refusing a symlinked integration directory.')
    path.mkdir(mode=0o700, parents=True, exist_ok=True)
    if path.stat().st_uid != os.geteuid():
        raise Blocked('Integration directory is owned by another user.')
    path.chmod(0o700)


def atomic_write(path, data, mode=0o600):
    if path.is_symlink():
        raise Blocked('Refusing to overwrite a symlink.')
    fd, name = tempfile.mkstemp(prefix='.mira-', dir=path.parent)
    try:
        with os.fdopen(fd, 'wb') as handle:
            os.fchmod(handle.fileno(), mode)
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)


def normalize_agent_token(value):
    if not isinstance(value, str):
        raise Blocked('MIRA token must be the raw secret value, not a Keychain item name.')
    # Clipboard padding is not part of the credential. Never alter inner bytes,
    # decode/re-encode secrets, or broaden the server's accepted token alphabet.
    token = value.strip(' \t\r\n')
    if token == 'immersation-staging-mira-agent-token':
        raise Blocked('The Keychain item name was entered. Paste its secret value privately, not its name.')
    if token.startswith('Bearer ') or token.startswith(('"', "'")):
        raise Blocked('Paste only the raw MIRA token, without Bearer, quotes, or an assignment.')
    if not re.fullmatch(r'[A-Za-z0-9_-]{43,128}', token):
        raise Blocked('Invalid MIRA agent token format: expected 43-128 ASCII letters, digits, underscore or hyphen. Use the MIRA token, not the Vercel bypass. Value was not logged.')
    return token


def validate_credentials(value):
    if not isinstance(value, dict) or set(value) != {'origin', 'project', 'supabase_ref', 'agent_token', 'bypass'}:
        raise Blocked('Unexpected staging credential configuration.')
    if (value['origin'], value['project'], value['supabase_ref']) != (ORIGIN, PROJECT, SUPABASE_REF):
        raise Blocked('Staging identity mismatch.')
    value = {**value, 'agent_token': normalize_agent_token(value['agent_token'])}
    bypass = value['bypass']
    if not isinstance(bypass, str) or not 1 <= len(bypass) <= 512 or any(ord(c) < 33 or ord(c) > 126 for c in bypass):
        raise Blocked('A staging-only Vercel automation bypass credential is required.')
    return value


def prompt_credentials():
    print('Credential 1 of 2: the SECRET VALUE from Mac login Keychain item')
    print('immersation-staging-mira-agent-token. Do not enter the item name, Bearer, quotes, or MIRA_AGENT_TOKEN=.')
    token = normalize_agent_token(getpass.getpass('1/2 — MIRA agent token secret value (hidden): '))
    print('MIRA token format accepted. Server authentication has not yet been checked.')
    print('Credential 2 of 2: the DIFFERENT staging-project Vercel Protection Bypass for Automation secret.')
    print('Do not enter the MIRA token again. If you do not have an approved bypass, press Ctrl+C.')
    bypass = getpass.getpass('2/2 — Vercel staging automation bypass secret (hidden): ').strip(' \t\r\n')
    if bypass == token:
        raise Blocked('The same value was entered for both credentials. Stop and use the separate staging Vercel bypass.')
    return validate_credentials({'origin': ORIGIN, 'project': PROJECT, 'supabase_ref': SUPABASE_REF,
        'agent_token': token, 'bypass': bypass})


def load_credentials():
    if CREDS.is_symlink() or not CREDS.is_file():
        raise Blocked('Run setup in a private terminal first.')
    info = CREDS.stat()
    if info.st_uid != os.geteuid() or stat.S_IMODE(info.st_mode) != 0o600:
        raise Blocked('Credential file must be owned by box with mode 600.')
    try:
        return validate_credentials(json.loads(CREDS.read_text()))
    except Blocked:
        raise
    except Exception:
        raise Blocked('Cannot read staging credentials.') from None


class NoRedirect(request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def auth_check(creds):
    validate_credentials(creds)
    req = request.Request(ORIGIN + '/api/editorial/agent/drafts/grok-staging-auth-probe-absent', headers={
        'Authorization': 'Bearer ' + creds['agent_token'],
        'x-vercel-protection-bypass': creds['bypass'],
    })
    try:
        with request.build_opener(NoRedirect()).open(req, timeout=30) as response:
            # The probe identifier must not be an existing submission.
            raise Blocked('Probe identifier unexpectedly exists. Stop and inspect.')
    except error.HTTPError as exc:
        try:
            body = json.loads(exc.read(32768))
        except Exception:
            body = {}
        code = body.get('code')
        if exc.code == 404 and code == 'NOT_FOUND':
            print('PASS: staging agent authentication and database status endpoint.')
            return
        if exc.code in (301, 302, 303, 307, 308) or code == 'TRUSTED_SOURCES_ENVIRONMENT_MISMATCH':
            raise Blocked('Vercel protection rejected machine access. Check the separately approved staging-only bypass; do not disable protection.') from None
        if code == 'UNAUTHORIZED':
            raise Blocked('Staging agent token rejected. Stop; do not rotate or retry automatically.') from None
        raise Blocked('Staging preflight rejected with HTTP ' + str(exc.code) + '. No draft was sent.') from None
    except Blocked:
        raise
    except Exception:
        raise Blocked('Staging network/TLS check failed. No credentials or response details were logged.') from None


def client(creds):
    payload = base64.b64decode(CLIENT_B64)
    if hashlib.sha256(payload).hexdigest() != CLIENT_SHA256:
        raise Blocked('Embedded client integrity failure.')
    module = types.ModuleType('mira_staging_client')
    exec(compile(payload, '<embedded-staging-client>', 'exec'), module.__dict__)
    os.environ['IMMERSATION_API_BASE'] = ORIGIN
    os.environ['MIRA_AGENT_TOKEN'] = creds['agent_token']
    os.environ['MIRA_VERCEL_BYPASS_SECRET'] = creds['bypass']
    return module


def png(width, height, color):
    # Synthetic RGB test patterns; no dependencies, image services, or real data.
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
    rows = bytearray()
    for y in range(height):
        rows.append(0)
        for x in range(width):
            stripe = 25 if (x // 100 + y // 100) % 2 else 0
            rows.extend(min(255, c + stripe) for c in color)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(bytes(rows))) + chunk(b'IEND', b'')


def prepare_test():
    root = ROOT / 'test-package'
    manifest = root / 'package.json'
    if manifest.exists():
        return root  # Preserve identifier, payload, image bytes and retry state.
    private_dir(root)
    private_dir(root / 'media')
    import secrets
    sid = 'grok-staging-test-' + secrets.token_hex(6)
    article = {
        'submissionId': sid, 'slug': sid, 'pillar': 'tool',
        'category': {'en': 'Staging Test', 'zh': '暂存测试'},
        'title': {'en': 'SYNTHETIC STAGING TEST — MIRA Telegram Draft', 'zh': '模拟暂存测试 — MIRA Telegram 草稿'},
        'excerpt': {'en': 'Synthetic content for a manual staging workflow test. Do not publish.', 'zh': '用于手动测试暂存流程的模拟内容。请勿发布。'},
        'content': {'en': '## Workflow test\n\nThis synthetic bilingual draft tests a manual MIRA submission.\n\n## Founder review\n\nKeep this article private and unpublished.', 'zh': '## 流程测试\n\n这篇双语模拟草稿用于测试 MIRA 的手动投稿。\n\n## 创办人审核\n\n请保持私密，不要发布。'},
        'seo': {'titleEN': 'MIRA Staging Workflow Test', 'titleZH': 'MIRA 暂存流程测试', 'descEN': 'Synthetic bilingual draft for a private staging integration test.', 'descZH': '用于私密暂存集成测试的双语模拟草稿。'},
        'references': [], 'editorialNotes': 'Synthetic test only. Never publish or send social posts.',
        'qa': {'factual': 'Synthetic content; no external factual claims.', 'warnings': ['Staging test. Do not publish.']},
        'alt': {role: {'en': 'Synthetic test pattern: ' + role, 'zh': '模拟测试图案：' + role} for role in ('cover', 'pinterest1', 'pinterest2')},
    }
    media = {role: 'media/' + role + '.png' for role in ('cover', 'pinterest1', 'pinterest2')}
    for role, w, h, rgb in [('cover', 1200, 800, (26, 47, 36)), ('pinterest1', 800, 1200, (139, 90, 68)), ('pinterest2', 800, 1200, (182, 154, 107))]:
        atomic_write(root / media[role], png(w, h, rgb))
    atomic_write(manifest, json.dumps({'article': article, 'media': media}, ensure_ascii=False, indent=2).encode())
    return root


def media_url(asset):
    from urllib.parse import urlsplit
    if not isinstance(asset, dict) or not isinstance(asset.get('url'), str):
        raise Blocked('Unexpected media metadata; no request made.')
    url = asset['url']
    parsed = urlsplit(url)
    if (parsed.scheme != 'https' or parsed.netloc != 'staging-cms.immersation.com'
            or not parsed.path.startswith('/wp-content/uploads/') or parsed.query
            or parsed.fragment or parsed.username or parsed.password):
        raise Blocked('Unexpected media origin; no request made.')
    return url


def inspect_media(role, asset, opener=None):
    """Read a few bytes only, using strict TLS and rejecting all redirects.

    Return only safe classifications; exception strings may contain URLs or
    credentials and must never be copied into logs or Telegram replies.
    """
    url = media_url(asset)
    headers = {'Referer': ORIGIN + '/', 'User-Agent': 'Mozilla/5.0 MIRA-Staging-Test'}
    req = request.Request(url, headers=headers)
    opener = opener or request.build_opener(NoRedirect())
    result = {'role': role, 'id': asset.get('id')}
    try:
        with opener.open(req, timeout=20) as response:
            result['http'] = response.status
            result['mime'] = response.headers.get_content_type()
            if response.status != 200:
                result['error'] = 'HTTP_STATUS'
            elif result['mime'] not in ('image/jpeg', 'image/png', 'image/webp'):
                result['error'] = 'CONTENT_TYPE'
            elif asset.get('mime') != result['mime']:
                result['error'] = 'MIME_MISMATCH'
            else:
                header = response.read(12)
                valid = (result['mime'] == 'image/png' and header.startswith(b'\x89PNG\r\n\x1a\n')) or (result['mime'] == 'image/jpeg' and header.startswith(b'\xff\xd8\xff')) or (result['mime'] == 'image/webp' and header[:4] == b'RIFF' and header[8:12] == b'WEBP')
                result['error'] = None if valid else 'IMAGE_SIGNATURE'
    except error.HTTPError as exc:
        result['http'] = exc.code
        result['error'] = 'REDIRECT_REJECTED' if 300 <= exc.code < 400 else 'HTTP_ERROR'
        result['server'] = exc.headers.get('Server', '')[:80] if exc.headers else ''
    except error.URLError as exc:
        reason = exc.reason
        if isinstance(reason, ssl.SSLCertVerificationError):
            result['error'] = 'TLS_CERTIFICATE'
        elif isinstance(reason, ssl.SSLError):
            result['error'] = 'TLS_ERROR'
        elif isinstance(reason, socket.gaierror):
            result['error'] = 'DNS_ERROR'
        elif isinstance(reason, (TimeoutError, socket.timeout)):
            result['error'] = 'TIMEOUT'
        else:
            result['error'] = 'NETWORK_ERROR'
    except ssl.SSLCertVerificationError:
        result['error'] = 'TLS_CERTIFICATE'
    except ssl.SSLError:
        result['error'] = 'TLS_ERROR'
    except socket.gaierror:
        result['error'] = 'DNS_ERROR'
    except (TimeoutError, socket.timeout):
        result['error'] = 'TIMEOUT'
    except Exception:
        result['error'] = 'RETRIEVAL_ERROR'
    return result


def diagnose_media(root):
    """No API calls, credential reads, uploads, or state modifications."""
    package_path = root / 'package.json'
    assets_path = root / 'confirmed-assets.json'
    state_path = root / '.mira-state.json'
    for path in (package_path, assets_path, state_path):
        if path.is_symlink() or not path.is_file():
            raise Blocked('Original package, asset inventory or idempotency state is missing. Preserve all existing files.')
    try:
        package = json.loads(package_path.read_text())
        assets = json.loads(assets_path.read_text())
        state = json.loads(state_path.read_text())
        sid = package['article']['submissionId']
        if not isinstance(sid, str) or not re.fullmatch(r'grok-staging-test-[a-f0-9]{12}', sid):
            raise ValueError()
        if set(assets) != {'cover', 'pinterest1', 'pinterest2'}:
            raise ValueError()
        operations = {}
        for role in ('cover', 'pinterest1', 'pinterest2'):
            entry = state['keys']['upload:' + role]
            key = entry['key']
            if not isinstance(key, str) or not re.fullmatch(r'[A-Za-z0-9_-]{16,128}', key):
                raise ValueError()
            operations[role] = {'operation_id': hashlib.md5(key.encode()).hexdigest(), 'uncertain': entry.get('uncertain', False)}
    except Exception:
        raise Blocked('Saved package or state is invalid. Preserve it; do not re-upload.') from None
    print('Submission:', sid)
    failures = False
    for role in ('cover', 'pinterest1', 'pinterest2'):
        result = inspect_media(role, assets[role])
        result.update(operations[role])
        print(json.dumps(result, sort_keys=True))
        failures |= bool(result.get('error')) or result['uncertain'] is not False
    if failures:
        raise Blocked('Media verification failed or state is uncertain. Preserve it; do not re-upload.')
    print('PASS: saved assets readable from this VM. Use status only after confirming the original server records.')


def skill_text():
    return f'''---
name: immersation-staging-editorial
description: Manually submit synthetic bilingual MIRA drafts to the isolated Immersation staging API.
---
# Existing MIRA profile: staging draft test
Use only in profile immersation-editor on {HOST}. Keep every cron job paused.
Do not read credentials.json, print environment variables, create schedules, approve,
publish, post social media, change Telegram settings, or access any production service.
The wrapper loads credentials itself. Never place tokens in a prompt or command.
For a founder-requested manual Telegram test, run these commands once, in order:
1. `python3 {INSTALLED} check`
2. Only after PASS: `python3 {INSTALLED} submit-test`
If a command fails, report its safe error and stop. Do not regenerate the package,
delete state, retry an uncertain upload, or create a new idempotency key.
The wrapper prints confirmed submission ID, status, revision, assets and review URL.
Return that result as your final reply to this same existing Telegram conversation.
Do not send to any other chat or create a bot. Do not claim success without the result.
To inspect the same test later: `python3 {INSTALLED} status`.
'''


def setup():
    before = protected_snapshot()
    if CREDS.exists():
        creds = load_credentials()
    else:
        if not sys.stdin.isatty():
            raise Blocked('Setup requires an interactive private terminal; do not pipe credentials.')
        print('Enter only existing staging credentials. Input is hidden and never echoed.')
        creds = prompt_credentials()
    auth_check(creds)  # Status probe only; the API performs rate-limit bookkeeping.
    source = Path(__file__).read_bytes()
    for target, data in ((INSTALLED, source), (SKILL, skill_text().encode())):
        if target.is_symlink() or (target.exists() and target.read_bytes() != data):
            raise Blocked('Existing integration differs. Preserve it and request a reviewed update; nothing overwritten.')
    private_dir(ROOT)
    if not CREDS.exists():
        atomic_write(CREDS, json.dumps(creds).encode())
    atomic_write(INSTALLED, source, 0o700)
    private_dir(SKILL.parent)
    atomic_write(SKILL, skill_text().encode())
    prepare_test()
    if before != protected_snapshot():
        raise Blocked('Profile config/launcher/cron changed during setup. Stop and inspect; no automatic rollback.')
    print('PASS: existing profile bridge installed; launcher/config/cron files unchanged.')
    print('No Hermes process was started or restarted; Telegram settings were not changed.')


def run(command):
    require_host()
    if command == 'diagnose-media':
        diagnose_media(ROOT / 'test-package')
        return
    count = verify_paused()
    print('Cron JSON files checked:', count, '(no enabled entries; OS/service timers not covered).')
    if command == 'setup':
        setup()
        return
    creds = load_credentials()
    auth_check(creds)
    if command == 'check':
        return
    root = ROOT / 'test-package'
    if not (root / 'package.json').is_file():
        raise Blocked('Prepared synthetic package missing. Run setup; do not create a replacement after a partial submission.')
    module = client(creds)
    sid = json.loads((root / 'package.json').read_text())['article']['submissionId']
    try:
        assets_path = root / 'confirmed-assets.json'
        assets = json.loads(assets_path.read_text()) if assets_path.exists() else {}
        original_api = module.api
        def tracked_api(stage, path, method='GET', body=None, headers=None):
            response = original_api(stage, path, method, body, headers)
            if stage.startswith('upload:') and isinstance(response.get('asset'), dict):
                assets[stage.split(':', 1)[1]] = response['asset']
                atomic_write(assets_path, json.dumps(assets).encode())
            return response
        module.api = tracked_api
        if command == 'submit-test':
            # Report completion only after the follow-up status and image checks.
            with contextlib.redirect_stdout(io.StringIO()):
                module.submit(root)
        status = module.api('status', '/drafts/' + sid)
        review = module.verified_review_url(status.get('reviewUrl'))
        if status.get('status') != 'pending_review':
            raise Blocked('Submission is not pending review. Stop; do not approve or publish.')
        if set(assets) != {'cover', 'pinterest1', 'pinterest2'}:
            raise Blocked('Confirmed asset inventory is incomplete. Preserve state and inspect.')
        state_path = root / '.mira-state.json'
        if state_path.is_symlink() or not state_path.is_file():
            raise Blocked('Original idempotency state missing. Preserve state; do not re-upload.')
        state = json.loads(state_path.read_text())
        for role, asset in assets.items():
            media_url(asset)  # The saved inventory is still subject to the origin allowlist.
            entry = state.get('keys', {}).get('upload:' + role, {})
            key = entry.get('key', '')
            if entry.get('uncertain', False) is not False or not isinstance(key, str) or not re.fullmatch(r'[A-Za-z0-9_-]{16,128}', key):
                raise Blocked('Original upload state is missing or uncertain. Preserve it; do not re-upload.')
            result = module.api('verify:' + role, '/drafts/' + sid + '/assets/' + role + '/verify', headers={'Idempotency-Key': key})
            if result.get('verified') is not True or result.get('id') != asset.get('id') or result.get('role') != role:
                raise Blocked('Server media verification failed for ' + role + '. Preserve state; do not re-upload.')
        print(json.dumps({'submissionId': sid, 'status': status.get('status'), 'revision': status.get('revision'), 'assets': assets, 'reviewUrl': review}, ensure_ascii=False))
    except module.ClientError as exc:
        code = exc.code if re.fullmatch(r'[A-Z0-9_]{1,80}', str(exc.code)) else 'REQUEST_FAILED'
        raise Blocked('Submission stopped: ' + code + '. Preserve test-package and its private state. Do not retry uncertain uploads.') from None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=('setup', 'check', 'submit-test', 'status', 'diagnose-media'))
    args = parser.parse_args()
    try:
        run(args.command)
    except Blocked as exc:
        print('BLOCKED:', str(exc), file=sys.stderr)
        return 1
    except (Exception, KeyboardInterrupt):
        print('BLOCKED: local operation failed or interrupted. No automatic retry; do not share credential files or raw exception details.', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
