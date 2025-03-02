// Import express
import express from 'express';

// Create a router instance
const router = express.Router();

// Import all named exports from the categories controller
import {
    addCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from '../controllers/categories.controller.js';

import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware.js';

// Define routes with the imported functions
router.post('/',  authenticateToken, authorizeRoles('admin', 'end_user'),addCategory);
router.get('/', authenticateToken, authorizeRoles('admin', 'end_user'), getCategories);
router.get('/:id', authenticateToken, authorizeRoles('admin', 'end_user'), getCategoryById);
router.put('/:type',  authenticateToken, authorizeRoles('admin', 'end_user'),updateCategory);
router.delete('/:id',  authenticateToken, authorizeRoles('admin', 'end_user'),deleteCategory);

// Export the router
export default router;