const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: String,
    productType: String,
    productPrice: Number,
    productDescription: String,
    productImage: { type: Object }  // Adjust if storing images differently
});

module.exports = mongoose.model('Product', productSchema);