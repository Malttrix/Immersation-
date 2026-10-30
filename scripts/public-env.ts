/** Fail the build before Vite can substitute server credentials into public JavaScript. */
export function assertPublicEnvironment(env: Record<string,string>) {
  for (const [name,value] of Object.entries(env)) {
    if (!name.startsWith('VITE_') || !value) continue;
    if (/SECRET|SERVICE_ROLE|PASSWORD|PRIVATE|SENDFOX|GEMINI.*KEY/i.test(name) || /^(sk_(live|test)_|whsec_|sb_secret_)/.test(value)) throw new Error('Server credentials cannot use VITE_ environment variables.');
    if (name === 'VITE_SUPABASE_ANON_KEY' && value.startsWith('eyJ')) {
      let role = '';
      try { role = JSON.parse(Buffer.from(value.split('.')[1],'base64url').toString()).role; } catch { throw new Error('Invalid public Supabase key.'); }
      if (role !== 'anon') throw new Error('The browser Supabase key must have the anon role.');
    }
  }
}
