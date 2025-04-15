// Import mongoose and the Wishlist model with ES module syntax
import mongoose from 'mongoose';
import {wishlistSchema} from '../models/wishlist.model.js';


const dbCache = new Map();

const getDbConnection = async (dbName) => {
    if (dbCache.has(dbName)) {
        return dbCache.get(dbName);
    }
    const DB_URL = process.env.DB_URL.replace('npk_interior', dbName);
    const connection = await mongoose.createConnection(DB_URL).asPromise();
    dbCache.set(dbName, connection);
    return connection;
};

const getModel = (connection, name, schema) => {
    return connection.models[name] || connection.model(name, schema);
};


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