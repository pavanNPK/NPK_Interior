// Import mongoose using ES module syntax
import mongoose from 'mongoose';

// Define the product schema
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    category: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
        name: { type: String, required: true }
    },
    subCategory: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" },
        name: { type: String }
    },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    stock: { type: String, required: true },
    images: [{ key: String, originalName: String,  }],
    specifications: {
        material: String,
        dimensions: String, // Example: "200x80x90 cm"
        weight: String, // Example: "40 KG"
        color: String,
        finish: String, // Matte, Glossy, etc.
        warranty: String, // Example: "2 Years"
    },
    additionalDetails: { type: String },
    // seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Create and export the Product model using ES module syntax
const Product = mongoose.model('Product', productSchema);
export default Product;