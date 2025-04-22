// Import mongoose and the Cart model with ES module syntax
import mongoose from 'mongoose';
import {cartSchema} from '../models/cart.model.js';
import {getDbConnection, getModel} from "./dbSwitch.controller.js";

export const getCartCount = async (req, res) => {
    let dbName = req.user.code;
    try {
        const connection = await getDbConnection(dbName);
        const CartModel = getModel(connection, 'Cart', cartSchema); // Create model dynamically
        const count = await CartModel.countDocuments({});          // Count documents
        res.json({response: count, success: true, message: 'Cart count fetched successfully' });
    } catch (error){
        console.error('Error count for cart:', error);
        res.status(500).json({response: null, success: false, message: 'Error fetching count for cart' });
    }
}