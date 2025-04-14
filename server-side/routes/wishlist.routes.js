// Import express
import express from 'express';

// Create a router instance
const router = express.Router();

// Import all named exports from the wishlist controller

import {getWishlistCount} from '../controllers/wishlist.controller.js'

import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware.js';

// Define routes with the imported functions
router.get('/getCount', authenticateToken, authorizeRoles('supervise', 'shopper'), getWishlistCount);

// Export the router
export default router;
