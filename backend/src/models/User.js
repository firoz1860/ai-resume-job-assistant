import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: '' },
    role: { type: String, default: 'user' },
  },
  { timestamps: true }
);

// email already has unique:true which creates an index.
// Add a createdAt index for admin/analytics queries sorting by date.
userSchema.index({ createdAt: -1 });

export default mongoose.model('User', userSchema);
