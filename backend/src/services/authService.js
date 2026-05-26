import bcrypt from 'bcryptjs';
import { dbState } from '../config/db.js';
import User from '../models/User.js';

const memoryUsers = [];

function publicUser(user) {
  if (!user) return null;
  const raw = user.toObject ? user.toObject() : user;
  const { password, ...safe } = raw;
  safe._id = String(raw._id || raw.id);
  return safe;
}

export async function createUser({ name, email, password }) {
  const normalizedEmail = email.toLowerCase().trim();
  const hashed = await bcrypt.hash(password, 10);

  if (dbState.isConnected) {
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

  const user = { _id: Date.now().toString(), name, email: normalizedEmail, password: hashed, role: 'user', avatar: '', createdAt: new Date().toISOString() };
  memoryUsers.push(user);
  return publicUser(user);
}

export async function validateUser(email, password) {
  const normalizedEmail = email.toLowerCase().trim();

  if (dbState.isConnected) {
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password);
    return ok ? publicUser(user) : null;
  }

  const user = memoryUsers.find((item) => item.email === normalizedEmail);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password);
  return ok ? publicUser(user) : null;
}

export async function findUserById(id) {
  if (dbState.isConnected) {
    const user = await User.findById(id);
    return publicUser(user);
  }
  return publicUser(memoryUsers.find((user) => String(user._id) === String(id)));
}
