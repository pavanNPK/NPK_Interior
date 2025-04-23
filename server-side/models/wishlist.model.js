// Wishlist.js
import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    addedOn: { type: Date, default: new Date() },
});
// Compound index for wishlist: userId and productId
wishlistSchema.index({ userId: 1, productId: 1 });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export { wishlistSchema };
export default Wishlist;
