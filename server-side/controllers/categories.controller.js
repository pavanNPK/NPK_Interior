// Import mongoose and the Category model with ES module syntax
import mongoose from 'mongoose';
import Category from '../models/categories.model.js';

// Function to add category - using named export
export const addCategory = async (req, res) => {
    try {
        let categories = req.body;
        for (const c of categories) {
            if (c?._id) {
                // Category ID exists, check for subcategories
                if (c?.subCategories?.length > 0) {
                    // Subcategories are there, insert them
                    let subCategories = c.subCategories.map((subCategory) => ({
                        _id: new mongoose.Types.ObjectId(),
                        name: subCategory.name,
                        description: subCategory.description,
                        category_id: mongoose.Types.ObjectId(c._id),
                        updatedOn: new Date()
                    }));
                    await Category.findByIdAndUpdate(
                        c._id,
                        { $push: { subCategories: { $each: subCategories } } },
                        { new: true }
                    );
                }
            }
            else {
                // Category ID doesn't exist, create category
                let newCategoryId = new mongoose.Types.ObjectId();
                let newCategory = new Category({
                    _id: newCategoryId,
                    name: c.name,
                    description: c.description,
                    createdOn: new Date(),
                    updatedOn: new Date()
                });
                if (c.subCategories?.length > 0) {
                    newCategory.subCategories = c.subCategories.map((subCategory) => ({
                        _id: new mongoose.Types.ObjectId(),
                        name: subCategory.name,
                        description: subCategory.description,
                        category_id: newCategoryId,
                        createdOn: new Date(),
                        updatedOn: new Date()
                    }));
                }
                let savedCategory = await newCategory.save();
                // Now update subcategories with category_id
                if (savedCategory?.subCategories?.length > 0) {
                    await Category.findByIdAndUpdate(
                        savedCategory._id,
                        { $set: { subCategories: savedCategory?.subCategories } },
                        { new: true }
                    );
                }
            }
        }
        res.status(200).json({success: true, message: "Categories processed successfully" });
    } catch (error) {
        console.error("Error processing categories:", error);
        res.status(500).json({success: false, error: "Internal server error" });
    }
};

// Function to get all categories
export const getCategories = async (req, res) => {
    try {
        let searchQuery = {}; // Default query
        if (req.query.search) {
            searchQuery = {
                $or: [
                    { name: { $regex: req.query.search, $options: 'i' } },
                    { "subCategories.name": { $regex: req.query.search, $options: 'i' } }
                ]
            };
        }
        // Projection: Exclude `subCategories` when `type` is present
        const projection = req.query.type ? { subCategories: 0 } : {};
        const categories = await Category.find(searchQuery, projection).sort({ name: 1 }).exec();
        res.json({ response: categories, success: true, message: "Categories fetched successfully" });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ response: null, success: false, message: 'Error fetching categories' });
    }
};

export const getCatAndSubCat = async (req, res) => {
    try {
        const categories = await Category.aggregate([
            { $sort: { name: 1 } },
            { $project: {
                _id: 1, name: 1,
                subCategories: {
                    $map: {
                        input: "$subCategories",
                        as: "sub",
                        in: { _id: "$$sub._id", name: "$$sub.name" }
                    }
                }
            }}
        ]);

        res.json({ response: categories, success: true, message: "Categories fetched successfully" });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ response: null, success: false, message: 'Error fetching categories' });
    }
}

// Function to get a category by ID
export const getCategoryById = async (req, res) => {
    const id = req.params.id;
    try {
        const category = await Category.findById(mongoose.Types.ObjectId(id)).exec();
        res.json({response: category, success: true, message: "Category fetched successfully"});
    } catch (error) {
        console.error('Error fetching category by id:', error);
        res.status(404).json({response: null, success: false, message: 'Category not found' });
    }
};

// Function to update a category
export const updateCategory = async (req, res) => {
    let { type } = req.params;
    let data = req.body;
    let id  = data._id;
    try {
        let updatedCategory;
        if (type === "Category") {
            updatedCategory = await Category.findByIdAndUpdate(id, { ...data, updatedOn: new Date() }, { new: true });
        } else if (type === "Sub Category") {
            updatedCategory = await Category.findOneAndUpdate(
                { "subCategories._id": data._id },
                { $set: { "subCategories.$": { ...data, updatedOn: new Date() } } },
                { new: true }
            );
        } else {
            return res.status(400).json({ success: false, message: "Invalid request type" });
        }
        return updatedCategory
            ? res.json({ success: true, message: `${type} updated successfully`, response: updatedCategory })
            : res.status(404).json({ success: false, message: `${type} not found` });
    } catch (error) {
        console.error("Error updating:", error);
        res.status(500).json({ success: false, message: "Update failed" });
    }
};

// Function to delete a category
export const deleteCategory = async (req, res) => {
    let { type } = req.query;
    let { id } = req.params;
    try {
        if (type === "Category") {
            const deleted = await Category.findByIdAndDelete(id);
            return deleted
                ? res.json({ success: true, message: "Category deleted successfully" })
                : res.status(404).json({ success: false, message: "Category not found" });
        }
        if (type === "Sub Category") {
            const updated = await Category.updateOne(
                { "subCategories._id": id },
                { $pull: { subCategories: { _id: id } } }
            );
            return updated
                ? res.json({ success: true, message: "Subcategory deleted successfully" })
                : res.status(404).json({ success: false, message: "Subcategory not found" });
        }
        res.status(400).json({ success: false, message: "Invalid request type" });
    } catch (error) {
        console.error("Error deleting:", error);
        res.status(500).json({ success: false, message: "Error deleting category/subcategory" });
    }
};