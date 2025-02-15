const Category = require('../models/categories.model');
const mongoose = require('mongoose');

exports.addCategory = async (req, res) => {
    console.log(JSON.stringify(req.body, null, 2));
    // const category = new Category({
    //     name: req.body.name
    // });
    // try {
    //     await category.save();
    //     res.json({response: category, success: true, message: "Category added successfully"});
    // } catch (error) {
    //     console.error('Error adding category:', error);
    //     res.status(500).json({response: null, success: false, message: 'Error adding category' });
    // }
}

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