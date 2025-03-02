// Import required modules using ES module syntax
import express from 'express';
// Create a router instance
const router = express.Router();

import {
    addProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} from '../controllers/products.controller.js';

import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware.js';

// Define routes
router.post('/',  authenticateToken, authorizeRoles('admin', 'end_user'),addProduct);
router.get('/', authenticateToken, authorizeRoles('admin', 'end_user'), getProducts);
router.get('/:id', authenticateToken, authorizeRoles('admin', 'end_user'), getProductById);
router.put('/:id',  authenticateToken, authorizeRoles('admin', 'end_user'),updateProduct);
router.delete('/:id',  authenticateToken, authorizeRoles('admin', 'end_user'),deleteProduct);

// Export the router
export default router;