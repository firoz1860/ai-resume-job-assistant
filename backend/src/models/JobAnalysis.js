import mongoose from 'mongoose';

const jobAnalysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetRole: String,
    targetCompany: String,
    jobDescription: String,
    result: Object,
  },
  { timestamps: true }
);

export default mongoose.model('JobAnalysis', jobAnalysisSchema);
