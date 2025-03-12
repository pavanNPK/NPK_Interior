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
    deleteCategory,
    getCatAndSubCat
} from '../controllers/categories.controller.js';

import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware.js';

// Define routes with the imported functions
router.post('/',  authenticateToken, authorizeRoles('supervise'),addCategory);
router.get('/', authenticateToken, authorizeRoles('supervise', 'shopper'), getCategories);
router.get('/getCatAndSubCat', authenticateToken, authorizeRoles('supervise', 'shopper'), getCatAndSubCat);
router.get('/:id', authenticateToken, authorizeRoles('supervise'), getCategoryById);
router.put('/:type',  authenticateToken, authorizeRoles('supervise'),updateCategory);
router.delete('/:id',  authenticateToken, authorizeRoles('supervise'),deleteCategory);

// Export the router
export default router;