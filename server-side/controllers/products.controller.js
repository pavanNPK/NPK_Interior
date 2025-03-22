// Import mongoose and the Category model with ES module syntax
import mongoose from 'mongoose';
import Product from '../models/product.model.js';
import slugify from 'slugify';
import fs from 'fs';


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

export const addProduct = async (req, res) => {
    console.log("Received req.body:", JSON.stringify(req.body, null, 2));

    try {
        console.log("======= Incoming Request =======");

        // Check if the data is already in a structured format
        let productsData = [];

        if (req.body.products && Array.isArray(req.body.products)) {
            // If the body already contains a product array, use it directly
            productsData = req.body.products;
        } else {
            // Extract products from the format products[0][name], products[0][description], etc.
            const productIndices = new Set();

            // First, identify all product indices from the form data
            Object.keys(req.body).forEach(key => {
                const match = key.match(/^products\[(\d+)]\[([^[\]]+)]$/);
                if (match) {
                    productIndices.add(parseInt(match[1]));
                }
            });

            // Then construct each product object
            productIndices.forEach(index => {
                const product = {};
                Object.keys(req.body).forEach(key => {
                    const match = key.match(/^products\[(\d+)]\[([^[\]]+)]$/);
                    if (match && parseInt(match[1]) === index) {
                        const fieldName = match[2];
                        product[fieldName] = req.body[key];
                    }
                });
                productsData.push(product);
            });
        }

        console.log("Parsed products array:", productsData);

        if (productsData.length === 0) {
            return res.status(400).json({ success: false, message: "No valid products found" });
        }

        // Group files by product index
        const filesByProductIndex = {};

        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                // Get the product index from the field name (e.g., "images-0")
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
                        path: imagePath,
                        base64: base64Image,
                    });
                }
            });
        }

        // Process each product
        let savedProducts = [];

        for (let productIndex = 0; productIndex < productsData.length; productIndex++) {
            const product = productsData[productIndex];
            console.log("Processing product:", product);

            // Parse fields that should be objects
            try {
                product.category = typeof product.category === "string" ? JSON.parse(product.category) : product.category;
                product.subCategory = typeof product.subCategory === "string" ? JSON.parse(product.subCategory) : product.subCategory;
                product.specifications = typeof product.specifications === "string" ? JSON.parse(product.specifications) : product.specifications;
            } catch (e) {
                console.error("Error parsing product fields:", e);
                return res.status(400).json({ success: false, message: "Invalid JSON in product fields" });
            }

            // Convert string values to boolean
            product.isFeatured = product.isFeatured === "true";
            product.isTrending = product.isTrending === "true";
            product.isNewArrival = product.isNewArrival === "true";

            // Assign images to this specific product
            product.images = filesByProductIndex[productIndex] || [];

            console.log(`Product ${productIndex} has ${product.images.length} images`);

            // Generate unique slug
            let slug = slugify(product.name, { lower: true, strict: true });
            let existingProduct = await Product.findOne({ slug }, {}, { lean: true }).exec();
            let count = 1;

            while (existingProduct) {
                slug = `${slug}-${count}`;
                existingProduct = await Product.findOne({ slug }, {}, { lean: true }).exec();
                count++;
            }

            product.slug = slug;
            product.createdAt = new Date();
            product.updatedAt = new Date();

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