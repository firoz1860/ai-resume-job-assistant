import bcrypt from 'bcryptjs';
import { dbState } from '../config/db.js';
import User from '../models/User.js';

const memoryUsers = [];
const GUEST_EMAIL = 'guest@careeros.ai';
const GUEST_NAME = 'Guest User';

function publicUser(user) {
  if (!user) return null;
  const raw = user.toObject ? user.toObject() : user;
  const { password, ...safe } = raw;
  safe._id = String(raw._id || raw.id);
  return safe;
}

export async function createUser({ name, email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  if (dbState.isConnected) {
    const existing = await User.exists({ email: normalizedEmail });
    if (existing) {
      const err = new Error('User already exists.');
      err.status = 409;
      throw err;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: normalizedEmail, password: hashed });
    console.log(`[DB] User saved to MongoDB: ${normalizedEmail}`);
    return publicUser(user);
  }

  console.warn(`[DB] User saved to memory fallback, not MongoDB: ${normalizedEmail}`);

  if (memoryUsers.some((user) => user.email === normalizedEmail)) {
    const err = new Error('User already exists.');
    err.status = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = { _id: Date.now().toString(), name, email: normalizedEmail, password: hashed, role: 'user', avatar: '', createdAt: new Date().toISOString() };
  memoryUsers.push(user);
  return publicUser(user);
}

export async function validateUser(email, password) {
  const normalizedEmail = email.toLowerCase().trim();

  if (dbState.isConnected) {
    const users = await User.find({ email: normalizedEmail }).select('+password').sort({ createdAt: -1 });
    for (const user of users) {
      const ok = await bcrypt.compare(password, user.password);
      if (ok) return publicUser(user);
    }
    return null;
  }

  const user = memoryUsers.find((item) => item.email === normalizedEmail);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password);
  return ok ? publicUser(user) : null;
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
  if (dbState.isConnected) {
    const user = await User.findById(id);
    return publicUser(user);
  }
  return publicUser(memoryUsers.find((user) => String(user._id) === String(id)));
}
