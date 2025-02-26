// Import required modules using ES module syntax
import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/product.model.js';

// Create a router instance
const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().exec();
        res.json({response: products, success: true, message: "Products fetched successfully"});
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ response: null, success: false, message: 'Error fetching products' });
    }
});

// Get product by id
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const product = await Product.findById(mongoose.Types.ObjectId(id)).exec();
        res.json({response: product, success: true, message: "Product fetched successfully"});
    } catch (error) {
        console.error('Error fetching product by id:', error);
        res.status(404).json({response: null, success: false, message: 'Product not found' });
    }
});

// Create a new product
router.post('/', async (req, res) => {
    const product = new Product(req.body);
    try {
        // The 'save' method returns a promise that resolves to the saved document
        // It will throw an error if the document is invalid or if there is a problem
        // with the database connection
        await product.save()
            .then(result => {
                console.log('Product saved:', result);
            })
            .catch(err => {
                console.error('Error saving product:', err);
            });
        res.status(201).json({response:product, success: true, message: "Product created successfully"});
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({response: null, success: false, message: 'Error creating product' });
    }
});

// Update a product
router.put('/:id', async (req, res) => {
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
});

// Delete a product
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await Product.findByIdAndDelete(mongoose.Types.ObjectId(id)).exec();
        res.json({response: null, success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({response: null, success: false, message: 'Error deleting product' });
    }
});

// Export the router using ES module syntax
export default router;