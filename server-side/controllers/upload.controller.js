import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';

// Multer storage configuration
const storage = multer.diskStorage({
    /**
     * Determines the destination folder for uploaded files.
     * If the folder does not exist, it is created.
     */
    destination: async (req, file, cb) => {
        try {
            // Create the destination folder if it doesn't exist
            const dir = path.join(process.cwd(), 'uploads');
            await fs.mkdir(dir, { recursive: true });
            cb(null, dir);
        } catch (error) {
            cb(error, null);
        }
    },

    /**
     * Generates a unique filename for each uploaded file.
     */
    filename: (req, file, cb) => {
        // Generate a unique filename using the field name, current timestamp, a random number and the file extension
        const uniqueName = `${file.fieldname}-${Date.now()}-${Math.floor(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

/**
 * Handles file uploads and moves them into a designated folder.
 */
const uploadFiles = async (req, res) => {
    try {
        // Check if there are any files in the request
        if (!Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded.' });
        }

        // Get the folder name from the request body or default to 'default' if not provided
        const folderName = req.body.folderName?.trim() || 'default';
        // Create the folder path
        const folderPath = path.join(process.cwd(), 'uploads', folderName);
        // Create the folder if it doesn't exist
        await fs.mkdir(folderPath, { recursive: true });

        const imageNames = [];

        // Loop through each file and move it to the designated folder
        await Promise.all(req.files.map(async (file) => {
            const oldPath = file.path;
            const newPath = path.join(folderPath, file.filename);

            try {
                // Move the file asynchronously
                await fs.rename(oldPath, newPath);
                // Add the file name to the image names array
                imageNames.push(file.originalname);
            } catch (err) {
                console.error(`Failed to move file ${file.originalname}:`, err);
            }
        }));

        // Return success response with the image names
        res.json({ success: true, message: 'Files uploaded successfully', imageNames });
    } catch (error) {
        console.error('Error during file upload:', error);
        res.status(500).json({ error: 'An error occurred during file upload.' });
    }
};

export { upload, uploadFiles };