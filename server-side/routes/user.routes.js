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
    deleteUser, confirmOTP, sendOTP
} from '../controllers/user.controller.js';

// Define routes
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/sendOTP', sendOTP);
router.post('/confirmOTP', confirmOTP);
router.get('/', getUser);
router.put('/', updateUser);
router.delete('/', deleteUser);

// Export router using ES module syntax
export default router;