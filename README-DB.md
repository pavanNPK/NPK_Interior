## Overview
**NPK Interior** In this project, we are building a modern e-commerce platform for home interior decor. The project is built using a modern mongodb database. And, these are the queries that are used to fetch data from the database.

## Categories
`GET /categories` - Fetches all categories from the database but not the subcategories.
```
db.categories.find({}, { subCategories: 0 }).sort({ name: 1 })
```
- if we want to show subcategories, we can use the following query:
```
db.categories.find({}).sort({ name: 1 })
```