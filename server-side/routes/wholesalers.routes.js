import express from "express";

const router = express.Router();

import {
    addWholesaler,
    getWholesalers,
    getWholesalerById,
    updateWholesaler,
    deleteWholesaler, getRequestedStocks
} from "../controllers/wholesalers.controller.js";

import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";
import multer from "multer";
import fs from "fs";
import path from "path";
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
// Create a multer instance with a fileFilter that captures the wholesaler index
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        console.log(file)
        // Extract wholesaler index from field name (e.g., "images-0")
        const match = file.fieldname.match(/^images-(\d+)$/);
        if (match) {
            // Store the wholesaler index in the file object for later use
            file.wholesalerIndex = parseInt(match[1]);
        }
        cb(null, true);
    }
});
router.post('/', authenticateToken, authorizeRoles('supervise'), upload.any(), addWholesaler);
router.get('/', authenticateToken, authorizeRoles('supervise'), getWholesalers);
router.get('/getRequestedStocks', authenticateToken, authorizeRoles('wholesaler'), getRequestedStocks);
router.get('/:id', authenticateToken, authorizeRoles('supervise'), getWholesalerById);
router.put('/:id', authenticateToken, authorizeRoles('supervise'), updateWholesaler);
router.delete('/:id', authenticateToken, authorizeRoles('supervise'), deleteWholesaler);

export default router;