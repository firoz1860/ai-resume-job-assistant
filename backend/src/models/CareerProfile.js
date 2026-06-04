import mongoose from 'mongoose';

const careerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    education: String,
    skills: String,
    projects: String,
    experience: String,
    targetRole: String,
    dreamCompany: String,
    resumeText: String,
    phone: String,
    location: String,
    portfolioUrl: String,
    githubUrl: String,
    linkedinUrl: String,
    preferredLocation: String,
    jobType: String,
    expectedSalary: String,
    noticePeriod: String,
    certifications: String,
    achievements: String,
    languages: String,
    availability: String,
  },
  { timestamps: true }
);

careerProfileSchema.index({ userId: 1 });

export default mongoose.model('CareerProfile', careerProfileSchema);
