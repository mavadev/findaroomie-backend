import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Se reporta un usuario O una habitación, no ambos
    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reportedRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    evidence: {
      type: imageSchema,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed'],
      default: 'pending',
    },
    adminComment: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Report = mongoose.model('Report', reportSchema);

export default Report;
