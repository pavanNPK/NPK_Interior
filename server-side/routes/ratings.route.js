const express = require('express');
const router = express.Router();
const ratingsController = require('../controllers/ratings.controller');

router.post('/', ratingsController.addRating);
router.get('/', ratingsController.getRatings);
router.get('/:id', ratingsController.getRatingsByProduct);
router.put('/:id', ratingsController.updateRating);
router.delete('/:id', ratingsController.deleteRating);

module.exports = router;
