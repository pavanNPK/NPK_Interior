//locations.model.js
import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
    name: {type: String, required: true},
    country_code: {type: String, required: true},
    country_call_code: {type: String, required: true},
    type: {type: String, required: true},
    nationality: {type: String, required: true},
    countryId: {type: String, required: true}
});

const Location = mongoose.model('Location', locationSchema);
export default Location;