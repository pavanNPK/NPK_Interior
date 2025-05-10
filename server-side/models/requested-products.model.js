import mongoose from "mongoose";

const RequestedProductSchema = new mongoose.Schema({
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }],
    quantity: { type: Number, required: true },
    addedOn: { type: Date, default: new Date() },
    updatedOn: { type: Date, default: new Date() },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

const RequestedProduct = mongoose.model('RequestedProduct', RequestedProductSchema);
export { RequestedProductSchema };
export default RequestedProduct;