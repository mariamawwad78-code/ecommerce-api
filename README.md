# E-Commerce REST API

A comprehensive RESTful API for an E-Commerce backend built with Node.js, Express, and Neon PostgreSQL using the MVC architecture.

## Features
- **User Authentication & Authorization:** Secure registration and login using JSON Web Tokens (JWT) with role-based access control.
- **Product Management:** Full CRUD operations (Create, Read, Update, Delete) for products restricted to admin users.
- **Database Integration:** Connected to a serverless PostgreSQL database hosted on Neon.
- **Security & Validation:** Request validation, password hashing, and Bearer Token protection.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** Neon PostgreSQL (Cloud Database)
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs

## Setup & Installation Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <project-folder>
   API Endpoints Summary
1. Users & Authentication
POST /api/users/register - Register a new user.

POST /api/users/login - Login and receive a JWT Bearer token.

2. Products (Requires Admin Bearer Token)
GET /api/products - Retrieve all products.

POST /api/products - Create a new product (Admin only).

PUT /api/products/:id - Update an existing product by ID (Admin only).

DELETE /api/products/:id - Delete a product by ID (Admin only).