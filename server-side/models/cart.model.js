// cart.js
import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    addedOn: { type: Date, default: new Date() },
    itemCount: {type: Number, default: 0}
});
// Compound index for cart: userId and productId
cartSchema.index({ userId: 1, productId: 1 });

const Cart = mongoose.model('Cart', cartSchema);
export { cartSchema };
export default Cart;
