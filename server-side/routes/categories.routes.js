const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories.controller');

router.post('/', categoriesController.addCategory);
router.get('/', categoriesController.getCategories);
router.get('/:id', categoriesController.getCategoryById);
router.put('/:type', categoriesController.updateCategory);
router.delete('/:id', categoriesController.deleteCategory);

module.exports = router;