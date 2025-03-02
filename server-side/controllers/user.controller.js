import mongoose from 'mongoose';
import User from '../models/user.model.js';
import nodemailer from 'nodemailer';
import Redis from 'ioredis'; // Use Redis to store OTP temporarily
import bcrypt from 'bcrypt'; // Use bcrypt for password hashing
import jwt from 'jsonwebtoken';
import {generateToken} from '../middleware/auth.middleware.js';


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
        from: `"NPK Interior" <${process.env.EMAIL_USER}>`,
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
                    verifiedOn: new Date(),
                }
            }
        );
        // Send registration email
        await sendRegistrationEmail(userName, email);

        // Get database name from user object (user.code)
        const dbName = user.code; // Example: 'npk_customer1', 'npk_projectX', etc.

        // Create a new database dynamically
        await createDatabase(dbName, { email, userName, firstName: user.firstName, lastName: user.lastName, user_id: user._id, role: user.role, code: user.code });

        res.json({ response: user, success: true, message: "User updated and verified successfully" });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({response: null, success: false, message: 'Error registering user' });
    }
}

// Function to dynamically create a new database using user.code
const createDatabase = async (dbName, userData) => {
    try {
        const DB_URL = process.env.DB_URL;
        const dbURI = DB_URL.replace("npk_interior", dbName);
        const newDbConnection = mongoose.createConnection(dbURI);

        // Define the "users" schema
        const UserSchema = new mongoose.Schema({
            email: String,
            firstName: String,
            lastName: String,
            userName: String,
            user_id: String,
            createdOn: { type: Date, default: Date.now }
        });

        // Create the "initials" collection
        const UserModel = newDbConnection.model('initial', UserSchema);

        // Insert the first user record
        await UserModel.insertOne({
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            userName: userData.userName,
            user_id: userData.user_id,
            createdOn: new Date()
        });

        console.log(`Database '${dbName}' created with 'initial' collection and initial user.`);
        return newDbConnection;
    } catch (error) {
        console.error(`Failed to create database '${dbName}':`, error);
        throw error;
    }
};

const sendRegistrationEmail = async (name, email) => {
    const currentYear = new Date().getFullYear(); // Get current year

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Replace it with your email
            pass: process.env.EMAIL_PASS  // Replace it with your email password
        }
    });

    const mailOptions = {
        from: `"NPK Interior" <${process.env.EMAIL_USER}>`,
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

        <p style="font-size: 14px; color: #555; text-align: center;">Have questions? Check our <a href="https://www.synycs.com/aboutus.html" style="color: #444; ">Knowledge Base</a> or contact our <a href="#" style="color: #444; text-decoration: none;">24/7 support team</a>.</p>

        <p style="font-size: 14px; color: #555; text-align: center;">Best Regards,</p>
        <p style="font-size: 12px; color: #444; text-align: center;"><strong>NPK Interior Team</strong></p>
        <p style="font-size: 10px; color: #777; text-align: center;"><a href="mailto:npk@npkinterior.com" style="text-decoration: none; color: #777;">npk@npkinterior.com</a> | <a href="tel:+919898989898" style="text-decoration: none; color: #777;">+91 9898989898</a></p>
        <div style="text-align: center; margin-top: 20px; font-size: 12px;">
            <a href="https://www.synycs.com" style="text-decoration: none; font-weight: bold">Visit Our Website</a> |
            <a href="https://www.synycs.com/contact.html" style="text-decoration: none; font-weight: bold">Contact Us</a>
        </div>

        <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">

        <p style="font-size: 12px; color: #777; text-align: center;">You received this email because you signed up for NPK Interior.</p>

        <p style="font-size: 12px; color: #777; text-align: center;">&copy; ${currentYear}  NPK Interior. All rights reserved.</p>

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
        // Find User
        const user = await User.findOne({ email }, {}, { lean: true }).exec();
        if (!user) {
            return res.json({response: 'notFound', success: false, message: 'Please verify your account first' });
        }
        // Verify Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({response: 'notMatched', success: false, message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = generateToken(user);


        // Generate refresh token
        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key',
            { expiresIn: '7d' }
        );

        // Return user without sensitive info
        // Exclude the password field from the user object
        // Only include the specific fields you want to return
        const userWithoutSensitiveInfo = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            userName: user.userName,
            role: user.role,
            code: user.code
        };

        res.json({
            response: {
                user: userWithoutSensitiveInfo,
                token,
                refreshToken
            },
            success: true,
            message: "User logged in successfully"
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.json({response: null, success: false, message: 'Error logging in user' });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email }, {}, { lean: true }).exec();
        if (!user) {
            return res.json({response: 'notFound', success: false, message: 'User not found' });
        }

        // Generate password reset token
        const resetToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'default-jwt-secret',
            { expiresIn: '15m' }
        );

        // Store reset token in Redis
        await redis.set(`resetToken:${user._id}`, resetToken, 'EX', 900); // 15 minutes

        const resetUrl = `${process.env.FRONTEND_URL || 'https://npkinterior.com'}/reset-password/${resetToken}`;


        const emailSent = await sendForgotPasswordEmail(email, resetUrl);
        if (!emailSent) {
            return res.status(500).json({
                response: null,
                success: false,
                message: 'Error sending forgot password email'
            });
        }
        res.json({response: email, success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.json({response: null, success: false, message: 'Error sending OTP' });
    }
};

const sendForgotPasswordEmail = async (email, resetUrl) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Replace it with your email
            pass: process.env.EMAIL_PASS  // Replace it with your email password
        }
    });
    const user = await User.findOne({ email }, {}, { lean: true }).exec();
    if (!user) {
        return false;
    }
    const mailOptions = {
        from: `"NPK Interior" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Reset Your Account Password - NPK Interior',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9; text-align: center;">
                <h1 style="color: #333;">Reset Your Password</h1>
                <p style="color: #555;">Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
                <p style="color: #555;">We received a request to reset your password. No worries! You can set a new password by clicking the button below.</p>
                
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #555, #555); color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 15px 0;">
                    Reset Password
                </a>
            
                <p style="color: #555;">If you did not request this change, you can safely ignore this email. Your current password will remain unchanged.</p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
                
                <p style="font-size: 12px; color: #777;">Need help? Contact our support team.</p>
                
                <p style="font-size: 12px; color: #777;">Best Regards,<br><strong>NPK Interior Team</strong></p>
            
                <img src="https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/image8-2.jpg?width=600&name=image8-2.jpg" 
                    alt="NPK Interior Logo" 
                    style="width: 100px; margin-top: 15px;">
            </div>
        `
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
        return true; // Return true if email is sent successfully
    } catch (error) {
        console.error('Error sending forgot password email:', error);
        return false;
    }
}

export const resetPassword = async (req, res) => {
    try {
        const {newPassword} = req.body;
        const token = req.params.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-jwt-secret');
        // Check if token exists in Redis
        const storedToken = await redis.get(`resetToken:${decoded.id}`);
        if (!storedToken || storedToken !== token) {
            return res.status(400).json({
                response: null,
                success: false,
                message: 'Invalid or expired reset token'
            });
        }
        const userId = decoded.id;
        const user = await User.findById(userId, {}, {lean: true}).exec();
        if (!user) {
            return res.json({response: null, success: false, message: 'User not found'});
        }
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        // Update user password
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        // Delete the reset token from Redis
        await redis.del(`resetToken:${decoded.id}`);

        res.json({response: user, success: true, message: 'Password reset successfully'});
    }catch (error) {
        console.error('Error resetting password:', error);
        if (error.name === 'TokenExpiredError') {
            return res.json({
                response: null,
                success: false,
                message: 'Password reset token has expired'
            });
        }
        res.json({response: null, success: false, message: 'Error resetting password' });
    }
}

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

