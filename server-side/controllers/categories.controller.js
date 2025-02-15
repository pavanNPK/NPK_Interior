const Category = require('../models/categories.model');
const mongoose = require('mongoose');

exports.addCategory = async (req, res) => {
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
                    description: c.description
                });
                if (c.subCategories?.length > 0) {
                    newCategory.subCategories = c.subCategories.map((subCategory) => ({
                        _id: new mongoose.Types.ObjectId(),
                        name: subCategory.name,
                        description: subCategory.description,
                        category_id: newCategoryId,
                    }));
                }
                let savedCategory = await newCategory.save();
                // Now update subcategories with category_id
                if (savedCategory.subCategories?.length > 0) {
                    await Category.findByIdAndUpdate(
                        savedCategory._id,
                        { $set: { subCategories: savedCategory.subCategories } },
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


exports.getCategories = async (req, res) => {
    try {
        const query = req.query.type ? {subCategories: 0} : {};
        const categories = await Category.find({},query, {sort: {name: 1}}).exec();
        res.json({response: categories, success: true, message: "Categories fetched successfully"});
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({response: null, success: false, message: 'Error fetching categories' });
    }
}

exports.getCategoryById = async (req, res) => {
    const id = req.params.id;
    try {
        const category = await Category.findById(mongoose.Types.ObjectId(id)).exec();
        res.json({response: category, success: true, message: "Category fetched successfully"});
    } catch (error) {
        console.error('Error fetching category by id:', error);
        res.status(404).json({response: null, success: false, message: 'Category not found' });
    }
}

exports.updateCategory = async (req, res) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id), req.body, { new: true, upsert: true });
        res.json({success: true, message: "Category updated successfully", response: updatedCategory});
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({response: null, success: false, message: 'Error updating category' });
    }
}

exports.deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({response: null, success: true, message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({response: null, success: false, message: 'Error deleting category' });
    }
}