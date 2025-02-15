# NPK Interior - E-Commerce Platform for Home Decors

## Overview
**NPK Interior** is an e-commerce platform designed for Home Interior Decors, offering a seamless online shopping experience. This project is built with a modern tech stack to ensure scalability, security, and smooth performance. Future enhancements will include authentication, micro frontends (MFC), email log tracking, and one-to-one communication.

## Tech Stack

| Client    | Server  | Database |
|-----------|---------|----------|
| Angular   | Node.js | MongoDB  |
| SCSS      | Express |          |
| Nebular   |         |          |
| Bootstrap |         |          |
| NGX-Bootstrap |    |          |
| PrimeNG   |         |          |
##### For DB also separate readme file is there inside the repo.
## Features (Planned & Implemented)
### ✅ Implemented
- **Product Listing & Management** – Showcasing various interior decor products.
- **Modern UI/UX** – Built with Angular, SCSS, Nebular, Bootstrap, and PrimeNG.
- **Backend API** – Using Node.js and Express for efficient data handling.
- **MongoDB Integration** – Storing and managing product, user, and order data.

### 🔜 Upcoming Features
- **Authentication System** – Secure login/signup with JWT authentication.
- **Micro Frontends (MFC)** – Modularizing the platform for better scalability.
- **Email Log Tracking** – Monitoring all email communications for orders & inquiries.
- **One-to-One Communication** – Enabling direct interaction between customers and support.
- **Payment Integration** – Enabling direct interaction between customers and support.

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
npm start
```

### Frontend Setup
To set up the frontend, follow these steps:
```sh
cd client-side
npm install
ng s
