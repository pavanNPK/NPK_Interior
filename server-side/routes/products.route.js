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
router.post('/',  authenticateToken, authorizeRoles('supervise', 'shopper'),addProduct);
router.get('/', authenticateToken, authorizeRoles('supervise', 'shopper'), getProducts);
router.get('/:id', authenticateToken, authorizeRoles('supervise', 'shopper'), getProductById);
router.put('/:id',  authenticateToken, authorizeRoles('supervise', 'shopper'),updateProduct);
router.delete('/:id',  authenticateToken, authorizeRoles('supervise', 'shopper'),deleteProduct);

// Export the router
export default router;