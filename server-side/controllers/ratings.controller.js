import mongoose from 'mongoose';
import Rating from '../models/rating.model.js';

// Add a new rating
export const addRating = async (req, res) => {
    try {
        // The 'req.body' property contains the body of the request, which
        // is the data that was sent in the request. The 'Array.isArray'
        // method is used to check if the body is an array. If it is, we
        // can use the 'insertMany' method to save all of the ratings in
        // one call. If it is not an array, we wrap it in an array so that
        // we can use the 'insertMany' method.
        const ratings = Array.isArray(req.body) ? req.body : [req.body];
        // The 'insertMany' method is used to save multiple documents to the
        // database. The method returns a promise that resolves to an array
        // of documents that were saved. The 'json' method is used to send
        // the response as JSON.
        const savedRatings = await Rating.insertMany(ratings);
        res.status(201).json({ response: savedRatings, success: true, message: "Ratings added successfully" });
    } catch (error) {
        console.error('Error adding ratings:', error);
        res.status(500).json({ response: null, success: false, message: 'Error adding ratings' });
    }
};

// Get all ratings
export const getRatings = async (req, res) => {
    try {
        // The 'find' method returns a promise that resolves to a list of documents
        // that match the query. The 'populate' method is used to populate the 'productId'
        // field with the name of the product. This is done by using the 'ref' property
        // in the schema definition to specify the model that this ObjectId refers to.
        // In this case, the model is 'Product', and the field that we want to populate
        // is 'name'.
        // const ratings = await Rating.find().populate('productId', 'name');
        const ratings = await Rating.find().exec();
        // The 'json' method is used to send the response as JSON.
        // The 'res' object is the response object that is passed to the route handler.
        res.json({ response: ratings, success: true, message: "Ratings fetched successfully" });
    } catch (error) {
        console.error('Error fetching ratings:', error);
        res.status(500).json({ response: null, success: false, message: 'Error fetching ratings' });
    }
};

// Get ratings by product ID
export const getRatingsByProduct = async (req, res) => {
    try {
        // The 'find' method is used to retrieve all ratings that match a specific product ID.
        // The 'req.params.id' is passed as a parameter in the request URL, which is then
        // converted to a MongoDB ObjectId using 'mongoose.Types.ObjectId()' before querying the database.
        const ratings = await Rating.find({ productId: mongoose.Types.ObjectId(req.params.id) }).exec();
        res.json({ response: ratings, success: true, message: "Ratings fetched successfully" });
    } catch (error) {
        console.error('Error fetching ratings:', error);
        res.status(500).json({ response: null, success: false, message: 'Error fetching ratings' });
    }
};

// Update a rating
export const updateRating = async (req, res) => {
    try {
        // The 'findByIdAndUpdate' method is used to update an existing rating by its ID.
        // The 'req.params.id' is converted to a MongoDB ObjectId before updating the document.
        // The 'new: true' option ensures that the updated document is returned in the response.
        // The 'upsert: true' option ensures that if the document does not exist, a new one is created.
        const updatedRating = await Rating.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id), req.body, { new: true, upsert: true });
        res.json({ success: true, message: "Rating updated successfully", response: updatedRating });
    } catch (error) {
        console.error('Error updating rating:', error);
        res.status(500).json({ response: null, success: false, message: 'Error updating rating' });
    }
};

// Delete a rating
export const deleteRating = async (req, res) => {
    try {
        // The 'findByIdAndDelete' method is used to delete a rating by its ID.
        // The 'req.params.id' is passed as a parameter in the request URL to identify the document.
        await Rating.findByIdAndDelete(req.params.id);
        res.json({ response: null, success: true, message: 'Rating deleted successfully' });
    } catch (error) {
        console.error('Error deleting rating:', error);
        res.status(500).json({ response: null, success: false, message: 'Error deleting rating' });
    }
};
