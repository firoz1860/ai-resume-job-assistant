import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyName: String,
    role: String,
    jobLink: String,
    status: { type: String, enum: ['Saved', 'Applied', 'Interview', 'Rejected', 'Offer'], default: 'Saved' },
    appliedDate: String,
    followUpDate: String,
    notes: String,
    generatedContent: String,
    recruiterName: String,
    recruiterEmail: String,
    recruiterLinkedIn: String,
    source: String,
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    lastContactDate: String,
    companyResearch: String,
    projectEvidence: String,
    resumeBefore: String,
    resumeAfter: String,
    jobDescription: String,
  },
  { timestamps: true }
);

applicationSchema.index({ userId: 1, createdAt: -1 });
applicationSchema.index({ userId: 1, updatedAt: -1 });
applicationSchema.index({ userId: 1, followUpDate: 1, status: 1 });
applicationSchema.index({ userId: 1, status: 1 });

export default mongoose.model('Application', applicationSchema);
