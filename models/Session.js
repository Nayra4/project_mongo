import mongoose from "mongoose";
import crypto from "crypto";

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

const sessionSchema = new mongoose.Schema({
    sessionId: {
    type: String,
    required: true,
    unique: true,
        default: () => crypto.randomBytes(32).toString('hex')
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiresAt: {
    type: Date,

    default: () => new Date(Date.now() + SEVEN_DAYS_IN_MS),
    required: true
    }
}, { 
    timestamps: true 
});

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.model('Session', sessionSchema);
