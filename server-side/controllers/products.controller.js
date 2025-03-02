// Import mongoose and the Category model with ES module syntax
import mongoose from 'mongoose';
import Product from '../models/product.model.js';


// Get all products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({}, {}, { lean: true }).exec();
        res.json({response: products, success: true, message: "Products fetched successfully"});
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ response: null, success: false, message: 'Error fetching products' });
    }
};


// Get product by id
export const getProductById = async (req, res) => {
    const id = req.params.id;
    try {
        const product = await Product.findById(mongoose.Types.ObjectId(id), {}, { lean: true }).exec();
        res.json({response: product, success: true, message: "Product fetched successfully"});
    } catch (error) {
        console.error('Error fetching product by id:', error);
        res.status(404).json({response: null, success: false, message: 'Product not found' });
    }
};


// Add a product
export const addProduct = async (req, res) => {
    try {
        // Create a new Product instance with the data from the request body
        const product = new Product(req.body);
        // The 'save' method returns a promise that resolves to the saved document
        // It will throw an error if the document is invalid or if there is a problem
        // with the database connection
        await product.save()
            .then(result => {
            })
            .catch(err => {
                console.error('Error saving product:', err);
            });
        res.status(201).json({response:product, success: true, message: "Product created successfully"});
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({response: null, success: false, message: 'Error creating product' }); // 500 Internal Server Error
    }
};


// Update a product
export const updateProduct = async (req, res) => {
    const id = req.params.id;
    try {
        // findByIdAndUpdate returns the updated document by default,
        // but if { new: true } is specified, it returns the updated document
        // with the new data instead of the old data.
        // We use mongoose.Types.ObjectId(id) to convert the id to an ObjectId
        // because req.params.id is a string
        const updatedProduct = await Product.findByIdAndUpdate(mongoose.Types.ObjectId(id), req.body, { new: true, upsert: true }).exec();
        res.json({response: updatedProduct, success: true, message: "Product updated successfully"});
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({response: null, success: false, message: 'Error updating product' });
    }
};


// Delete a product
export const deleteProduct = async (req, res) => {
    const id = req.params.id;
    try {
        await Product.findByIdAndDelete(mongoose.Types.ObjectId(id)).exec();
        res.json({response: null, success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({response: null, success: false, message: 'Error deleting product' });
    }
};