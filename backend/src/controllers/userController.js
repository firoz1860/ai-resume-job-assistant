import { dbState } from '../config/db.js';
import CareerProfile from '../models/CareerProfile.js';

let memoryProfiles = [];

export async function getProfile(req, res) {
  if (dbState.isConnected) {
    const profile = await CareerProfile.findOne({ userId: req.user._id }).lean();
    return res.json({ success: true, message: 'Profile loaded.', data: profile || { userId: req.user._id } });
  }

  const profile = memoryProfiles.find((item) => item.userId === req.user._id) || { userId: req.user._id };
  res.json({ success: true, message: 'Profile loaded.', data: profile });
}

export async function updateProfile(req, res) {
  if (dbState.isConnected) {
    const profile = await CareerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { userId: req.user._id, ...req.body },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return res.json({ success: true, message: 'Profile updated.', data: profile });
  }

  const existingIndex = memoryProfiles.findIndex((item) => item.userId === req.user._id);
  const profile = { userId: req.user._id, ...req.body, updatedAt: new Date().toISOString() };
  if (existingIndex >= 0) memoryProfiles[existingIndex] = { ...memoryProfiles[existingIndex], ...profile };
  else memoryProfiles.push(profile);
  res.json({ success: true, message: 'Profile updated.', data: profile });
}
