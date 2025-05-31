import mongoose from 'mongoose';

// Define the user schema
const userSchema = new mongoose.Schema({
    // _id: { type: mongoose.Schema.Types.ObjectId },
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
    otp: Number,
    createdAt: {
        type: Date,
        default: Date.now
    },
    verifiedOn: { type: Date },
});

// Create TTL index for unverified users (delete after 3 minutes)
userSchema.index({ createdAt: 1 }, {
    name: 'createdAtIndex',
    expireAfterSeconds: 1200,  // 20 minutes
    partialFilterExpression: { isVerified: false }  // Apply only to unverified users
});

const User = mongoose.model('User', userSchema);
export { userSchema };
export default User;
