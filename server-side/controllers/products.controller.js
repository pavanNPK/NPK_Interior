// Import mongoose and the Category model with ES module syntax
import Product from '../models/product.model.js';
import {cartSchema} from "../models/cart.model.js";
import {wishlistSchema} from "../models/wishlist.model.js";
import slugify from 'slugify';
import fs from 'fs';
import {deleteFileFromS3, getSignedUrlForS3, migrateS3Folder, uploadWithPutObject} from "./s3upload.controller.js";
import {getDbConnection, getModel} from "./dbSwitch.controller.js";

// Get all products
export const getProducts = async (req, res) => {
    try {
        const searchQuery = req.query.search
            ? { name: { $regex: req.query.search, $options: 'i' } }
            : {};

        const userId = req.user.id;
        const objectUserId = userId ? new Object(userId) : null;

        const products = await Product.find(
            searchQuery,
            {
                name: 1,
                _id: 1,
                cart: 1,
                wishlist: 1,
                description: 1,
                images: { $slice: 1 },
                slug: 1,
                price: 1,
                discount: 1,
                discountedPrice: 1,
                remainingCount: 1,
                notifyUsers: 1,
                cartUsers: 1,
                wishlistUsers: 1,
            }
        ).lean();

        const signedProducts = await Promise.all(products.map(async (product) => {
            const { notifyUsers, cartUsers, wishlistUsers, images, ...rest } = product;

            const notified = Array.isArray(notifyUsers) && objectUserId
                ? notifyUsers.some(id => id.toString() === objectUserId.toString())
                : false;

            const cart = Array.isArray(cartUsers) && objectUserId
                ? cartUsers.some(id => id.toString() === objectUserId.toString())
                : false;

            const wishlist = Array.isArray(wishlistUsers) && objectUserId
                ? wishlistUsers.some(id => id.toString() === objectUserId.toString())
                : false;

            if (images?.[0]?.key) {
                try {
                    images[0].url = await getSignedUrlForS3(images[0].key);
                } catch (err) {
                    console.warn(`Image signing failed for product ${product._id}:`, err.message);
                }
            }

            return {
                ...rest,
                images,
                notified,
                cart,
                wishlist
            };
        }));

        res.json({
            response: signedProducts,
            success: true,
            message: "Products fetched successfully"
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            response: null,
            success: false,
            message: 'Error fetching products'
        });
    }
};

// Get product by id
export const getProductById = async (req, res) => {
    const userId = req.user.id;
    const objectUserId = userId ? new Object(userId) : null;
    try {
        const product = await Product.findOne({ slug: req.params.slug }).lean();

        if (product?.images?.length) {
            const urls = await Promise.all(
                product.images.map(img => getSignedUrlForS3(img.key))
            );
            product.images = product.images.map((img, i) => ({ ...img, url: urls[i] }));
        }
        product.notified = Array.isArray(product.notifyUsers) && objectUserId
            ? product.notifyUsers.some(id => id.toString() === objectUserId.toString())
            : false;

        product.cart = Array.isArray(product.cartUsers) && objectUserId
            ? product.cartUsers.some(id => id.toString() === objectUserId.toString())
            : false;

        product.wishlist = Array.isArray(product.wishlistUsers) && objectUserId
            ? product.wishlistUsers.some(id => id.toString() === objectUserId.toString())
            : false;

        res.json({ response: product, success: true, message: "Product fetched successfully" });
    } catch (error) {
        console.error('Error:', error);
        res.status(404).json({ response: null, success: false, message: 'Product not found' });
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
            product.fetchRemainingTime = new Date();
            product.createdBy = req.user.id;
            product.updatedBy = req.user.id;
            product.remainingCount = 0;

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
        let oldSlug = slug; // Store the original slug for folder renaming
        let newSlug = null;
        // Parse JSON fields
        try {
            productDetails.category = JSON.parse(productDetails.category || "{}");
            productDetails.subCategory = JSON.parse(productDetails.subCategory || "{}");
            productDetails.specifications = JSON.parse(productDetails.specifications || "{}");
            productDetails.emiDetails = JSON.parse(productDetails.emiDetails || "[]");
            productDetails.loadedImages = JSON.parse(productDetails.loadedImages || "[]");
            productDetails.removedImages = JSON.parse(productDetails.removedImages || "[]");

            // Check if name has changed and generate new slug
            if (productDetails.oldName !== productDetails.name) {
                newSlug = slugify(productDetails.name, { lower: true, strict: true });
                let existingProduct = await Product.findOne({ slug: newSlug }).lean().exec();
                let count = 1;

                while (existingProduct) {
                    newSlug = `${newSlug}-${count}`;
                    existingProduct = await Product.findOne({ slug: newSlug }).lean().exec();
                    count++;
                }

                productDetails.slug = newSlug;

                // Update folder path for existing images
                if (productDetails.loadedImages.length) {
                    // Update the key paths for loaded images
                    productDetails.loadedImages = await migrateS3Folder(
                        productDetails.loadedImages,
                        oldSlug,
                        newSlug
                    );
                }

            }

            if (productDetails.removedImages.length){
                const keys = productDetails.removedImages.map(image => image.key);
                await deleteFileFromS3(keys);
            }
            let s3UploadedImages = [];
            let filesByProduct = [];

            if (productFiles.length){
                productFiles.forEach(file => {
                    const match = file.fieldname === "images";
                    if (match) {
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
            productDetails.updatedBy = req.user.id;
            productDetails.updatedAt = new Date();
            productDetails.fetchRemainingTime = new Date();

            if (productDetails.loadedImages.length){
                productDetails.loadedImages.forEach(x => {
                    delete x.url
                })
                productDetails.images = [...productDetails.images, ...productDetails.loadedImages];
            }
            delete productDetails.removedImages;
            delete productDetails.loadedImages;
            delete productDetails.oldName;

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
        let product = await Product.findById(id, {}, { lean: true }).exec();
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            const keys = product.images.map(image => image.key);
            await deleteFileFromS3(keys);
        }
        await Product.findByIdAndDelete(id, {lean: true}).exec();
        res.json({response: null, success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({response: null, success: false, message: 'Error deleting product' });
    }
};

export const updateProductType = async (req, res) => {
    const { id } = req.params;
    const type = req.body; // e.g. { cart: true } or { wishlist: false }
    const dbName = req.user.code;
    const userId = req.user.id;

    const typeKey = Object.keys(type)[0]; // 'cart' or 'wishlist'
    const shouldAdd = type[typeKey];

    if (!['cart', 'wishlist'].includes(typeKey)) {
        return res.status(400).json({ success: false, message: 'Invalid type key' });
    }

    // Determine which field to update: 'cartUsers' or 'wishlistUsers'
    const fieldKey = typeKey === 'cart' ? 'cartUsers' : 'wishlistUsers';
    const updateQuery = shouldAdd
        ? { $addToSet: { [fieldKey]: userId } } // Add userId if not already present
        : { $pull: { [fieldKey]: userId } };    // Remove userId if present

    try {
        const product = await Product.findByIdAndUpdate(
            id,
            updateQuery,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Respond to client
        res.status(200).json({
            success: true,
            message: `Product ${typeKey} status updated`,
            response: product,
        });

        // Optionally update separate Cart/Wishlist collection in background (if needed)
        const connection = await getDbConnection(dbName);
        const schemaMap = { cart: cartSchema, wishlist: wishlistSchema };
        const modelName = typeKey.charAt(0).toUpperCase() + typeKey.slice(1);
        const Model = getModel(connection, modelName, schemaMap[typeKey]);

        if (shouldAdd) {
            await Model.updateOne(
                { productId: id, userId },
                { $setOnInsert: { addedOn: new Date() } },
                { upsert: true }
            );
        } else {
            await Model.deleteOne({ productId: id, userId });
        }

    } catch (error) {
        console.error('Error updating product type:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Update failed', response: null });
        }
    }
};

export const notifyProductToUser = async (req, res) => {
    const { id } = req.params;
    const type = req.body;
    const userId = req.user.id;

    const typeKey = Object.keys(type)[0]; // e.g. 'notify'
    const shouldAdd = type[typeKey];

    try {
        const update = shouldAdd
            ? { $addToSet: { notifyUsers: userId } }
            : { $pull: { notifyUsers: userId } };

        const product = await Product.findByIdAndUpdate(
            id,
            update,
            { new: true, runValidators: true }
        ).lean().exec();

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({
            success: true,
            message: shouldAdd
                ? 'You have been added to notifications.'
                : 'You will no longer receive notifications.',
            response: null,
        });

    } catch (error) {
        console.error('Error updating notifyUsers:', error);
        return res.status(500).json({ success: false, message: 'Failed to update notifications.' });
    }
};

export const bulkUpload = async (req, res) => {
    try {
        const products  = req.body;
        let arr = [];
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            //check about slug
            let newSlug = product.slug;
            let existingProduct = await Product.findOne({ slug: newSlug }).lean().exec();
            if (existingProduct) {
                let count = 1;
                while (existingProduct) {
                    newSlug = `${product.slug}-${count}`;
                    existingProduct = await Product.findOne({ slug: newSlug }).lean().exec();
                    count++;
                }
                product.slug = newSlug;
            }
            product.createdBy = req.user.id;
            product.updatedBy = req.user.id;
            product.createdAt = new Date();
            product.updatedAt = new Date();
            product.bulkUpload = true;
            arr.push(product);
        }
        await Product.insertMany(arr);
        res.json({response: null, success: true, message: 'Products uploaded successfully' });
    } catch (error) {
        console.error('Error uploading products:', error);
        res.status(500).json({response: null, success: false, message: 'Error uploading products' });
    }
};