// Import core Node.js modules
import path from 'path';                  // For handling file paths
import { fileURLToPath } from 'url';      // To convert file:// URLs to file paths (needed for ES modules)
import dotenv from 'dotenv';              // To load environment variables from .env file
import bodyParser from 'body-parser';    // For parsing request bodies

// Import third-party packages
import express from 'express';            // Web framework
import mongoose from 'mongoose';          // MongoDB ODM library
import cors from 'cors';                  // Cross-Origin Resource Sharing middleware
import helmet from 'helmet';              // Security middleware
import rateLimit from 'express-rate-limit'; // Rate limiting
import mongoSanitize from 'express-mongo-sanitize'; // Prevent NoSQL injection
import xss from 'xss-clean';              // Prevent XSS attacks
import compression from 'compression';    // Compress responses


// Import custom route modules - note the .js extension required in ES modules
import productRoutes from './routes/products.route.js';      // Product API routes
import ratingRoutes from './routes/ratings.route.js';        // Rating API routes
import categoryRoutes from './routes/categories.routes.js';  // Category API routes
import cartRoutes from './routes/cart.routes.js';  // Cart API routes
import wishlistRoutes from './routes/wishlist.routes.js';  // wishlist API routes
import userRoutes from "./routes/user.routes.js";  // User API routes
import locationRoutes from "./routes/locations.routes.js";  // Locations API routes
import { upload, uploadFiles } from './controllers/upload.controller.js'; // File upload controller functions
import { uploadS3, uploadFilesOnS3 } from './controllers/s3upload.controller.js'; // File upload controller functions

// In ES modules, __dirname is not available, so we need to recreate it
// Get the current file's path from the import.meta.url (ES modules feature)
const __filename = fileURLToPath(import.meta.url);
// Extract the directory path from the file path
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in the project directory
dotenv.config({ path: path.join(__dirname, '.env') });

// Initialize Express application
const app = express();
// Set the server port, use environment variable or default to 3000
const port = 3000;
// Get MongoDB connection string from environment variables or use a default
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/ECW';

// Set up Express middleware
app.use(express.json());                  // Parse JSON request bodies
app.use(express.static('public'));        // Serve static files from 'public' directory
app.use(cors());                         // Enable CORS for all routes
app.use(helmet());                           // Secure HTTP headers
app.use(mongoSanitize());                    // Prevent NoSQL injection
app.use(xss());                              // Prevent XSS attacks
app.use(compression());                      // Compress responses
// ✅ Use bodyParser for parsing JSON requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting (Prevent brute-force attacks)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per `window`
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);


// Connect to MongoDB database
// mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
// we are removing the useNewUrlParser and useUnifiedTopology options to avoid deprecation warnings.
// we are update form 5 to 8
mongoose.connect(dbUrl)
    .then(() => console.log('✅ Successfully Connected to MongoDB.....'))                // Log success message
    .catch(err => console.error('❌ MongoDB connection error:', err)); // Log any connection errors

// Define routes
app.get('/', (req, res) => res.send('Hello World!')); // Simple root route
app.use('/products', productRoutes);      // Mount product routes under /products
app.use('/ratings', ratingRoutes);        // Mount rating routes under /ratings
app.use('/categories', categoryRoutes);   // Mount category routes under /categories
app.use('/carts', cartRoutes);   // Mount cart routes under /carts
app.use('/wishlists', wishlistRoutes);   // Mount wishlist routes under /wishlists
app.use('/users', userRoutes);
app.use('/locations', locationRoutes);


// Set up file upload for a local
// Set up static file serving for uploads directory
// This makes files in the uploads folder accessible via /uploads URL path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up file upload endpoint
// upload.array('files', 12) is middleware that handles multipart form data with max 12 files
app.post('/uploads', upload.array('files', 12), (req, res, next) => {
    // Call the uploadFiles controller function and catch any async errors
    uploadFiles(req, res, next).catch(next);
});

// Set up file upload endpoint for S3
// upload.array('files', 12) is middleware that handles multipart form data with max 12 files
app.post('/s3-uploads', uploadS3.array('files', 12), (req, res, next) => {
    // Call the uploadFilesOnS3 controller function and catch any async errors
    uploadFilesOnS3(req, res, next).catch(next);
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}`); // Log server start message
});