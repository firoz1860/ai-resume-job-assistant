import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { findUserById } from '../services/authService.js';

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, error: 'Not authorized. Token missing.' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Not authorized. User not found.' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Not authorized. Token invalid.' });
  }
}

// Gate admin-only routes. Must run AFTER protect (which sets req.user).
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required.' });
  }
  next();
}

export async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) return next();

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await findUserById(decoded.id);
    if (user) req.user = user;
  } catch {
    // Public routes should continue to work even when an optional token is stale.
  }

  next();
}
