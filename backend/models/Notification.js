const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['APPLICATION_STATUS', 'JOB_CLOSED', 'SYSTEM'],
      default: 'SYSTEM'
    },
    title: {
      type: String,
      trim: true,
      maxlength: 120
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    metadata: {
      job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
      application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
      status: { type: String },
      link: { type: String }
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
