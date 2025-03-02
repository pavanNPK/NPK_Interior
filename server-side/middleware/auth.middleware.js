import JWT from 'jsonwebtoken';
import User from "../models/user.model.js";
import mongoose from "mongoose";
// Create a JWT token
export const generateToken = (user) => {
    return JWT.sign({ id: user._id.toString(), email: user.email, role:user.role, code: user.code }, process.env.JWT_SECRET, { expiresIn: '24h' });
}

// Middleware to verify token

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
        if (!token) {
            return res.json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id; // Keep it as a string
        // Query using the ObjectId
        const user = await User.findOne({ _id: userId }, {}, { lean: true });
        if (!user) {
            return res.json({
                success: false,
                message: 'Invalid token or user not found.'
            });
        }
        req.user = decoded; // Attach user info to the request
        next();
    } catch (error) {
        console.error('Error in authenticateToken:', error); // Log the error

        if (error.name === 'TokenExpiredError') {
            return res.json({
                success: false,
                message: 'Token expired, please login again.'
            });
        }

        return res.json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

// Role-based authorization middleware
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.json({
                success: false,
                message: `Role (${req.user.role}) is not allowed to access this resource. Allowed roles are: ${roles.join(', ')}`
            });
        }
        next();
    };
};


// Refresh token functionality
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.json({
                success: false,
                message: 'Refresh token is required!'
            });
        }
        const decoded = JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.id, {}, { lean: true });
        if (!user) {
            return res.json({
                success: false,
                message: 'Invalid refresh token!'
            });
        }
        const newAccessToken = generateToken(user);
        res.json({
            response: {
                accessToken: newAccessToken
            },
            success: true,
            message: 'Token refreshed successfully'
        });
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.json({
            success: false,
            message: 'Invalid refresh token!'
        });
    }
};