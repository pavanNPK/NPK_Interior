const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
});

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    subCategories: [subCategorySchema] // Array of subcategories
});

module.exports = mongoose.model('Category', categorySchema);
