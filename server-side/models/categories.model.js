import mongoose from 'mongoose';

const subCategorySchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    description: { type: String },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now }
});

const categorySchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    description: { type: String },
    subCategories: [subCategorySchema],
    createdOn: { type: Date, default: Date.now },
    updatedOn: { type: Date, default: Date.now }
});

const Category = mongoose.model('Category', categorySchema);

export default Category;