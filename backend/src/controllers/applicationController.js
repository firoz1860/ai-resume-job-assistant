import { dbState } from '../config/db.js';
import Application from '../models/Application.js';

const applications = [];

function normalizeApplication(app) {
  const data = app?.toObject ? app.toObject() : app;
  return { ...data, id: String(data._id || data.id) };
}

export async function listApplications(req, res) {
  if (dbState.isConnected) {
    const items = await Application.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, data: items.map(normalizeApplication) });
  }

  res.json({ success: true, data: applications });
}

export async function createApplication(req, res) {
  if (dbState.isConnected) {
    const app = await Application.create({
      userId: req.user._id,
      companyName: req.body.companyName || '',
      role: req.body.role || '',
      jobLink: req.body.jobLink || '',
      status: req.body.status || 'Saved',
      appliedDate: req.body.appliedDate || '',
      followUpDate: req.body.followUpDate || '',
      notes: req.body.notes || '',
      generatedContent: req.body.generatedContent || '',
    });

    return res.status(201).json({ success: true, data: normalizeApplication(app) });
  }

  const app = {
    id: Date.now().toString(),
    companyName: req.body.companyName || '',
    role: req.body.role || '',
    jobLink: req.body.jobLink || '',
    status: req.body.status || 'Saved',
    appliedDate: req.body.appliedDate || '',
    followUpDate: req.body.followUpDate || '',
    notes: req.body.notes || '',
    generatedContent: req.body.generatedContent || '',
    createdAt: new Date().toISOString(),
  };
  applications.unshift(app);
  res.status(201).json({ success: true, data: app });
}

export async function updateApplication(req, res) {
  if (dbState.isConnected) {
    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!app) return res.status(404).json({ success: false, error: 'Application not found.' });
    return res.json({ success: true, data: normalizeApplication(app) });
  }

  const index = applications.findIndex((item) => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Application not found.' });
  applications[index] = { ...applications[index], ...req.body };
  res.json({ success: true, data: applications[index] });
}

export async function deleteApplication(req, res) {
  if (dbState.isConnected) {
    const deleted = await Application.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deleted) return res.status(404).json({ success: false, error: 'Application not found.' });
    return res.json({ success: true, data: normalizeApplication(deleted) });
  }

  const index = applications.findIndex((item) => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Application not found.' });
  const [deleted] = applications.splice(index, 1);
  res.json({ success: true, data: deleted });
}

function buildFollowUp(app) {
  return app.status === 'Interview'
    ? `Subject: Thank you for the interview opportunity\n\nHi,\n\nThank you for taking the time to discuss the ${app.role} role at ${app.companyName}. I enjoyed learning more about the team and the work. I remain very interested in the opportunity and would be glad to share anything else that helps with the decision.\n\nBest regards`
    : `Subject: Following up on my ${app.role} application\n\nHi,\n\nI wanted to follow up on my application for the ${app.role} role at ${app.companyName}. I am very interested in the opportunity and believe my background aligns well with the role. Please let me know if I can share any additional details.\n\nBest regards`;
}

export async function followUp(req, res) {
  const app = dbState.isConnected
    ? await Application.findOne({ _id: req.params.id, userId: req.user._id }).lean()
    : applications.find((item) => item.id === req.params.id);

  if (!app) return res.status(404).json({ success: false, error: 'Application not found.' });

  res.json({ success: true, data: { message: buildFollowUp(app) } });
}
