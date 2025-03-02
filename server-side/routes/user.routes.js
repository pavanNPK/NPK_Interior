// Import express using ES module syntax
import express from 'express';

// Create a router instance
const router = express.Router();

// Import user controller using ES module syntax
import {
    loginUser,
    registerUser,
    getUser,
    updateUser,
    deleteUser, confirmOTP, sendOTP, forgotPassword, resetPassword
} from '../controllers/user.controller.js';

import { authenticateToken, authorizeRoles, refreshToken } from '../middleware/auth.middleware.js';


// Define routes
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/sendOTP', sendOTP);
router.post('/confirmOTP', confirmOTP);
router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword', resetPassword);
router.post('/refreshToken', refreshToken);

// Admin routes (authentication + authorization required)
router.get('/admin/users', authenticateToken, authorizeRoles('admin'), (req, res) => {
    // Admin-only functionality to get all user's
    // Implementation would go here
    res.json({ message: 'Admin access granted' });
});
router.get('/:id', authenticateToken, authorizeRoles('admin'), getUser);
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateUser);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteUser);

// Export router using ES module syntax
export default router;