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

// Define routes with the imported functions
router.post('/', addCategory);
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.put('/:type', updateCategory);
router.delete('/:id', deleteCategory);

// Export the router
export default router;