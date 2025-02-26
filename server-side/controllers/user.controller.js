import mongoose from 'mongoose';
import User from '../models/user.model.js';
import nodemailer from 'nodemailer';
import Redis from 'ioredis'; // Use Redis to store OTP temporarily

const redis = new Redis({
    host: process.env.REDIS_HOST, // Ensure Redis is accessible on this IP
    port: process.env.REDIS_PORT,
    connectTimeout: 10000, // Increase timeout to 10 seconds
    retryStrategy: (times) => Math.min(times * 50, 2000), // Retry strategy
}); // Initialize Redis

// Function to register a new user
export const registerUser = async (req, res, next) => {
    console.log('NPK posting............');
    try {
        let code;
        do {
            const randomString = Math.random().toString(36).slice(2, 9); // Generate 7-char alphanumeric string
            let digitCount = (randomString.match(/\d/g) || []).length; // Count digits in the string
            if (digitCount >= 2 && digitCount <= 3) {
                code = 'NPK_EU_' + randomString;
            }
        } while (!code || await User.findOne({ code }, {}, { lean: true })); // Ensure uniqueness

        const { firstName, lastName, userName, role, email } = req.body;

        // Check if the email already exists
        const existingUser = await User.findOne({ email }, {}, { lean: true });
        if (existingUser) {
            return res.json({ response: email, success: false, message: "Email already registered. Use a different email." });
        }

        // Generate OTP (6-digit number)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in Redis with expiry (10 minutes)
        await redis.set(`otp:${email}`, otp, 'EX', 300); // Key: "otp:email", Expiry: 300 sec (5 minutes)

        // Send OTP via email
        const emailSent = await sendOtpEmail(email, otp);

        if (!emailSent) {
            return res.status(500).json({ response: null, success: false, message: 'Error sending OTP email' });
        }

        // Now save the user only after OTP is sent successfully
        const user = new User({ firstName, lastName, userName, role, email, code });
        await user.save();

        res.json({ response: user.email, success: true, message: "User registered successfully" });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ response: null, success: false, message: 'Error registering user' });
    }
};

// Function to send OTP email using Nodemailer
const sendOtpEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Replace with your email
            pass: process.env.EMAIL_PASS  // Replace with your email password
        }
    });

    const mailOptions = {
        from: '"NPK Interior" <pavansynycs@gmail.com>',
        to: email,
        subject: '🔑 Your OTP Code - NPK Interior',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">NPK Interior - OTP Verification</h2>
                <p>Dear User,</p>
                <p>Your OTP code for verification is:</p>
                <div style="font-size: 22px; font-weight: bold; text-align: center; padding: 10px; background: #f4f4f4; border-radius: 5px;">
                    ${otp}
                </div>
                <p>This OTP will expire in <strong>10 minutes</strong>. Do not share this code with anyone.</p>
                <p>If you did not request this code, please ignore this email.</p>
                <hr />
                <p style="font-size: 12px; color: #777;">Regards,<br>NPK Interior Team</p>
                <img src="https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/image8-2.jpg?width=600&name=image8-2.jpg" alt="NPK Interior Logo" style="width: 100px; margin-bottom: 15px;">
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
        return true; // Return true if email is sent successfully
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false; // Return false if email sending fails
    }
};


// Function to log in a user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password }, {}, { lean: true }).exec();
        if (user) {
            res.json({response: user, success: true, message: "User logged in successfully"});
        } else {
            res.status(401).json({response: null, success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({response: null, success: false, message: 'Error logging in user' });
    }
};

// Function to get a user by ID
export const getUser = async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findById(mongoose.Types.ObjectId(id), {}, { lean: true }).exec();
        res.json({response: user, success: true, message: "User fetched successfully"});
    } catch (error) {
        console.error('Error fetching user by id:', error);
        res.status(404).json({response: null, success: false, message: 'User not found' });
    }
};

// Function to update a user
export const updateUser = async (req, res) => {
    const id = req.params.id;
    try {
        const updatedUser = await User.findByIdAndUpdate(mongoose.Types.ObjectId(id), req.body, { new: true, upsert: true }).exec();
        res.json({response: updatedUser, success: true, message: "User updated successfully"});
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({response: null, success: false, message: 'Error updating user' });
    }
};

// Function to delete a user
export const deleteUser = async (req, res) => {
    const id = req.params.id;
    try {
        await User.findByIdAndDelete(mongoose.Types.ObjectId(id)).exec();
        res.json({response: null, success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({response: null, success: false, message: 'Error deleting user' });
    }
};

