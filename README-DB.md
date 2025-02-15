## DB Overview
**NPK Interior** In this project, we are building a modern e-commerce platform for home interior decor. The project is built using a modern mongodb database. And, these are the queries that are used to manage data from the database.

## Categories
`GET /categories` - Fetches all categories from the database but not the subcategories.
```
db.categories.find({}, { subCategories: 0 }).sort({ name: 1 })
```
- if we want to show subcategories, we can use the following query:
```
db.categories.find({}).sort({ name: 1 })
```
`POST /categories` - Insert the categories into database.

#### There ara some scenarios that we need to handle:

| Case          | Action  |
|---------------|---------|
| Category exists (c._id) but subCategories is empty/null       | Skipped, no update performed |
| Category exists (c._id) and has subCategories	          | Updated, new subcategories added |
| Category doesn't exist (c._id is missing)	       |     Created, including subcategories if provided    |          

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
 If the category ID (_id) exists:
  * it checks if subcategories are provided.
  * If subcategories exist, it updates the category by pushing the new subcategories into subCategories using push with each.


If the category ID (_id) doesn't exist:
  * it creates a new category.
  * If subcategories exist, they are included during category creation.


#### This ensures:
  * New categories are created only when needed.
  * Subcategories are added only when provided.
  * Existing categories remain unchanged if no subcategories are given.