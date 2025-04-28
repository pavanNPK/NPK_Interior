# NPK Interior - E-Commerce Platform for Home Decors

## Overview
**`NPK Interior`** is an e-commerce platform designed for Home Interior Decors, offering a seamless online shopping experience. This project is built with a modern tech stack to ensure scalability, security, and smooth performance. Future enhancements will include authentication, micro frontends (MFC), email log tracking, and one-to-one communication.

## Project Structure
### For the `user - shopper` what will be provided?

[//]: # (    ├── Categories              # Added the categories & sub categories.)

    
    ├── Prodcuts                # Each category has its own sub category with its own products.
    ├── Deals                   # What's on sale and special offers.
    ├── Upcomings               # Upcoming products.
    ├── Orders                  # Track your orders and manage your order history.
    ├── Wishlisht & Cart        # Favorite products in wishlist and cart.
    ├── Re-Order                # You can re-order the products.
    ├── Pay & Rewards           # A loyalty program for customers, You will get the coins for every purchase. For every 100 coins you will get a reward.
    ├── Settings                # You can manage your orders, wishlist and cart products by yourself. You can export your data to excel file with date range.
    ├── Notifications           # You can receive notifications in App & Email.
    ├── Manage Account          # You can manage your account by yourself. And, provided MFA (Multi-Factor Authentication).
    └── Autentication           # Provided authentication system.

> In the future, it might be added more features or modified.


## Tech Stack

| Client    | Server        | Database |
|-----------|---------------|----------|
| Angular   | Node.js       | MongoDB  |
| SCSS      | Express       |          |
| Nebular   | Redis         |          |
| Bootstrap | Node Mailer   |          |
| NGX-Bootstrap | JWT & bcrypt |          |
| PrimeNG   |               |          |

## Features (Planned)
- **Product Listing & Management** – Showcasing various interior decor products.
- **Modern UI/UX** – Built with Angular, SCSS, Nebular, Bootstrap, and PrimeNG.
- **Backend API** – Using Node.js and Express for efficient data handling.
- **MongoDB Integration** – Storing and managing product, user, and order data.

- **Authentication System** – Secure login/signup with JWT authentication.
- **Micro Frontends (MFC)** – Modularizing the platform for better scalability.
- **Email Log Tracking** – Monitoring all email communications for orders & inquiries.
- **One-to-One Communication** – Enabling direct interaction between customers and support.
- **Payment Integration** – Enabling direct interaction between customers and support.


## Features (For Users)
> **Only `Read` operation is allowed**

| Feature   | Implemented |
|-----------|-------------|
| Prodcuts  |             |     
| Deals   |             |
| Upcomings |             |      
| Orders |             |      
| Wishlisht |             |      
| Cart |             |      
| Re-Order |             |      
| Pay & Rewards |             |      
| Settings   |             |      
| Notifications   |             |      
| Manage Account     |             |      
| Autentication     | R           |      

## Features (For Admin - Supervise)
> *He can manage all the operations and features. As well as, `Users` accounts is managed by admin*.
> *Only when`Required`**

| Feature   | Implemented |
|-----------|-------------|
| Category  | CRUD        |
| Prodcuts  |             |     
| Deals   |             |
| Upcomings |             |      
| Orders |             |      
| Wishlisht |             |      
| Cart |             |      
| Re-Order |             |      
| Pay & Rewards |             |      
| Settings   |             |      
| Notifications   |             |      
| Manage Account     |             |      
| Autentication     | CRUD        |      

## Project Structure

### Client-Side (`client/`)
The frontend is developed with **Angular 17**, incorporating:
- **Nebular & Bootstrap** for UI styling.
- **PrimeNG** for interactive UI components.
- **Angular Router** for smooth navigation.
- **Server-Side Rendering (SSR)** for better SEO and performance.

### Server-Side (`server-side/`)
The backend is developed using:
- **Node.js & Express** – Fast and scalable backend.
- **MongoDB & Mongoose** – NoSQL database to handle product, order, and user data.
- **Multer** – Handling file uploads (e.g., product images).
- **Cors & Dotenv** – Managing environment variables and cross-origin requests.

## Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB
- Angular CLI (v17+ recommended)

### Backend Setup
To set up the backend, follow these steps:
```sh
npm install
cd server-side
npm start
```

### Frontend Setup
To set up the frontend, follow these steps:
```sh
cd client-side
npm install
ng s
```

-----------------------------------------------------------------------------------------------------------

### Using 3rd-party services

> This code sets up a complete Express.js server with MongoDB integration, security features, and API routes. The server follows modern JavaScript practices using ES modules.

| Dependency                                                                     | Description |
|--------------------------------------------------------------------------------|-------------|
| [bcrypt](https://www.npmjs.com/package/bcrypt)                                 | Password hashing |
| [compression](https://www.npmjs.com/package/compression)                       | Gzip compression |
| [Cors](https://github.com/expressjs/cors)                                      | Cross-origin resource sharing |
| [Dotenv](https://www.npmjs.com/package/dotenv)                                 | Environment variables |
| [express](https://expressjs.com/)                                                                      | Express.js framework |
| [express-mongo-sanitize](https://www.npmjs.com/package/express-mongo-sanitize) | Preventing MongoDB injection |
| [express-rate-limit](https://www.npmjs.com/package/express-rate-limit)         | Rate limiting |
| [Helmet](https://helmetjs.github.io/)                                          | Security headers |
| [ioredis](https://www.npmjs.com/package/ioredis)                               | Redis integration |
| [JWT](https://jwt.io/)                                                         | Authentication |
| [Mongoose](https://mongoosejs.com/)                                            | MongoDB integration |
| [Multer](https://www.npmjs.com/package/multer)                                 | Handling file uploads |
| [Nodemailer](https://nodemailer.com/)                                          | Sending emails |
| [xss-clean](https://www.npmjs.com/package/xss-clean)                           | Preventing cross-site scripting (XSS) attacks |

### Dependencies Breakdown

#### Core Node.js Modules

1. `path`: Handles file paths consistently across operating systems.
2. `fileURLToPath`: Converts file:// URLs to file paths (needed for ES modules).
3. `dotenv`: Loads environment variables from .env files.

#### Main Framework

1. `express`: Express.js framework for building web applications.

#### Database

1. `mongoose`: MongoDB object modeling tool designed to work in an asynchronous environment.
2. `ioredis`: Library for Redis integration.

#### Security Middleware

1. `helmet`: Middleware for adding security headers to HTTP responses.
2. `xss-clean`: Middleware for preventing cross-site scripting (XSS) attacks.
3. `express-rate-limit`: Middleware for rate limiting requests.
4. `express-mongo-sanitize`: Prevents NoSQL injection attacks by sanitizing user inputs.
5. `cors`: Enables Cross-Origin Resource Sharing for API access from different domains.

#### Performance Middleware

1. `compression`: Compresses HTTP responses to improve application performance.

-------------------------------------------------------------------------------------------

### Key Sections Explained

#### 1. ES Module Setup

```aiignore
// ES modules require special handling for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```
This recreates the __dirname variable that's available in CommonJS but not in ES modules.

#### 2. Server Configuration

```aiignore
const app = express();
const port = 3000;
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/ECW';
```
Initializes the Express application, sets the port number, and defines the MongoDB connection string.

#### 3. Middleware Setup

```aiignore
app.use(express.json());                  // Parse JSON request bodies
app.use(express.static('public'));        // Serve static files
app.use(cors());                          // Enable CORS
app.use(helmet());                        // Secure HTTP headers
app.use(mongoSanitize());                 // Prevent NoSQL injection
app.use(xss());                           // Prevent XSS attacks
app.use(compression());                   // Compress responses
```
Configures middleware in a specific order to handle requests properly.

#### 4. Rate Limiting

```aiignore
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                 // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  })
);
```
API rate limiting is set to 100 requests per IP address every 15 minutes.
Prevents abuse by limiting the number of requests a single IP can make.

#### 5. Database Connection

```aiignore
mongoose.connect(dbUrl)
    .then(() => console.log('Successfully Connected to MongoDB.....'))
    .catch(err => console.error('MongoDB connection error:', err));
```
Establishes connection to MongoDB using the connection string from environment variables.

#### 6. API Routes

```aiignore
app.use('/products', productRoutes);
app.use('/ratings', ratingRoutes);
app.use('/categories', categoryRoutes);
app.use('/users', userRoutes);
app.use('/orders', orderRoutes);
```
Sets up routes for different API endpoints.

#### 7. File Uploading

```aiignore
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/uploads', upload.array('files', 12), (req, res, next) => {
    uploadFiles(req, res, next).catch(next);
});
```
File uploads are stored in the 'uploads' directory and accessible via `/uploads` URL path.
Sets up static file serving for uploaded files and creates an endpoint for file uploads.

#### 8. Error Handling

```aiignore
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});
```
Handles errors that occur during request processing.

-------------------------------------------------------------------------------------------

### Additional Information

| Area | Suggestion | Benefit |
|------|------------|---------|
Code Reuse | Extract reusable helpers | Cleaner code
Performance | Use async/parallel file uploads | Faster processing
Error Handling | Centralized error manager | Easier maintenance
Validation | Use schema validators | More reliable input
File Management | Async file delete | Non-blocking server
Security | Sanitize inputs and validate uploads | Safer APIs


### Summary

This setup provides a solid foundation for building secure, performant APIs. The documentation links in the markdown document will help you quickly access information about each package when needed.
