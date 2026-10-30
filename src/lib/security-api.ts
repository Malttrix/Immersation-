import { supabase } from './supabase';
export async function secureFetch(input: string, init: RequestInit = {}) {
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  const headers = new Headers(init.headers);
  if (session) headers.set('Authorization', `Bearer ${session.access_token}`);
  return fetch(input, { ...init, headers, credentials: 'same-origin' });
}
export async function loadLibrary() {
  const response = await secureFetch('/api/entitlements');
  if (!response.ok) return [];
  return (await response.json()).books as string[];
}
