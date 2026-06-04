import { createUser, validateUser, findUserById, getOrCreateGuestUser } from '../services/authService.js';
import { generateToken } from '../utils/generateToken.js';

function authResponse(res, user, message, status = 200) {
  return res.status(status).json({ success: true, message, data: { user, token: generateToken(user._id) } });
}

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }
    const user = await createUser({ name, email, password });
    return authResponse(res, user, 'Account created successfully.', 201);
  } catch (err) {
    if (err.code === 11000 || err.status === 409) return res.status(409).json({ success: false, error: 'User already exists.' });
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }
    const user = await validateUser(email, password);
    if (!user) return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    return authResponse(res, user, 'Login successful.');
  } catch (err) {
    next(err);
  }
}

export async function guestLogin(req, res, next) {
  try {
    const user = await getOrCreateGuestUser();
    return authResponse(res, user, 'Guest login successful.');
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  const user = await findUserById(req.user._id);
  res.json({ success: true, message: 'Current user.', data: { user } });
}

export function logout(req, res) {
  res.json({ success: true, message: 'Logged out.', data: null });
}
