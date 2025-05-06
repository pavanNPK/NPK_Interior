import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    addedOn: { type: Date, default: new Date() },
    updatedOn: { type: Date, default: new Date() },
    wholesalers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Wholesaler", required: true }]
});

const Stock = mongoose.model('Stock', stockSchema);
export default Stock;