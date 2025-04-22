// Import mongoose and the Wishlist model with ES module syntax
import mongoose from 'mongoose';
import {wishlistSchema} from '../models/wishlist.model.js';
import {getDbConnection, getModel} from "./dbSwitch.controller.js";


export const getWishlistCount = async (req, res) => {
    let dbName = req.user.code;
    try {
        const connection = await getDbConnection(dbName);
        const WishlistModel = getModel(connection, 'Wishlist', wishlistSchema); // Create model dynamically
        const count = await WishlistModel.countDocuments({});          // Wishlist documents
        res.json({response: count, success: true, message: 'Wishlist count fetched successfully' });
    } catch (error){
        console.error('Error count for cart:', error);
        res.status(500).json({response: null, success: false, message: 'Error fetching count for cart' });
    }
}