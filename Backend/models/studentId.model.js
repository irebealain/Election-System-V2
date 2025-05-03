import mongoose from 'mongoose';

const studentIdSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    trim: true
  },
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'used'],
    default: 'available'
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index to ensure unique studentId per election
studentIdSchema.index({ studentId: 1, electionId: 1 }, { unique: true });

export default mongoose.model('StudentId', studentIdSchema); 