// Import express using ES module syntax
import express from 'express';

// Create a router instance
const router = express.Router();

// Import ratings controller using ES module syntax
import {
    addRating,
    getRatings,
    getRatingsByProduct,
    updateRating,
    deleteRating
} from '../controllers/ratings.controller.js';

// Define routes
router.post('/', addRating);
router.get('/', getRatings);
router.get('/:id', getRatingsByProduct);
router.put('/:id', updateRating);
router.delete('/:id', deleteRating);

// Export router using ES module syntax
export default router;