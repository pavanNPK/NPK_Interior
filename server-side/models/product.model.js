// Import mongoose using ES module syntax
import mongoose from 'mongoose';

// Define the product schema
const productSchema = new mongoose.Schema({
    productName: String,
    productType: String,
    productPrice: Number,
    productDescription: String,
    productImage: { type: Object }  // Adjust if storing images differently
});

// Create and export the Product model using ES module syntax
const Product = mongoose.model('Product', productSchema);
export default Product;