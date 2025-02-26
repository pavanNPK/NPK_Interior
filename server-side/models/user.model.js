// Import mongoose using ES module syntax
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
    isVerified: Boolean,
    otp: {
        type: Number,
        expireAt: { type: Date, default: () => Date.now() + 10 * 60 * 1000 }
    }
});

// Create and export the User model using ES module syntax
const User = mongoose.model('User', userSchema);
export default User;