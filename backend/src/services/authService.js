import bcrypt from 'bcryptjs';
import { dbState } from '../config/db.js';
import User from '../models/User.js';

const memoryUsers = [];
const GUEST_EMAIL = 'guest@careeros.ai';
const GUEST_NAME = 'Guest User';
const USER_CACHE_TTL_MS = 60 * 1000;
const userCacheById = new Map();

function allowAuthMemoryFallback() {
  return process.env.ALLOW_AUTH_MEMORY_FALLBACK === 'true' || process.env.NODE_ENV === 'test';
}

function authDatabaseRequiredError() {
  const details = process.env.NODE_ENV === 'production' || !dbState.error ? '' : ` Current DB error: ${dbState.error}`;
  const err = new Error(`Authentication database is unavailable. Please connect MongoDB before signup or login.${details}`);
  err.status = 503;
  err.isOperational = true;
  return err;
}

function publicUser(user) {
  if (!user) return null;
  const raw = user.toObject ? user.toObject() : user;
  const { password, ...safe } = raw;
  safe._id = String(raw._id || raw.id);
  return safe;
}

function cachePublicUser(user) {
  const safe = publicUser(user);
  if (safe?._id) {
    userCacheById.set(String(safe._id), { user: safe, expiresAt: Date.now() + USER_CACHE_TTL_MS });
  }
  return safe;
}

function getCachedUser(id) {
  const cached = userCacheById.get(String(id));
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    userCacheById.delete(String(id));
    return null;
  }
  return cached.user;
}

export async function createUser({ name, email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  if (!dbState.isConnected && !allowAuthMemoryFallback()) {
    throw authDatabaseRequiredError();
  }

  if (dbState.isConnected) {
    const existing = await User.exists({ email: normalizedEmail });
    if (existing) {
      const err = new Error('User already exists.');
      err.status = 409;
      throw err;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: hashed });
    console.log(`[DB] User saved to MongoDB: ${normalizedEmail}`);
    return cachePublicUser(user);
  }

  console.warn(`[DB] User saved to memory fallback, not MongoDB: ${normalizedEmail}`);

  if (memoryUsers.some((user) => user.email === normalizedEmail)) {
    const err = new Error('User already exists.');
    err.status = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = { _id: Date.now().toString(), name: name.trim(), email: normalizedEmail, password: hashed, role: 'user', avatar: '', createdAt: new Date().toISOString() };
  memoryUsers.push(user);
  return cachePublicUser(user);
}

export async function validateUser(email, password) {
  const normalizedEmail = email.toLowerCase().trim();

  if (!dbState.isConnected && !allowAuthMemoryFallback()) {
    throw authDatabaseRequiredError();
  }

  if (dbState.isConnected) {
    const user = await User.findOne({ email: normalizedEmail }).select('+password').lean();
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password);
    return ok ? cachePublicUser(user) : null;
  }

  const user = memoryUsers.find((item) => item.email === normalizedEmail);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password);
  return ok ? cachePublicUser(user) : null;
}

export async function getOrCreateGuestUser() {
  if (dbState.isConnected) {
    const existing = await User.findOne({ email: GUEST_EMAIL });
    if (existing) return publicUser(existing);

    const hashed = await bcrypt.hash(`guest-${Date.now()}-${Math.random()}`, 10);
    const user = await User.create({
      name: GUEST_NAME,
      email: GUEST_EMAIL,
      password: hashed,
      role: 'user',
    });
    console.log(`[DB] Guest user saved to MongoDB: ${GUEST_EMAIL}`);
    return publicUser(user);
  }

  let user = memoryUsers.find((item) => item.email === GUEST_EMAIL);
  if (!user) {
    const hashed = await bcrypt.hash(`guest-${Date.now()}-${Math.random()}`, 10);
    user = {
      _id: 'guest-user',
      name: GUEST_NAME,
      email: GUEST_EMAIL,
      password: hashed,
      role: 'user',
      avatar: '',
      createdAt: new Date().toISOString(),
    };
    memoryUsers.push(user);
    console.warn(`[DB] Guest user saved to memory fallback, not MongoDB: ${GUEST_EMAIL}`);
  }

  return publicUser(user);
}

export async function findUserById(id) {
  const cached = getCachedUser(id);
  if (cached) return cached;

  if (dbState.isConnected) {
    const user = await User.findById(id).lean();
    return cachePublicUser(user);
  }
  return cachePublicUser(memoryUsers.find((user) => String(user._id) === String(id)));
}
