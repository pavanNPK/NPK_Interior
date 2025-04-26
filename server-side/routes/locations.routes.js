// Import express
import express from 'express';

// Create a router instance
const router = express.Router();

// Import all named exports from the locations controller
import {
    getLocations,
} from '../controllers/locations.controller.js';

import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware.js';

// Define routes with the imported functions
router.get('/',  getLocations);

// Export the router
export default router;