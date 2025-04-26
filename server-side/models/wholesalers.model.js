import mongoose from "mongoose";

const wholesalerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    alternatePhone: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country_id: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true },
    state_id: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true },
    zipCode: { type: String, required: true },
    gstNumber: { type: String, required: true },
    panNumber: { type: String, required: true },
    shopName: { type: String, required: true },
    website: { type: String, required: true },
    status: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    images: { },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
    createdBy: {  type: mongoose.Schema.Types.ObjectId, ref: "User", required: true  },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Wholesaler = mongoose.model('Wholesaler', wholesalerSchema);
export default Wholesaler;