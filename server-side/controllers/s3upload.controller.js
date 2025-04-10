import multer from 'multer';
import path from 'path';
import {GetObjectCommand, PutObjectCommand, DeleteObjectsCommand, S3Client} from "@aws-sdk/client-s3";
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';
import {fileURLToPath} from 'url';
import {getSignedUrl} from "@aws-sdk/s3-request-presigner"; // To convert file:// URLs to file paths
// (needed for ES modules)

// In ES modules, __dirname is not available, so we need to recreate it
// Get the current file's path from the import.meta.url (ES modules feature)
const __filename = fileURLToPath(import.meta.url);

// Extract the directory path from the file path
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in the project directory
dotenv.config({ path: path.join(__dirname, '../.env') });

// Create S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const uploadS3 = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.AWS_BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const folderName = req.query.folderName || 'npk-interior-default';
            const fileName = `${Date.now()}-${file.originalname.replace(/\s/g, '-')}`;
            const fullPath = `uploads/${folderName}/${fileName}`;
            cb(null, fullPath);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE, // Auto-detect file type
    }),
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB
    }
});

// Controller function to handle uploads
const uploadFilesOnS3 = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }

        const uploadedFiles = req.files.map(file => ({
            // url: file.location, // hiding this because for security reasons. we are not going to show the url
            key: file.key,
            originalName: file.originalname,
            // size: file.size,
            type: file.mimetype
        }));

        res.status(200).json({
            success: true,
            message: 'Files uploaded successfully',
            files: uploadedFiles
        });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading files',
            error: error.message
        });
    }
};

const getSignedUrlForS3 = async ( key) => {
    try {
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
        };
        const command = new GetObjectCommand(params);
        // Link valid for 1 hour
        return await getSignedUrl(s3Client, command, {expiresIn: 3600});
    } catch (error) {
        console.error("Error generating signed URL:", error);
        throw error;
    }
};

const uploadWithPutObject = async (buffer, path, type, folderName, fileName, fullPath) => {
    try {
        const filePath = `uploads/${folderName}/${fileName}`;
        let modifiedBuffer = Buffer.from(buffer.replace(/^data:image\/\w+;base64,/, ""),'base64')
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fullPath,
            Body: modifiedBuffer,
            ContentType: type
        };
        await s3Client.send(new PutObjectCommand(params));

        // Return the file details including name, key, and type
        return { name: fileName, key: filePath, type: type };
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error; // Throw error so the calling function can handle it properly
    }
};

const deleteFileFromS3 = async (keys) => {
    try {
        // Format keys into the required structure for DeleteObjectsCommand
        const objects = keys.map(key => ({ Key: key }));
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Delete: { Objects: objects }
        };
        await s3Client.send(new DeleteObjectsCommand(params));
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error; // Throw error so the calling function can handle it properly
    }
};

// Export the configured multer instance and the upload controller function
export { uploadS3, uploadFilesOnS3, getSignedUrlForS3, uploadWithPutObject, deleteFileFromS3 };