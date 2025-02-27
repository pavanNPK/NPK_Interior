import mongoose from 'mongoose';
import User from '../models/user.model.js';
import nodemailer from 'nodemailer';
import Redis from 'ioredis'; // Use Redis to store OTP temporarily
import bcrypt from 'bcrypt'; // Use bcrypt for password hashing

const redis = new Redis({
    host: process.env.REDIS_HOST, // Ensure Redis is accessible on this IP
    port: process.env.REDIS_PORT,
    connectTimeout: 10000, // Increase timeout to 10 seconds
    retryStrategy: (times) => Math.min(times * 50, 2000), // Retry strategy
}); // Initialize Redis

// Function to register a new user
export const sendOTP = async (req, res, next) => {
    try {
        const { firstName, lastName, userName, role, email } = req.body;

        // Check if verified user exists
        const verifiedUser = await User.findOne({ email, isVerified: true }, {}, { lean: true });
        if (verifiedUser) {
            return res.json({
                response: email,
                success: false,
                message: "Email already registered. Use a different email."
            });
        }

        // Check for unverified user
        const unverifiedUser = await User.findOne({ email, isVerified: false }, {}, { lean: true });

        // Generate unique code for new users
        let code;
        if (!unverifiedUser) {
            do {
                const randomString = Math.random().toString(36).slice(2, 9);
                const digitCount = (randomString.match(/\d/g) || []).length;
                if (digitCount >= 2 && digitCount <= 3) {
                    code = 'NPK_EU_' + randomString;
                }
            } while (!code || await User.findOne({ code }, {}, { lean: true }));
        }

        // Generate and store OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await redis.set(`otp:${email}`, otp, 'EX', 300);

        // Send OTP email
        const emailSent = await sendOtpEmail(email, otp);
        if (!emailSent) {
            return res.status(500).json({
                response: null,
                success: false,
                message: 'Error sending OTP email'
            });
        }

        // Create new user if needed
        if (!unverifiedUser) {
            const user = new User({
                firstName, lastName, userName, role, email, code, isVerified: false, createdAt: new Date()
            });
            await user.save();
        }

        return res.json({
            response: email,
            success: true,
            message: unverifiedUser
                ? "OTP resent to your email. Please verify your account."
                : "User registered successfully. Please verify with the OTP sent to your email."
        });

    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({
            response: null,
            success: false,
            message: 'Error registering user'
        });
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
                <p>This OTP will expire in <strong>5 minutes</strong>. Do not share this code with anyone.</p>
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

export const confirmOTP = async (req, res) => {
    try {
        const {email, otp} = req.body;
        const storedOtp = await redis.get(`otp:${email}`);
        if (storedOtp === otp) {
            await redis.del(`otp:${email}`);
            res.json({response: email, success: true, message: 'User verified successfully'});
        } else {
            res.json({response: null, success: false, message: 'Invalid OTP'});
        }
    } catch (error) {
        console.error('Error confirming OTP:', error);
        res.status(500).json({response: null, success: false, message: 'Error confirming OTP'});
    }
};

export const registerUser = async (req, res, next) => {
    try {
        const { email, password, userName } = req.body;

        // Find the user with the given email and isVerified false
        const user = await User.findOne({ email, isVerified: false }, {}, { lean: true }).exec();

        if (!user) {
            res.json({ response: email, success: false, message: "User not found. Please verify your account" });
            return;
        }
        // Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Update user details
        // Update user directly in the database
        await User.updateOne(
            { email },
            {
                $set: {
                    password: hashedPassword,
                    isVerified: true,
                    verifiedOn: new Date()
                }
            }
        );
        // Send registration email
        await sendRegistrationEmail(userName, email);

        res.json({ response: user, success: true, message: "User updated and verified successfully" });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({response: null, success: false, message: 'Error registering user' });
    }
}

const sendRegistrationEmail = async (name, email) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Replace it with your email
            pass: process.env.EMAIL_PASS  // Replace it with your email password
        }
    });

    const mailOptions = {
        from: `"Your Company Name" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "🎉 Welcome to Our Platform, " + name + "!",
        html: `
        <div style="max-width: 600px; margin: auto; background: #f8f8f8; border-radius: 8px; padding: 20px; border: 1px solid #ccc;">
        
        <div style="text-align: center; padding-bottom: 20px;">
            <img src="https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/image8-2.jpg?width=600&name=image8-2.jpg" alt="NPK Interior Logo" style="width: 100px; margin-bottom: 15px;">
        </div>

        <h2 style="color: #444; text-align: center;">Welcome Aboard, <span style="color: #222;">${name}</span>! 🎉</h2>

        <p style="font-size: 14px; color: #555; text-align: center;">Thanks for joining NPK Interior! We’re excited to have you on board.</p>
        <p style="font-size: 14px; color: #555; text-align: center;">Your account is now verified, and you can start exploring our services.</p>

        <div style="text-align: center; margin: 20px 0;">
            <a href="https://www.google.com/" style="background: linear-gradient(135deg, #555, #555); color: white; padding: 12px 22px; text-decoration: none; border-radius: 5px; font-size: 14px; display: inline-block; font-weight: bold; box-shadow: 2px 2px 8px rgba(0,0,0,0.2);">
                LOGIN TO YOUR ACCOUNT
            </a>
        </div>

        <p style="font-size: 14px; color: #555; text-align: center;">Have questions? Check our <a href="#" style="color: #444; text-decoration: none;">Knowledge Base</a> or contact our <a href="#" style="color: #444; text-decoration: none;">24/7 support team</a>.</p>

        <p style="font-size: 14px; color: #555; text-align: center;">Best Regards,</p>
        <p style="font-size: 12px; color: #444; text-align: center;"><strong>NPK Interior Team</strong></p>
        <p style="font-size: 10px; color: #777; text-align: center;">npk@npkinterior.com | +91 9898989898</p>

        <div style="text-align: center; margin-top: 20px; font-size: 12px;">
            <a href="https://www.synycs.com" style="text-decoration: none; font-weight: bold">Visit Our Website</a> |
            <a href="https://www.synycs.com/contact.html" style="text-decoration: none; font-weight: bold">Contact Us</a>
        </div>

        <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">

        <p style="font-size: 12px; color: #777; text-align: center;">You received this email because you signed up for NPK Interior.</p>

        <p style="font-size: 12px; color: #777; text-align: center;">&copy; 2025 NPK Interior. All rights reserved.</p>

    </div>
            `
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Registration email sent to ${email}`);
    } catch (error) {
        console.error('Error sending registration email:', error);
    }
}

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

