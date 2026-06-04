import assert from 'node:assert/strict';
import test from 'node:test';
import { createUser, validateUser } from '../src/services/authService.js';

process.env.ALLOW_AUTH_MEMORY_FALLBACK = 'true';

test('created users can login again with the same credentials', async () => {
  const email = `auth-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
  const password = 'secret123';

  const created = await createUser({ name: 'Auth Test User', email, password });
  assert.equal(created.email, email);
  assert.equal(created.password, undefined);

  const loggedIn = await validateUser(email, password);
  assert.equal(loggedIn.email, email);
  assert.equal(loggedIn.password, undefined);

  const rejected = await validateUser(email, 'wrong-password');
  assert.equal(rejected, null);
});

test('auth rejects signup when database is unavailable and memory fallback is not explicitly enabled', async () => {
  process.env.ALLOW_AUTH_MEMORY_FALLBACK = 'false';

  await assert.rejects(
    createUser({ name: 'No DB User', email: `no-db-${Date.now()}@example.com`, password: 'secret123' }),
    (err) => err.status === 503 && err.isOperational === true
  );

  process.env.ALLOW_AUTH_MEMORY_FALLBACK = 'true';
});
