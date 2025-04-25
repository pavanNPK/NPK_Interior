import Location from "../models/locations.model.js";

export const getLocations = async (req, res) => {
    try {
        const locations = await Location.find();
        res.json({response: locations, success: true, message: "Locations fetched successfully"});
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({response: null, success: false, message: 'Error fetching locations' });
    }

}
