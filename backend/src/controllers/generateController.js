import { buildPrompt, enforceContentType } from '../utils/buildPrompt.js';
import { generateContent } from '../services/aiService.js';
import { dbState } from '../config/db.js';
import GeneratedContent from '../models/GeneratedContent.js';

const VALID_CONTENT_TYPES = [
  'Resume Summary',
  'Cover Letter',
  'Cold Email',
  'LinkedIn Message',
  'Tell Me About Yourself',
  'Project Explanation',
  'Follow-up Email',
  'Referral Request',
  'GitHub README Bio',
  'LinkedIn About Section',
];

const VALID_TONES = ['Professional', 'Confident', 'Fresher Friendly', 'Concise', 'Humanized', 'Impact-focused'];

export async function generate(req, res, next) {
  try {
    const { fullName, education, skills, projects, experience, targetRole, companyName, jobDescription, contentType, tone } = req.body;

    if (!fullName?.trim()) return res.status(400).json({ success: false, error: 'Full name is required.' });
    if (!education?.trim()) return res.status(400).json({ success: false, error: 'Education is required.' });
    if (!skills?.trim()) return res.status(400).json({ success: false, error: 'Skills are required.' });
    if (!targetRole?.trim()) return res.status(400).json({ success: false, error: 'Target role is required.' });
    if (!contentType || !VALID_CONTENT_TYPES.includes(contentType)) {
      return res.status(400).json({ success: false, error: 'Invalid or missing content type.' });
    }
    if (!tone || !VALID_TONES.includes(tone)) {
      return res.status(400).json({ success: false, error: 'Invalid or missing tone.' });
    }

    console.log(`[Generate] contentType="${contentType}", tone="${tone}"`);

    const promptSpec = buildPrompt({ contentType, tone, fullName, education, skills, projects, experience, targetRole, companyName, jobDescription });
    const generated = await generateContent(promptSpec);
    const data = enforceContentType(generated, promptSpec);

    if (dbState.isConnected && req.user?._id) {
      try {
        await GeneratedContent.create({
          userId: req.user._id,
          contentType,
          tone,
          prompt: promptSpec.userPrompt || '',
          content: data,
        });
      } catch (saveErr) {
        console.warn(`[Generate] Content generated but not saved: ${saveErr.message}`);
      }
    }

    res.json({ success: true, data });
  } catch (err) {
    // Operational errors (thrown with isOperational: true) have clear user-facing messages
    if (err.isOperational) {
      return res.status(err.status || 400).json({ success: false, error: err.message });
    }
    // Fallback for unexpected errors
    next(err);
  }
}
