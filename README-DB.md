## DB Overview
**NPK Interior** In this project, we are building a modern e-commerce platform for home interior decor. The project is built using a modern mongodb database. And, these are the queries that are used to manage data from the database.

-----------------------------------------------------------------------------------
## Connect DB and Sub DB's for the dynamic requirements

```angular2html
import {getDbConnection, getModel} from "./dbSwitch.controller.js";
```
```angular2html
import mongoose from "mongoose";

const dbCache = new Map();

export const getDbConnection = async (dbName) => {
    if (dbCache.has(dbName)) {
        return dbCache.get(dbName);
    }
    const DB_URL = process.env.DB_URL.replace('npk_interior', dbName);
    const connection = await mongoose.createConnection(DB_URL).asPromise();
    dbCache.set(dbName, connection);
    return connection;
};

export const getModel = (connection, name, schema) => {
    return connection.models[name] || connection.model(name, schema);
};

export const closeDbConnection = (connection) => {
    for (let [dbName, conn] of dbCache.entries()) {
        if (conn === connection) {
            dbCache.delete(dbName); // Remove from cache
            break;
        }
    }
    connection.close();
};

```
#### We can use this controller when we want to switch between DB's

-----------------------------------------------------------------------------------
## Categories
#### `GET /categories` - Fetches all categories from the database but not the subcategories.
```
db.categories.find({}, { subCategories: 0 }).sort({ name: 1 })
```
- if we want to show subcategories, we can use the following query:
```
db.categories.find({}).sort({ name: 1 })
```
-----------------------------------------------------------------------------------

#### `POST /categories` - Insert the categories into database.

##### There ara some scenarios that we need to handle:

| Case          | Action  |
|---------------|---------|
| Category exists (c._id) but subCategories is empty/null       | Skipped, no update performed |
| Category exists (c._id) and has subCategories	          | Updated, new subcategories added |
| Category doesn't exist (c._id is missing)	       |     Created, including subcategories if provided    |          

- __Example for inserting categories:__
```
categories.forEach(category => {
    let categoryId = ObjectId(); // Generate a unique _id for the category
    let timestamp = new Date();

    let subCategories = category.subcategories.map(sub => ({
        _id: ObjectId(), // Generate a unique _id for each subcategory
        name: sub.name,
        description: sub.description,
        category_id: categoryId, // Link subcategories to the parent category
        createdOn: timestamp,
        updatedOn: timestamp
    }));

    db.categories.insertOne({
        _id: categoryId,
        name: category.name,
        description: category.description,
        subCategories: subCategories,
        createdOn: timestamp,
        updatedOn: timestamp
    });
});

```
- Here i'm inserting new keys `createdOn` and `updatedOn` in all the categories. As well as inside the subcategories of each category.:
```
db.categories.updateMany({}, {$set: { createdOn: new Date(), updatedOn: new Date() }})

db.categories.updateMany({}, {$set: { "subCategories.$[].createdOn": new Date(),"subCategories.$[].updatedOn": new Date() }})
```
- __Example for inserting and updating categories / subcategories through the API:__

```
for (const c of categories) {
    if (c?._id) {
        // If category exists, insert only new subcategories
        if (c.subCategories?.length > 0) {
            await Category.findByIdAndUpdate(
                c._id,
                { 
                    $push: { 
                        subCategories: { 
                            $each: c.subCategories.map(sub => ({
                                _id: new mongoose.Types.ObjectId(),
                                name: sub.name,
                                description: sub.description,
                                category_id: mongoose.Types.ObjectId(c._id),
                            }))
                        }
                    }
                },
                { new: true }
            );
        }
    } else {
        // If category does not exist, create it with subcategories
        await Category.create({
            name: c.name,
            description: c.description,
            subCategories: c.subCategories?.map(sub => ({
                _id: new mongoose.Types.ObjectId(),
                name: sub.name,
                description: sub.description
            })) || []
        });
    }
}

```
 #### If the category ID (_id) exists:
  * it checks if subcategories are provided.
  * If subcategories exist, it updates the category by pushing the new subcategories into subCategories using push with each.


#### If the category ID (_id) doesn't exist:
  * it creates a new category.
  * If subcategories exist, they are included during category creation.


> #### This ensures:
  >* New categories are created only when needed.
  >* Subcategories are added only when provided.
  >* Existing categories remain unchanged if no subcategories are given.

-------------------------------------------------------------------------------------------------
#### `UPDATE /categories` - Modify the categories / subcategories in database.

__Example for updating the categories / subcategories through the API:__
* `PUT /categories/:type, body: { _id, name, description, updatedOn }`

>Based on the type, This will update the category / subcategory with the given _id.

```aiignore
if (type === "Category") {
    updatedCategory = await Category.findByIdAndUpdate(id, { ...data, updatedOn: new Date() }, { new: true });
} else if (type === "Sub Category") {
    updatedCategory = await Category.findOneAndUpdate(
        { "subCategories._id": data._id },
        { $set: { "subCategories.$": { ...data, updatedOn: new Date() } } },
        { new: true }
    );
}
```
-------------------------------------------------------------------------------------------------
#### `DELETE /categories` - Remove the categories / subcategories from the database.

__Example for removing the categories / subcategories through the API:__
* `DELETE /categories/${id}?type=${type}}`

>Based on the type, This will remove the category / subcategory with the given _id.

```aiignore
if (type === "Category") {
    const deleted = await Category.findByIdAndDelete(id);
}
if (type === "Sub Category") {
    const updated = await Category.updateOne(
        { "subCategories._id": id },
        { $pull: { subCategories: { _id: id } } }
    );
};
```
#### How it works:
* type=category → Deletes the whole category using findByIdAndDelete(req.body._id).
* type=subcategory →  Deletes a specific subcategory using findByIdAndUpdate(id, { $pull: { subCategories: { _id: id } } }).

-----------------------------------------------------------------------------------

## Products

#### `POST /products` - Store all products into the database.
* Before storing products, We are storing the images in `AWS S3` bucket. So, we can store the product images in the database in URL format.
* Based on product name (Using `SLUG`), we are storing the products. And, we are storing the images.
* By `SLUG` we can easily modify the products.

__First connect the AWS S3 bucket:__

```aiignore
// For process.env we have to import dotenv and then use dotenv.config();
// In ES modules, __dirname is not available, so we need to recreate it
// Get the current file's path from the import.meta.url (ES modules feature)
const __filename = fileURLToPath(import.meta.url);

// Extract the directory path from the file path
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in the project directory
dotenv.config({ path: path.join(__dirname, '../.env') });

// Create S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const uploadS3 = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.AWS_BUCKET_NAME,
        metadata: function (req, file, cb) {
            // Set a metadata field for the uploaded file
            // This could be used to store additional information about the file,
            // For example, the field name of the file
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            // Set the key (file name) for the uploaded file
            // This could be used to store the file in a specific folder or with a specific name
            // In this case, we're creating a folder based on the productId query parameter
            // and storing the file with a timestamp and the original file name
            const productId = req.query.productId || 'default';
            const fileName = `${Date.now()}-${file.originalname.replace(/\s/g, '-')}`;
            const fullPath = `uploads/${productId}/${fileName}`;
            cb(null, fullPath);
        }
    }),
    limits: {
        // Set the maximum file size
        // In this case, we're allowing up to 5MB files
        fileSize: 1024 * 1024 * 5
    }
});
// Controller function to handle uploads
const uploadFilesOnS3 = async (req, res) => {
    try {
        const files = await uploadS3.array('files')(req, res);
        res.status(200).json({ message: 'Files uploaded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upload files' });
    }
};


some changes happened upload files on S3 bucket one method is use uploadWithPutObject(buffer, path, type, folderName, fileName, fullPath)
for getting the image url we can use getSignedUrl method from aws sdk getSignedUrl(key)

we need the base64 data and then we can modified that

let modifiedBuffer = Buffer.from(buffer.replace(/^data:image\/\w+;base64,/, ""),'base64')

```

__After storing the images, we can store the products in the database:__

```aiignore
1. Controller function to handle product creation
2. Here we are storing multiple products and along with each prodcut we uploading multiple files.
3. We need to get the data as formData from client side. And, then we can read that based on index.
4. For images also we need to assign index of products array.
5. Then we need to convert the files as base64 format form server side to decrease the load.
6. Before converting the files to base64, we need to store them into our local uploads and retrive that file and convert it to base64.
7. After converting the files to base64, we can store them into the AWS S3 bucket.
8. After storing the images in AWS S3 bucket, we can store the products in the database along with S3 image url.

const createProduct = async (req, res) => {
    try {

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
       
       ...look for entire code at products.controller.js
       
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create product' });
    }
    
    
9. We are generating the slug that slug we are using the foldername to store the image url for AWS S3 bucket.

};
```

-----------------------------------------------------------------------------------

`GET /products` - Fetches all products from the database and generates signed URLs for the images.

```
db.products.find({}, {}).sort({ name: 1 })
```
* While fetching the products, we are also fetching the images from AWS S3 bucket. So, we can get the images in URL format.
* Signed URL, Expires in 1 hour.

```angular2html
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
```
-----------------------------------------------------------------------------------

`GET /product/:slug` - Fetches the product from the database base on slug and generates signed URLs for the images.

```angular2html
const product = await Product.findOne({slug: slug}, {}, { lean: true }).exec();
if (product.images && Array.isArray(product.images) && product.images.length > 0) {
  for (let j = 0; j < product.images.length; j++) {
      // get signed url
      product.images[j].url = await getSignedUrlForS3(product.images[j].key);
  }
}
```                                                                                                       

-----------------------------------------------------------------------------------

`Presigned URL For AWS S3` - For get all products and by single product we are using this.

```angular2html
const getSignedUrlForS3 = async ( key) => {
    try {
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
        };
        const command = new GetObjectCommand(params);
        // Link valid for 1 hour
        return await getSignedUrl(s3Client, command, {expiresIn: 3600});
    } catch (error) {
        console.error("Error generating signed URL:", error);
        throw error;
    }
};
```
-----------------------------------------------------------------------------------

`PUT /product/:slug` - Update the product to the database base on slug.
* Before updating check the product name is changed or not. If it is changed, we need to update the slug as well.
* If the slug is changed, we need to update the `S3` folder name as well.
* For that first we need to copy of `folder` and remove the files from the old folder name and add the files to `new folder` name.
* Then we need to delete the old folder name from `S3` bucket.
* We are getting the data from client side as `FORMDATA` as object but for `Add Product` we are getting the data as `ARRAY FORMDATA` format. So, we need to use it as `JSON.Stringify` format.


```angular2html
// Update folder path for existing images
if (productDetails.loadedImages.length) {
// Update the key paths for loaded images
productDetails.loadedImages = await migrateS3Folder(
    productDetails.loadedImages,
    oldSlug,
    newSlug
    );
}
```

```angular2html
const migrateS3Folder = async (images, oldSlug, newSlug) => {
const updatedImages = [];

  for (const image of images) {
    try {
      const oldKey = image.key;
      // Create a new key by replacing the old slug with the new one
      const newKey = oldKey.replace(`uploads/${oldSlug}/`, `uploads/${newSlug}/`);
      // Copy the object to the new location
      await copyS3Object(oldKey, newKey);
      
      // Delete the original object
      await deleteFileFromS3([oldKey]);
      
      // Update the image data with the new key
      const updatedImage = {
        ...image,
        key: newKey
      };
      updatedImages.push(updatedImage);
    } catch (error) {
      console.error('Error migrating folder:', error);
      // Keep the original image data if migration fails
      updatedImages.push(image);
    }
  }
  
  return updatedImages;
};

const copyS3Object = async (sourceKey, destinationKey) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      CopySource: `${process.env.AWS_BUCKET_NAME}/${sourceKey}`,
      Key: destinationKey
    };
    await s3Client.send(new CopyObjectCommand(params));
    console.log(`Successfully copied ${sourceKey} to ${destinationKey}`);
    return true;
  } catch (error) {
    console.error('Error copying object:', error);
    throw error; // Throw error so the calling function can handle it properly
  }
};

```
-----------------------------------------------------------------------------------
#### `UPDATE /Cart or Wishlist` - Modify the cart / wishlist in database.

__Example for updating the cart / wishlist through the API:__
* `PUT /products/:id, body: { _id,  {cart: true } or { wishlist: false } }`

>Based on the type, This will update the cart / wishlist with the given _id.
> 
> Here we switched to the user DB from main db based on code. Because we are maintaining the cart and wishlist DB for each user.
```aiignore
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
```
-----------------------------------------------------------------------------------
#### `UPDATE /notifyUsers` - To notify the users when the product back to stock.

__Example for notify users for products through the API:__
* `PUT /products/notifyToUser/:id, body: { _id,  {notify: true } }`

>Based on the type, This will update the notify users with the given _id.

```aiignore
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
```

>What is `$addToSet` and `$pull` doing? Why are they used here?
> 
> **$addToSet** ( Prevents duplicates.)
> > **Purpose**: Adds a value to an array only if it does NOT already exist.
> 
> > **In this code:** notifyUsers is an array in your Product document (MongoDB collection). <br><br>
> > When shouldAdd is true, it means the user wants to start receiving notifications.<br>
> > **$addToSet**: { notifyUsers: userId } adds the user's ID to the notifyUsers array only if it’s not already there.

>
> **$pull** (  Cleanly unsubscribes without affecting others..)
> > **Purpose**: Removes a value from an array if it exists.
>
> > **In this code:** <br><br>
> > When shouldAdd is false, it means the user wants to unsubscribe from notifications.<br>
> > **$pull**: { notifyUsers: userId } removes their user ID from the notifyUsers array if it's there.


**$addToSet**: Prevents duplicate user IDs from piling up in notifyUsers.

**$pull**: Safely removes user ID without crashing or needing a manual search.

**Both**: Keep your MongoDB document clean, efficient, and easy to manage.

-----------------------------------------------------------------------------------
### General Improvements

#### getProducts


> **DRY Principle**: Extract repeated logic (e.g., parsing request body keys, S3 upload code) into reusable helper functions.
> 
> **Error Handling**: Create a centralized error handler instead of repeating try-catch blocks.
> 
> **Logging**: Use a logging library (like winston or pino) instead of console.log or console.error for better traceability.
> 
> **Validation** : Validate incoming request data early (e.g., using Joi, Zod, or a custom validator) to avoid processing invalid data.
>
> **Performance** : Use Promise.all where multiple async operations can happen in parallel (you are already doing this nicely for products).
>
> **Environment** Checks: Avoid expensive operations (like image base64 conversion) if not needed in production environments.

#### addProduct

> **Request Parsing**: Move the parsing of the weird products[index][field] request body into a utility function like parseProductsFromRequest(req.body).
>
> **File Handling**: Instead of syncing (fs.unlinkSync), use fs.promises.unlink() with await for non-blocking behavior.
> 
> **Slug Generation**: Cache the slug lookup to avoid multiple DB hits while checking uniqueness (or do it smarter with MongoDB indexes if possible).
>
> **Image Upload**: Upload images in parallel using Promise.all where safe to improve performance.
>
> **Error Aggregation**: Instead of stopping at the first image upload failure, collect errors and report them all at once if needed.
>
> **Field Conversion**: Create a normalizeProductFields(product) helper to handle parsing of JSON fields, boolean conversions, etc.

-----------------------------------------------------------------------------------

## Wholesalers

#### `POST /wholesalers` - Store all wholesalers into the database.
* while storing the wholesalers, We are storing the images in `CLOUDINARY` storage. So, we can store the wholesaler images in the database in URL format.
* Generate a unique `CODE` for each wholesaler.
* Create Dynamic DB name for each wholesaler Based on `CODE`.
* Based on wholesaler `CODE` (Using `dynamic DB name`), we are storing the wholesalers. And, we are storing the images.
* By `CODE` we can easily modify the wholesalers in `CLOUDINARY`.

__First connect the CLOUDINARY:__

```angular2html
import {v2 as cloudinary} from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary
```
```angular2html
// Helper to generate unique code
const generateUniqueCode = async () => {
  let code;
  do {
    const randomString = Math.random().toString(36).slice(2, 9);
    const digitCount = (randomString.match(/\d/g) || []).length;
    if (digitCount >= 2 && digitCount <= 3) {
         code = 'NPK_WS_' + randomString;
    }
  } while (!code || await Wholesaler.exists({ code }));
  return code;
};

```
```angular2html
// Function to dynamically create a new database using user.code
const createDatabase = async (dbName, wholesalerData) => {
        try {
          const DB_URL = process.env.DB_URL;
          const dbURI = DB_URL.replace("npk_interior", dbName);
          const newDbConnection = mongoose.createConnection(dbURI);

        // Define the "users" schema
        const ShopAccountSchema = new mongoose.Schema({
            //required schema
        });

    // Create the "account_detail" collection
    const ShopAccountModel = newDbConnection.model('account_detail', ShopAccountSchema);

    // Insert the first SHOP account record
    await ShopAccountModel.insertOne({
        //required data
    });

    console.log(`Database '${dbName}' created with 'account_detail' collection and initial wholesaler record.`);
    return newDbConnection;
    } catch (error) {
      console.error(`Failed to create database '${dbName}':`, error);
      throw error;
    }
};

```
```aiignore
import cloudinary from "./cloudinary.controller.js";
try {
        const wholesalersData = Array.isArray(req.body.wholesalers) ? req.body.wholesalers : [];

        if (wholesalersData.length === 0) {
            return res.status(400).json({ success: false, message: "No valid wholesalers found" });
        }

        // Check duplicate emails
        const duplicateEmails = await Wholesaler.find({
            email: { $in: wholesalersData.map(w => w.email.toLowerCase()) }
        }).lean();

        if (duplicateEmails.length > 0) {
            return res.status(400).json({ success: false, message: "Email already registered. Use a different email." });
        }

        // Group uploaded files by wholesaler index
        const filesByWholesalerIndex = {};
        if (req.files?.length > 0) {
            for (const file of req.files) {
                const match = file.fieldname.match(/^images-(\d+)$/);
                if (match) {
                    const index = parseInt(match[1]);
                    filesByWholesalerIndex[index] = filesByWholesalerIndex[index] || [];
                    filesByWholesalerIndex[index].push(file);
                }
            }
        }

        // Process and prepare wholesalers
        const wholesalersToSave = await Promise.all(
            wholesalersData.map(async (wholesaler, index) => {
                const files = filesByWholesalerIndex[index] || [];
                const code = await generateUniqueCode();

                await createDatabase(code, wholesaler);

                delete wholesaler.gstNumber;
                delete wholesaler.panNumber;
                delete wholesaler.bankName;
                delete wholesaler.bankAccountNumber;
                delete wholesaler.IFSCCode;

                // Upload images to Cloudinary
                const uploadedImages = await Promise.all(
                    files.map(async (file) => {
                        try {
                            const result = await cloudinary.uploader.upload(file.path, {
                                folder: `wholesalers/${code}`,
                                public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
                                resource_type: "image"
                            });

                            return {
                                name: file.originalname,
                                type: file.mimetype,
                                key: result.secure_url,
                                keyId: result.public_id
                            };
                        } finally {
                            fs.unlink(file.path, (err) => {
                                if (err) console.error('File delete error:', err);
                            });
                        }
                    })
                );

                return {
                    ...wholesaler,
                    code,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    createdBy: req.user.id,
                    updatedBy: req.user.id,
                    images: uploadedImages
                };
            })
        );

        // Insert all wholesalers
        const savedWholesalers = await Wholesaler.insertMany(wholesalersToSave);

        // Send invitation emails in parallel
        await Promise.all(savedWholesalers.map(sendInvitationToWholesaler));

        res.status(201).json({ success: true, wholesalers: savedWholesalers });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
```

> The handler begins by pulling `req.body.wholesalers` into a local array called `wholesalersData`; if that property is missing or not an array, it falls back to an empty array. If there are no entries to process, it immediately returns a 400 error, so you never waste work on an empty request.

> Next, it performs a single database lookup against the `Wholesaler` collection to see if any of the submitted emails (lowercased) already exist. Finding one or more duplicates here causes another 400 response, preventing duplicate‐account creation before any files are uploaded or records are written.

> The uploaded files arrive in fields named like `images-0`, `images-1`, etc. A simple regex extracts the index from each field name and groups those `req.files` into an object (`filesByWholesalerIndex`) so that later, when we process the nth wholesaler in the data array, we know exactly which files belong to it. 

> Then we `Promise.all` over `wholesalersData`, meaning each wholesaler object is processed in parallel. For each, a unique code is generated and passed (along with the wholesaler data) into `createDatabase—perhaps` to seed related records in other collections. We delete fields such as GST number, PAN, bank details, and IFSC from the object so that sensitive PII doesn’t accidentally get stored twice. We then upload that wholesaler’s files to Cloudinary all at once, mapping each upload result into an `{ name, type, key, keyId }` object, and using a `finally` block (with `fs.unlink`) to clean up the temporary file whether the upload succeeds or fails.

> Once every wholesaler has been transformed into the exact shape we want—including timestamps, `createdBy/updatedBy` from `req.user.id`, and an `images` array of upload metadata—we execute a single `insertMany` call. This bulk insertion is both faster and more atomic than saving each document one by one. Immediately afterward, we trigger invitation emails by mapping `savedWholesalers` through `sendInvitationToWholesaler` inside another `Promise.all`, so that email sending doesn’t block subsequent operations.

> Finally, on success we return HTTP 201 with the newly created wholesaler documents. Any exception thrown along the way bubbles up to the `catch`, where we log it and send back a generic 500 response with the error message. This structure—early validation, grouped file handling, parallel processing with `Promise.all`, bulk insert, and centralized error handling—keeps the code both efficient and maintainable.

#### Note:
  - The main reason for using `Promise.all` here is to run multiple asynchronous tasks in parallel, instead of waiting for each one to finish before starting the next. This is crucial for improving performance and efficiency.

Operation | Purpose | Why It’s Used Here | Benefit|
|-|-|-|-|
`Promise.all `for processing wholesalers & images | Execute all wholesalers data transformations and image uploads concurrently. | Avoids waiting for each wholesaler (and each of their file uploads) to finish before starting the next one, making the overall batch processing much faster. | - Parallel image uploads- Reduced total latency
`Promise.all` for sending invitation emails | Send all invitation emails at the same time instead of one-by-one. | Prevents blocking on each individual email send, so the API can complete faster and the server remains responsive while emails are dispatched in the background. | - Faster bulk notifications- Non-blocking I/O
Error handling with `Promise.all` | Immediately reject the batch if any sub-promise fails. | Ensures that a failure in any individual upload or email send is caught at the batch level, so you don’t end up with partial state (some wholesalers created, some not). | - Atomicity and consistency- Centralized errors