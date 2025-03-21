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
```

__After storing the images, we can store the products in the database:__

```aiignore
// Controller function to handle product creation
const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create product' });
    }
};
```
