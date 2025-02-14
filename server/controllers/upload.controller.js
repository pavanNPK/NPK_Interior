const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Multer storage configuration
const storage = multer.diskStorage({
    /**
     * This function is called when a new file is uploaded and it needs to be saved.
     * It takes the request, file, and callback as parameters. The callback is called
     * with two parameters: the first is an error object (which will be null unless there
     * is an error), and the second is the path to the folder where the file should be saved.
     * In this case, the folder is the 'uploads' folder in the root of the project.
     * If the folder does not exist, it is created.
     * @param {Object} req - The request object.
     * @param {Object} file - The file being uploaded.
     * @param {Function} cb - The callback to be called when the destination is determined.
     */
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    /**
     * This function is called once the destination has been determined and the file needs
     * to be given a filename. It takes the request, file, and callback as parameters. The
     * callback is called with two parameters: the first is an error object (which will be
     * null unless there is an error), and the second is the filename to use when saving
     * the file.
     * In this case, the filename is a combination of the fieldname (the name of the form
     * field that the file was uploaded in), the current timestamp, a random number, and
     * the extension of the original filename.
     * @param {Object} req - The request object.
     * @param {Object} file - The file being uploaded.
     * @param {Function} cb - The callback to be called when the filename is determined.
     */
    filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`)
});

const upload = multer({ storage });

// File upload controller
/**
 * This controller handles file uploads and organizes them into folders. It takes the request and response
 * objects as parameters. The request object should contain a 'files' property, which is an array of file
 * objects. The file objects should contain 'path' and 'originalname' properties. The 'path' property should
 * be the location of the file on the server's file system, and the 'originalname' property should be the
 * original name of the file when it was uploaded.
 *
 * The controller first checks if any files were uploaded. If not, it returns a 400 error with a message
 * indicating that no files were uploaded.
 *
 * Next, it creates a folder with the name provided in the request body. If the folder name is not
 * provided, it defaults to 'default'. If the folder does not exist, it is created.
 *
 * Then, it loops over the files array and moves each file from its original location to the new folder.
 * It also updates the 'path' property of each file object to the new location.
 *
 * Finally, it sends a response with a success message and the names of the files that were uploaded.
 *
 * If any errors occur during the process, it logs the error to the console and sends a 500 error response
 * with a generic error message.
 */
const uploadFiles = async (req, res) => {
    try {
        if (!req.files?.length) return res.status(400).send({ error: 'No files uploaded.' });
        
        const folderName = req.body.folderName || 'default';
        const folderPath = path.join(__dirname, '..', 'uploads', folderName);
        if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

        const imageNames = req.files.map(file => file.originalname);
        req.files.forEach(file => {
            const oldPath = file.path;
            const newPath = path.join(folderPath, file.filename);
            
            // Move the file to the new directory
            fs.renameSync(oldPath, newPath);
            
            // Update the file path to the new location
            file.path = newPath;
        });
        
        res.send({ success: true, message: 'Files uploaded successfully', imageNames });
    } catch (error) {
        console.error('Error during file upload:', error);
        res.status(500).send({ error: 'An error occurred during file upload.' });
    }
};

// Export the controller and multer upload instance
module.exports = { upload, uploadFiles };
