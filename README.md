# ✂️ Salon Management REST API - Assignment 4

A full-featured, scalable REST API with Real-time WebSocket capabilities built using **Node.js**, **Express.js**, **MongoDB / Mongoose**, and **Socket.io** for complete salon & spa operations management.

---

## 🌐 Live Deployment
- **Live Base URL:** [https://salonmanagementapi.onrender.com](https://salonmanagementapi.onrender.com)
- **Health Check:** [https://salonmanagementapi.onrender.com/health](https://salonmanagementapi.onrender.com/health)

---

## 🚀 Quick Setup & Installation

### 1. Navigate to the project directory
```bash
cd Assignment4/Raj_Rasal_150096725066
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file based on `.env.example`:
```env
PORT=5002
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.dg7czb1.mongodb.net/salonDB?appName=Cluster0
NODE_ENV=development
```

### 4. Seed Database with Sample Salon Data
```bash
npm run seed
```

### 5. Start the Server
```bash
npm start
# or development mode with nodemon:
npm run dev
```
The server will start at `http://localhost:5002`.

---

## 📡 API Endpoints Overview

### 💇 Services (`/api/services`)
- `GET /api/services` - Get all services (filters: `category`, `targetGender`, `isActive`, `minPrice`, `maxPrice`, `search`)
- `GET /api/services/categories` - Get distinct categories
- `GET /api/services/:id` - Get single service by ID
- `POST /api/services` - Create a service
- `PUT /api/services/:id` - Update service details
- `PATCH /api/services/:id/toggle-status` - Toggle service active status
- `DELETE /api/services/:id` - Remove service

### 💈 Stylists (`/api/stylists`)
- `GET /api/stylists` - Get all stylists (filters: `isAvailable`, `specialty`, `minRating`, `search`)
- `GET /api/stylists/:id` - Get stylist by ID
- `GET /api/stylists/:id/appointments` - Get all appointments for a stylist
- `POST /api/stylists` - Register a new stylist
- `PUT /api/stylists/:id` - Update stylist profile
- `PATCH /api/stylists/:id/availability` - Toggle stylist availability
- `DELETE /api/stylists/:id` - Delete stylist record

### 👤 Customers (`/api/customers`)
- `GET /api/customers` - Get all customers (supports search)
- `GET /api/customers/:id` - Get single customer by ID
- `GET /api/customers/:id/appointments` - Get customer booking history
- `GET /api/customers/:id/bills` - Get customer billing history
- `POST /api/customers` - Register a customer
- `PUT /api/customers/:id` - Update customer details
- `PATCH /api/customers/:id/loyalty` - Update customer loyalty points
- `DELETE /api/customers/:id` - Remove customer

### 📅 Appointments (`/api/appointments`)
- `GET /api/appointments` - Get all appointments (filters: `status`, `stylist`, `customer`, `date`)
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Book a new appointment (Real-time Socket event: `newAppointment`)
- `PUT /api/appointments/:id` - Reschedule / update appointment (`appointmentUpdated`)
- `PATCH /api/appointments/:id/status` - Update status (`appointmentStatusUpdated`)
- `DELETE /api/appointments/:id` - Cancel & delete appointment (`appointmentCancelled`)

### 💳 Billing & Invoices (`/api/bills`)
- `GET /api/bills` - Get all bills (filters: `paymentStatus`, `customer`, `paymentMethod`)
- `GET /api/bills/:id` - Get bill details
- `POST /api/bills` - Generate a new bill / invoice
- `PATCH /api/bills/:id/pay` - Record payment
- `DELETE /api/bills/:id` - Delete bill record

### 📦 Products & Inventory (`/api/products`)
- `GET /api/products` - List salon inventory (supports `lowStock=true`, `category`, `search`)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Add product to inventory
- `PUT /api/products/:id` - Update product
- `PATCH /api/products/:id/stock` - Adjust stock quantity
- `DELETE /api/products/:id` - Delete product

### ⭐ Reviews & Ratings (`/api/reviews`)
- `GET /api/reviews` - Get all reviews (filter by `stylist` or `service`)
- `POST /api/reviews` - Submit review (updates stylist rating)
- `DELETE /api/reviews/:id` - Delete review

### 📊 Dashboard & Analytics (`/api/analytics/dashboard`)
- `GET /api/analytics/dashboard` - Overall KPI metrics (revenue, customer counts, appointments, low stock items)
