import { dbState } from '../config/db.js';
import GeneratedContent from '../models/GeneratedContent.js';

function normalizeGeneratedContent(item) {
  const data = item?.toObject ? item.toObject() : item;
  return { ...data, id: String(data._id || data.id) };
}

export async function listGeneratedContent(req, res) {
  if (!dbState.isConnected) {
    return res.json({ success: true, data: [] });
  }

  const items = await GeneratedContent.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  res.json({ success: true, data: items.map(normalizeGeneratedContent) });
}

export async function deleteGeneratedContent(req, res) {
  if (!dbState.isConnected) {
    return res.status(404).json({ success: false, error: 'Generated content not found.' });
  }

  const deleted = await GeneratedContent.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!deleted) return res.status(404).json({ success: false, error: 'Generated content not found.' });

  res.json({ success: true, data: normalizeGeneratedContent(deleted) });
}
