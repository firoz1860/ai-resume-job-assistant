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
  },
  { timestamps: true }
);

export default mongoose.model('CareerProfile', careerProfileSchema);
