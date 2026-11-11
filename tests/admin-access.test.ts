import test from 'node:test';
import assert from 'node:assert/strict';
import {adminAccessFromResponse, requiresAdminRecheckReset} from '../src/lib/admin-access';

test('session refresh keeps only the same verified admin mounted', () => {
  assert.equal(requiresAdminRecheckReset('admin-1', 'admin-1'), false);
  assert.equal(requiresAdminRecheckReset('admin-1', 'admin-2'), true);
  assert.equal(requiresAdminRecheckReset('admin-1', null), true);
  assert.equal(requiresAdminRecheckReset(null, 'admin-1'), true);
});

test('only a successful admin response grants access; network errors are not denials', () => {
  assert.equal(adminAccessFromResponse(true, 200), 'authorized');
  assert.equal(adminAccessFromResponse(true, 403), 'denied');
  assert.equal(adminAccessFromResponse(true, 401), 'denied');
  assert.equal(adminAccessFromResponse(false, null), 'denied');
  assert.equal(adminAccessFromResponse(true, 503), 'unavailable');
  assert.equal(adminAccessFromResponse(true, null), 'unavailable');
});
