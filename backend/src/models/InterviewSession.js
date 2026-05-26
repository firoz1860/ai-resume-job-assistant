import mongoose from 'mongoose';

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mode: { type: String, enum: ['text', 'voice'], default: 'text' },
    voiceEnabled: { type: Boolean, default: false },
    transcripts: [String],
    targetRole: String,
    interviewType: String,
    difficulty: String,
    skills: String,
    projects: String,
    experience: String,
    jobDescription: String,
    durationMinutes: { type: Number, default: 10 },
    status: { type: String, enum: ['active', 'completed', 'expired'], default: 'active' },
    startedAt: Date,
    endedAt: Date,
    questionsAsked: { type: Number, default: 0 },
    overallScore: Number,
    finalReport: Object,
  },
  { timestamps: true }
);

export default mongoose.model('InterviewSession', interviewSessionSchema);
