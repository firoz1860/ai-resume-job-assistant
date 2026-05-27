import mongoose from 'mongoose';

const interviewMessageSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewSession', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mode: { type: String, enum: ['text', 'voice'], default: 'text' },
    role: { type: String, enum: ['ai', 'user', 'system'], required: true },
    question: String,
    answer: String,
    transcript: String,
    feedback: String,
    score: Number,
    betterAnswer: String,
    mistakes: [String],
    nextQuestion: String,
    speakingTimeSeconds: Number,
    audioMetrics: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.model('InterviewMessage', interviewMessageSchema);
