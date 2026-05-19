const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
    {
        application: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
            required: [true, 'Application is required'],
            index: true
        },
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job',
            required: true,
            index: true
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        recruiter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        scheduledDate: {
            type: Date,
            required: [true, 'Interview date is required']
        },
        scheduledTime: {
            type: String,
            required: [true, 'Interview time is required']
        },
        duration: {
            type: Number,
            default: 60, // minutes
            min: [15, 'Duration must be at least 15 minutes'],
            max: [180, 'Duration cannot exceed 180 minutes']
        },
        type: {
            type: String,
            enum: ['Technical', 'HR', 'Manager', 'Final', 'Group'],
            default: 'Technical'
        },
        mode: {
            type: String,
            enum: ['In-Person', 'Video', 'Phone'],
            default: 'Video'
        },
        location: {
            type: String,
            trim: true
        },
        meetingLink: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ['Scheduled', 'Completed', 'Cancelled', 'No-Show', 'Rescheduled'],
            default: 'Scheduled'
        },
        participation: {
            studentJoined: { type: Boolean, default: false },
            recruiterJoined: { type: Boolean, default: false }
        },
        score: {
            type: Number,
            min: [0, 'Score cannot be negative'],
            max: [100, 'Score cannot exceed 100']
        },
        feedback: {
            type: String,
            maxlength: [2000, 'Feedback cannot exceed 2000 characters']
        },
        notes: {
            type: String,
            maxlength: [1000, 'Notes cannot exceed 1000 characters']
        },
        hiringDecision: {
            type: String,
            enum: ['Pending', 'Recommended', 'Not Recommended', 'On Hold'],
            default: 'Pending'
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Compound index for unique interview per application
interviewSchema.index({ application: 1, scheduledDate: 1 });
interviewSchema.index({ student: 1, scheduledDate: 1 });
interviewSchema.index({ recruiter: 1, scheduledDate: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
