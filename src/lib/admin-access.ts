export type AdminAccessState = 'checking' | 'authorized' | 'denied' | 'unavailable';

// A refreshed token for the same verified user should not unmount the dashboard.
export function requiresAdminRecheckReset(verifiedUserId: string | null, sessionUserId: string | null): boolean {
  return !sessionUserId || sessionUserId !== verifiedUserId;
}

export function adminAccessFromResponse(hasSession: boolean, status: number | null): AdminAccessState {
  if (!hasSession) return 'denied';
  if (status !== null && status >= 200 && status < 300) return 'authorized';
  if (status === 401 || status === 403) return 'denied';
  return 'unavailable';
}
