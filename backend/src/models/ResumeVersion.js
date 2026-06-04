import mongoose from 'mongoose';

const resumeVersionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    title: { type: String, default: 'ATS Resume' },
    targetRole: String,
    companyName: String,
    sections: {
      fullName: String,
      headline: String,
      email: String,
      phone: String,
      location: String,
      links: String,
      summary: String,
      skills: String,
      experience: String,
      projects: String,
      education: String,
      achievements: String,
      certifications: String,
    },
    source: { type: String, enum: ['builder', 'parser'], default: 'builder' },
  },
  { timestamps: true }
);

resumeVersionSchema.index({ userId: 1, updatedAt: -1 });
resumeVersionSchema.index({ userId: 1, applicationId: 1 });

export default mongoose.model('ResumeVersion', resumeVersionSchema);
