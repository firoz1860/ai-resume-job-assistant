// Test-only environment bootstrap.
//
// src/config/env.js intentionally refuses to load without AI_API_KEY (and, in
// production, JWT_SECRET). Unit tests don't call the real AI provider, so this
// preload supplies non-secret dummy values before any module imports the
// config. Loaded via `node --test --import ./test/setup.mjs`.
//
// These are NOT real credentials and must never be used outside tests.
// NODE_ENV is intentionally left untouched — individual tests control the
// database/memory-fallback behaviour themselves.
if (!process.env.AI_API_KEY) process.env.AI_API_KEY = 'test-only-not-a-real-key';
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'test-only-jwt-secret';
