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
        if (!Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded.' });
        }

        const folderName = req.body.folderName?.trim() || 'default';
        const folderPath = path.join(process.cwd(), 'uploads', folderName);
        await fs.mkdir(folderPath, { recursive: true });

        const imageNames = [];

        await Promise.all(req.files.map(async (file) => {
            const oldPath = file.path;
            const newPath = path.join(folderPath, file.filename);

            try {
                await fs.rename(oldPath, newPath); // Move file asynchronously
                imageNames.push(file.originalname);
            } catch (err) {
                console.error(`Failed to move file ${file.originalname}:`, err);
            }
        }));

        res.json({ success: true, message: 'Files uploaded successfully', imageNames });
    } catch (error) {
        console.error('Error during file upload:', error);
        res.status(500).json({ error: 'An error occurred during file upload.' });
    }
};

export { upload, uploadFiles };
