// Import mongoose and the Category model with ES module syntax
import mongoose from 'mongoose';
import Product from '../models/product.model.js';
import slugify from 'slugify';
import fs from 'fs';
import {deleteFileFromS3, getSignedUrlForS3, uploadWithPutObject} from "./s3upload.controller.js";


// Get all products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({}, {}, { lean: true }).exec();
        if (products.length){
            for (let i = 0; i < products.length; i++) {
                if (products[i].images && Array.isArray(products[i].images) && products[i].images.length > 0) {
                    for (let j = 0; j < products[i].images.length; j++) {
                        // get signed url
                        products[i].images[j].url = await getSignedUrlForS3(products[i].images[j].key);
                    }
                }
            }
        }
        res.json({response: products, success: true, message: "Products fetched successfully"});
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ response: null, success: false, message: 'Error fetching products' });
    }
};


// Get product by id
export const getProductById = async (req, res) => {
    const slug = req.params.slug;
    try {
        const product = await Product.findOne({slug: slug}, {}, { lean: true }).exec();
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            for (let j = 0; j < product.images.length; j++) {
                // get signed url
                product.images[j].url = await getSignedUrlForS3(product.images[j].key);
            }
        }
        res.json({response: product, success: true, message: "Product fetched successfully"});
    } catch (error) {
        console.error('Error fetching product by id:', error);
        res.status(404).json({response: null, success: false, message: 'Product not found' });
    }
};

export const addProduct = async (req, res) => {
    try {
        let productsData = [];

        // Handle structured and unstructured product data
        // Check if the request body contains an array of products
        if (req.body.products && Array.isArray(req.body.products)) {
            // If it does, assign it to the productsData array
            productsData = req.body.products;
        } else {
            // Otherwise, we need to extract the products from the request body
            const productIndices = new Set();

            // Iterate over each key in the request body
            Object.keys(req.body).forEach(key => {
                // Check if the key matches the pattern "products[index][field]"
                const match = key.match(/^products\[(\d+)]\[([^[\]]+)]$/);
                if (match) {
                    // If it does, add the index to the set of product indices
                    productIndices.add(parseInt(match[1]));
                }
            });

            // Iterate over each index in the set
            productIndices.forEach(index => {
                const product = {};
                // Iterate over each key in the request body
                Object.keys(req.body).forEach(key => {
                    // Check if the key matches the pattern "products[index][field]"
                    const match = key.match(/^products\[(\d+)]\[([^[\]]+)]$/);
                    if (match && parseInt(match[1]) === index) {
                        // If it does, add the field and value to the product object
                        product[match[2]] = req.body[key];
                    }
                });
                // Add the product object to the productsData array
                productsData.push(product);
            });
        }

        if (productsData.length === 0) {
            return res.status(400).json({ success: false, message: "No valid products found" });
        }

        // Organize files by product index
        const filesByProductIndex = {};

        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                const match = file.fieldname.match(/^images-(\d+)$/);
                if (match) {
                    const productIndex = parseInt(match[1]);
                    if (!filesByProductIndex[productIndex]) {
                        filesByProductIndex[productIndex] = [];
                    }

                    // Convert image to Base64
                    const imagePath = file.path;
                    const imageBuffer = fs.readFileSync(imagePath);
                    const base64Image = `data:${file.mimetype};base64,${imageBuffer.toString("base64")}`;

                    filesByProductIndex[productIndex].push({
                        name: file.originalname,
                        type: file.mimetype,
                        size: file.size,
                        path: file.path,
                        base64: base64Image
                    });
                }
            });
        }

        let savedProducts = [];

        for (let productIndex = 0; productIndex < productsData.length; productIndex++) {
            const product = productsData[productIndex];

            // Parse JSON fields
            try {
                product.category = JSON.parse(product.category || "{}");
                product.subCategory = JSON.parse(product.subCategory || "{}");
                product.specifications = JSON.parse(product.specifications || "{}");
                product.emiDetails = JSON.parse(product.emiDetails || "[]");
            } catch (e) {
                console.error("Error parsing product fields:", e);
                return res.status(400).json({ success: false, message: "Invalid JSON in product fields" });
            }

            // Convert booleans
            product.isFeatured = product.isFeatured === "true";
            product.isTrending = product.isTrending === "true";
            product.isNewArrival = product.isNewArrival === "true";

            // Assign images to this specific product if you want keep this without s3 keep it
            // product.images = filesByProductIndex[productIndex] || [];

            // Generate unique slug
            let slug = slugify(product.name, { lower: true, strict: true });
            let existingProduct = await Product.findOne({ slug }).lean().exec();
            let count = 1;

            while (existingProduct) {
                slug = `${slug}-${count}`;
                existingProduct = await Product.findOne({ slug }).lean().exec();
                count++;
            }

            product.slug = slug;
            product.createdAt = new Date();
            product.updatedAt = new Date();

            // Upload images to S3
            let s3UploadedImages = [];
            if (filesByProductIndex[productIndex]) {
                for (const image of filesByProductIndex[productIndex]) {
                    try {
                        const folderName = product.slug || 'npk-interior-default';
                        const fileName = `${image.name.replace(/\s/g, '-')}`;
                        const fullPath = `uploads/${folderName}/${fileName}`;

                        // Upload image to S3
                        const s3Response = await uploadWithPutObject(image.base64, image.path, image.type, folderName, fileName, fullPath);
                        s3UploadedImages.push(s3Response);

                        // Delete a local file after uploading
                        fs.unlinkSync(image.path);
                    } catch (error) {
                        console.error("Error uploading image to S3:", error);
                        return res.status(500).json({ success: false, message: "Error uploading image" });
                    }
                }
            }

            product.images = s3UploadedImages;

            // Save product to DB
            const newProduct = new Product(product);
            const savedProduct = await newProduct.save();
            savedProducts.push(savedProduct);
        }

        res.status(201).json({
            success: true,
            message: "Products created successfully",
            response: savedProducts,
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
    const slug = req.params.slug;
    try {
        let productDetails = req.body;
        let productFiles = req.files;
        // Parse JSON fields
        try {
            productDetails.category = JSON.parse(productDetails.category || "{}");
            productDetails.subCategory = JSON.parse(productDetails.subCategory || "{}");
            productDetails.specifications = JSON.parse(productDetails.specifications || "{}");
            productDetails.emiDetails = JSON.parse(productDetails.emiDetails || "[]");
            productDetails.loadedImages = JSON.parse(productDetails.loadedImages || "[]");
            productDetails.removedImages = JSON.parse(productDetails.removedImages || "[]");

            if (productDetails.removedImages.length){
                const keys = productDetails.removedImages.map(image => image.key);
                await deleteFileFromS3(keys);
            }
            let s3UploadedImages = [];
            let filesByProduct = [];

            if (productFiles.length){
                productFiles.forEach(file => {
                    const match = file.fieldname === "images";
                    console.log(match, 'NPK pf match 232....');
                    if (match) {
                        console.log(match, 'NPK matched ')
                        if (!filesByProduct) {
                            filesByProduct = [];
                        }

                        // Convert image to Base64
                        const imagePath = file.path;
                        const imageBuffer = fs.readFileSync(imagePath);
                        const base64Image = `data:${file.mimetype};base64,${imageBuffer.toString("base64")}`;

                        filesByProduct.push({
                            name: file.originalname,
                            type: file.mimetype,
                            size: file.size,
                            path: file.path,
                            base64: base64Image
                        });
                    }
                });
            }

            if (filesByProduct.length) {
                for (const image of filesByProduct) {
                    try {
                        const folderName = productDetails.slug || 'npk-interior-default';
                        const fileName = `${image.name.replace(/\s/g, '-')}`;
                        const fullPath = `uploads/${folderName}/${fileName}`;

                        // Upload image to S3
                        const s3Response = await uploadWithPutObject(image.base64, image.path, image.type, folderName, fileName, fullPath);
                        s3UploadedImages.push(s3Response);

                        // Delete a local file after uploading
                        fs.unlinkSync(image.path);
                    } catch (error) {
                        console.error("Error uploading image to S3:", error);
                        return res.status(500).json({ success: false, message: "Error uploading image" });
                    }
                }
            }

            productDetails.images = s3UploadedImages;

            if (productDetails.loadedImages.length){
                productDetails.loadedImages.forEach(x => {
                    delete x.url
                })
                productDetails.images = [...productDetails.images, ...productDetails.loadedImages];
            }
            delete productDetails.removedImages;
            delete productDetails.loadedImages;

        } catch (e) {
            console.error("Error parsing product fields:", e);
            return res.status(400).json({ success: false, message: "Invalid JSON in product fields" });
        }
        const updatedProduct = await Product.findOneAndUpdate({slug: slug}, productDetails, { new: true, upsert: true }).exec();
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