// Import mongoose using ES module syntax
import mongoose from 'mongoose';

// Define the product schema
const productSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true, required: true },
    description: { type: String, required: true },
    category: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
        name: { type: String, required: true }
    },
    subCategory: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory", required: true },
        name: { type: String }
    },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    discountedPrice: { type: Number, default: 0 },
    remainingCount: { type: Number, default: 0 },
    emiStartsAt: { type: Number, default: 0 },
    annualInterest: { type: Number, default: 0 },
    stock: { type: String, required: false },
    productType: { type: String, required: false },
    emiDetails: [{
        month: Number,
        monthlyEmi: Number,
        totalPayable: Number,
        interestAmount: Number,
        principal: Number
    }],
    images: [],
    notifyUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    cartUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    wishlistUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    specifications: {
        brand: String,
        washingInstructions: String,
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
    bulkUpload: { type: Boolean, default: false },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
    createdBy: {  type: mongoose.Schema.Types.ObjectId, ref: "User", required: true  },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

// Create a text index on the name field for searching
productSchema.index({ name: 'text' });

// Create and export the Product model using ES module syntax
const Product = mongoose.model('Product', productSchema);
export default Product;