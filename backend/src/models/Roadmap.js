import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetRole: String,
    currentSkills: String,
    duration: String,
    level: String,
    plan: Object,
  },
  { timestamps: true }
);

roadmapSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Roadmap', roadmapSchema);
