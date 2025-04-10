## DB Overview
**NPK Interior** In this project, we are building a modern e-commerce platform for home interior decor. The project is built using a modern mongodb database. And, these are the queries that are used to manage data from the database.

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

#### `POST /products` - Store all products from the database.
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