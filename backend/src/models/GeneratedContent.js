import mongoose from 'mongoose';

const generatedContentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contentType: String,
    tone: String,
    prompt: String,
    content: String,
  },
  { timestamps: true }
);

generatedContentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('GeneratedContent', generatedContentSchema);
