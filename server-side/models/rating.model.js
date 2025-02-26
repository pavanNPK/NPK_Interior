// Import mongoose using ES module syntax
import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    // The product that the user is rating
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // ref is the name of the model that this ObjectId refers to
        required: true
    },

    // The user that is leaving the rating
    userId: {
        type: String,
        required: false
    },

    // The actual rating
    rating: {
        type: Number,
        required: true,
        // The rating is between 1 and 5
        min: 1,
        max: 5
    },

    // A comment left by the user
    comment: {
        type: String
    },

    // The date the rating was left
    createdAt: {
        type: Date,
        // The default is the current date
        default: Date.now
    }
});

// Create and export the Product model using ES module syntax
const Rating = mongoose.model('Rating', ratingSchema);
export default Rating;