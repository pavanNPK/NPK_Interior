// Import required modules using ES module syntax
import express from 'express';
import multer from "multer";
// Create a router instance
const router = express.Router();


import {
    addProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    updateProductType,
    notifyProductToUser,
    bulkUpload,
    getLowStockProducts,
    updateProductStock
} from '../controllers/products.controller.js';

import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware.js';
import fs from 'fs';
import path from 'path';

// Ensure the uploads folder exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Create a multer instance with a fileFilter that captures the product index
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Extract product index from field name (e.g., "images-0")
        const match = file.fieldname.match(/^images-(\d+)$/);
        if (match) {
            // Store the product index in the file object for later use
            file.productIndex = parseInt(match[1]);
        }
        cb(null, true);
    }
});

const uploadUpdate = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'images') {
            cb(null, true);
        } else {
            cb(null, false); // or true if you allow other files
        }
    }
})

// Define routes with any field name that follows the pattern "images-X"
router.post('/', authenticateToken, authorizeRoles('supervise'), upload.any(), addProduct);
router.post('/bulkUpload', authenticateToken, authorizeRoles('supervise'), upload.any(), bulkUpload);
router.get('/', authenticateToken, authorizeRoles('supervise', 'shopper'), getProducts);
router.get('/getLowStockProducts', authenticateToken, authorizeRoles('supervise'), getLowStockProducts);
router.get('/:slug', authenticateToken, authorizeRoles('supervise', 'shopper'), getProductById);
router.put('/:slug',  authenticateToken, authorizeRoles('supervise'), uploadUpdate.any(), updateProduct);
router.patch('/:id', authenticateToken, authorizeRoles( 'shopper'), updateProductType);
router.patch('/updateStock/:id', authenticateToken, authorizeRoles( 'supervise'), updateProductStock);
router.patch('/notifyToUser/:id', authenticateToken, authorizeRoles( 'supervise'), notifyProductToUser);
router.delete('/:id',  authenticateToken, authorizeRoles('supervise'),deleteProduct);

// Export the router
export default router;