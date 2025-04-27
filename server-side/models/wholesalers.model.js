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
    bankAccountNumber: { type: String, required: false },
    IFSCCode: { type: String, required: false },
    bankName: { type: String, required: false },
    gstNumber: { type: String },
    panNumber: { type: String },
    shopName: { type: String, required: true },
    website: { type: String, required: false },
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