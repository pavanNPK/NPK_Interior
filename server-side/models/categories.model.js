const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now }
});

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    subCategories: [subCategorySchema], // Array of subcategories
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Category', categorySchema);
