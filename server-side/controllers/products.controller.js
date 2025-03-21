// Import mongoose and the Category model with ES module syntax
import mongoose from 'mongoose';
import Product from '../models/product.model.js';
import slugify from 'slugify';
import {uploadFilesOnS3, uploadS3} from "./s3upload.controller.js";


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
    console.log(JSON.stringify(req.body, null, 2), "req.body NPK");
    try {
        const products = req.body; // Expecting an array of product objects

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid product data" });
        }

        let savedProducts = [];

        for (let product of products) {
            // Generate initial slug
            let slug = slugify(product.name, { lower: true, strict: true });

            // Ensure unique slug
            let existingProduct = await Product.findOne({ slug }, {}, { lean: true }).exec();
            let count = 1;
            while (existingProduct) {
                slug = `${slug}-${count}`;
                existingProduct = await Product.findOne({ slug }, {}, { lean: true }).exec();
                count++;
            }

            // Set the folder name as the product slug for S3 uploads
            req.query.folderName = slug;
            req.files = product.images

            // Handle image uploads to S3
            const uploadedFiles = await uploadFilesOnS3(req, res);

            console.log(uploadedFiles, 'uploadedFiles')


            // Store uploaded images in the product object
            product.slug = slug;
            product.images = uploadedFiles;
            product.createdAt = new Date();
            product.updatedAt = new Date();

            // Save the product
            const newProduct = new Product(product);
            const savedProduct = await newProduct.save();
            savedProducts.push(savedProduct);
        }

        res.status(201).json({
            success: true,
            message: "Products created successfully",
            response: savedProducts, // Return saved products
        });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({
            success: false,
            message: "Error creating product",
            error: error.message,
        });
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