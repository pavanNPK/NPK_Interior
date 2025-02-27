import mongoose from 'mongoose';

// Define the user schema
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    userName: String,
    code: {
        type: String,
        unique: true
    },
    role: String,
    email: { type: String, unique: true },
    password: String,
    isVerified: { type: Boolean, default: false },
    otp: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    verifiedOn: { type: Date }
});

// Create a TTL index on createdAt, but only for unverified users
userSchema.index({ createdAt: 1 }, {
    expireAfterSeconds: 7200,  // 2 hours
    partialFilterExpression: { isVerified: false }  // Only apply to unverified users
});

// Create and export the User model
const User = mongoose.model('User', userSchema);
export default User;