# ✂️ Salon Management REST API

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
Copy `.env.example` to `.env` (or configure your own MongoDB connection string):
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
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/services` | Get all services (filters: `category`, `targetGender`, `isActive`, `minPrice`, `maxPrice`, `search`) |
| `GET` | `/api/services/categories` | Get list of distinct service categories |
| `GET` | `/api/services/:id` | Get single service by ID |
| `POST` | `/api/services` | Add a new salon service |
| `PUT` | `/api/services/:id` | Update service details |
| `PATCH` | `/api/services/:id/toggle-status` | Toggle service active/inactive status |
| `DELETE` | `/api/services/:id` | Delete a service |

### 💈 Stylists / Staff (`/api/stylists`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stylists` | Get all stylists (filters: `isAvailable`, `specialty`, `minRating`, `search`) |
| `GET` | `/api/stylists/:id` | Get stylist profile by ID |
| `GET` | `/api/stylists/:id/appointments` | Get all scheduled appointments for a stylist |
| `POST` | `/api/stylists` | Register a new stylist |
| `PUT` | `/api/stylists/:id` | Update stylist profile |
| `PATCH` | `/api/stylists/:id/availability` | Toggle stylist availability status |
| `DELETE` | `/api/stylists/:id` | Delete stylist record |

### 👤 Customers (`/api/customers`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/customers` | Get all customers (supports search by name, email, phone) |
| `GET` | `/api/customers/:id` | Get single customer by ID |
| `GET` | `/api/customers/:id/appointments` | Get customer appointment history |
| `GET` | `/api/customers/:id/bills` | Get customer billing history |
| `POST` | `/api/customers` | Register a new customer |
| `PUT` | `/api/customers/:id` | Update customer details |
| `PATCH` | `/api/customers/:id/loyalty` | Add/adjust customer loyalty points |
| `DELETE` | `/api/customers/:id` | Delete customer record |

### 📅 Appointments / Bookings (`/api/appointments`)
| Method | Endpoint | Description | Real-Time Event |
|---|---|---|---|
| `GET` | `/api/appointments` | Get all appointments (filters: `status`, `stylist`, `customer`, `date`) | - |
| `GET` | `/api/appointments/:id` | Get appointment details by ID | - |
| `POST` | `/api/appointments` | Book new appointment (auto calculates total) | `newAppointment` |
| `PUT` | `/api/appointments/:id` | Reschedule / update appointment | `appointmentUpdated` |
| `PATCH` | `/api/appointments/:id/status` | Update status (`Pending`, `Confirmed`, `In-Progress`, `Completed`, `Cancelled`) | `appointmentStatusUpdated` |
| `DELETE` | `/api/appointments/:id` | Cancel and delete appointment | `appointmentCancelled` |

### 💳 Billing & Invoices (`/api/bills`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/bills` | Get all bills (filters: `paymentStatus`, `customer`, `paymentMethod`) |
| `GET` | `/api/bills/:id` | Get bill details with populated appointment & customer |
| `POST` | `/api/bills` | Generate a new bill / invoice |
| `PATCH` | `/api/bills/:id/pay` | Record payment (`Cash`, `Card`, `UPI`, `NetBanking`) |
| `DELETE` | `/api/bills/:id` | Delete a bill |

### 📦 Products & Inventory (`/api/products`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | List all salon products (supports `lowStock=true`, `category`, `search`) |
| `GET` | `/api/products/:id` | Get product details by ID |
| `POST` | `/api/products` | Add new product to inventory |
| `PUT` | `/api/products/:id` | Update product details |
| `PATCH` | `/api/products/:id/stock` | Adjust stock quantity (`changeAmount: +5` or `-2`) |
| `DELETE` | `/api/products/:id` | Delete product |

### ⭐ Reviews & Ratings (`/api/reviews`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reviews` | Get all reviews (filter by `stylist` or `service`) |
| `POST` | `/api/reviews` | Submit a review (auto-updates stylist rating) |
| `DELETE` | `/api/reviews/:id` | Delete a review |

### 📊 Analytics & Dashboard (`/api/analytics/dashboard`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/dashboard` | Overall KPI summary (revenue, counts, appointments status, low stock alert, top stylists) |

---

## 🛠️ Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB & Mongoose ODM
- **Real-Time:** Socket.io
- **Utilities:** CORS, dotenv, nodemon
