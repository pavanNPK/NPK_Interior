# NPK Interior - E-Commerce Platform for Home Decors

## Overview
**`NPK Interior`** is an e-commerce platform designed for Home Interior Decors, offering a seamless online shopping experience. This project is built with a modern tech stack to ensure scalability, security, and smooth performance. Future enhancements will include authentication, micro frontends (MFC), email log tracking, and one-to-one communication.

## Project Structure
### For the `user` what will be provided?

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

| Client    | Server  | Database |
|-----------|---------|----------|
| Angular   | Node.js | MongoDB  |
| SCSS      | Express |          |
| Nebular   |         |          |
| Bootstrap |         |          |
| NGX-Bootstrap |    |          |
| PrimeNG   |         |          |

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
| Autentication     |             |      

## Features (For Admin)
> *He can manage all the operations and features. As well as, `Users` accounts is managed by admin*.
> *Only when`Required`**

| Feature   | Implemented |
|-----------|-------------|
| Category  | CRD         |
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
| Autentication     |             |      

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
