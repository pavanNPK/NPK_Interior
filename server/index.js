const path = require('path');
// Load environment variables from .env file
const dotenv = require('dotenv');
// The path parameter is relative to the current working directory of the Node.js process. So, we use the __dirname variable which
// is the directory name of the current module, and then use the path.resolve method to join it with the filename '.env'. This
// ensures that the .env file is loaded from the same directory as the current module.
dotenv.config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const productRoutes = require('./routes/products.route');
const ratingRoutes = require('./routes/ratings.route');
const categoryRoutes = require('./routes/categories.routes');
const { upload, uploadFiles } = require('./controllers/upload.controller');  // Import the controller

const app = express();
const port = 3000;
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/ECW';

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(cors());

// Connect to MongoDB
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => res.send('Hello World!'));
app.use('/products', productRoutes);
app.use('/ratings', ratingRoutes);
app.use('/categories', categoryRoutes);

// Serve static files from the 'public' directory in the project root
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Upload route using the controller
app.post('/uploads', upload.array('files', 12), (req, res, next) => {
    uploadFiles(req, res, next).catch(next);
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}`);
});

