import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { dbState } from '../config/db.js';
import CareerProfile from '../models/CareerProfile.js';
import ResumeVersion from '../models/ResumeVersion.js';
import { buildResumeDiff, parseResumeText } from '../utils/resumeParser.js';

const memoryVersions = [];

function normalizeVersion(version) {
  const data = version?.toObject ? version.toObject() : version;
  return { ...data, id: String(data._id || data.id) };
}

async function extractText(file) {
  if (!file) return '';
  if (file.mimetype === 'application/pdf' || file.originalname?.toLowerCase().endsWith('.pdf')) {
    const parser = new PDFParse({ data: file.buffer });
    try {
      const parsed = await parser.getText();
      return parsed.text || '';
    } finally {
      await parser.destroy();
    }
  }
  if (
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    || file.originalname?.toLowerCase().endsWith('.docx')
  ) {
    const parsed = await mammoth.extractRawText({ buffer: file.buffer });
    return parsed.value || '';
  }
  return file.buffer.toString('utf8');
}

export async function parseResume(req, res) {
  const text = req.body?.text?.trim() || await extractText(req.file);
  if (!text || text.length < 40) {
    return res.status(400).json({ success: false, error: 'Upload a readable PDF/DOCX/TXT resume or paste resume text.' });
  }

  const parsed = parseResumeText(text);
  res.json({ success: true, message: 'Resume parsed.', data: parsed });
}

export async function applyParsedResume(req, res) {
  const parsed = parseResumeText(req.body?.rawText || req.body?.text || '');
  if (!parsed.rawText) return res.status(400).json({ success: false, error: 'Resume text is required.' });

  if (dbState.isConnected) {
    const profile = await CareerProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        resumeText: parsed.summary,
        skills: parsed.skills,
        education: parsed.education,
        projects: parsed.projects,
        experience: parsed.experience,
        certifications: parsed.certifications,
        achievements: parsed.achievements,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();
    return res.json({ success: true, message: 'Parsed resume applied to profile.', data: { profile, parsed } });
  }

  res.json({ success: true, message: 'Parsed resume ready in fallback mode.', data: { parsed } });
}

export async function listResumeVersions(req, res) {
  if (dbState.isConnected) {
    const versions = await ResumeVersion.find({ userId: req.user._id }).sort({ updatedAt: -1 }).limit(30).lean();
    return res.json({ success: true, data: versions.map(normalizeVersion) });
  }

  res.json({ success: true, data: memoryVersions.filter((item) => String(item.userId) === String(req.user._id)).reverse() });
}

export async function saveResumeVersion(req, res) {
  const payload = {
    userId: req.user._id,
    applicationId: req.body.applicationId || undefined,
    title: String(req.body.title || 'ATS Resume').trim(),
    targetRole: String(req.body.targetRole || '').trim(),
    companyName: String(req.body.companyName || '').trim(),
    sections: req.body.sections || {},
    source: req.body.source || 'builder',
  };

  if (dbState.isConnected) {
    const version = await ResumeVersion.create(payload);
    return res.status(201).json({ success: true, message: 'Resume version saved.', data: normalizeVersion(version) });
  }

  const version = { ...payload, id: Date.now().toString(), createdAt: new Date().toISOString() };
  memoryVersions.push(version);
  res.status(201).json({ success: true, message: 'Resume version saved in fallback mode.', data: version });
}

export async function resumeDiff(req, res) {
  const diff = buildResumeDiff(req.body?.original || '', req.body?.improved || '');
  res.json({ success: true, data: diff });
}
