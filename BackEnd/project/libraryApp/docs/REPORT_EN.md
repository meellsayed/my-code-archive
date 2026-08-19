# Library Management System — Technical Report

> Latest version: **v0.1.2** — Report date: 19/08/2026

---

## 1) Project Overview

A full-stack library management system built with:

- **Backend**: Node.js + Express + MongoDB (via Mongoose)
- **Frontend**: Single-Page Application (SPA) using vanilla JavaScript + raw CSS (no framework)
- **Database**: MongoDB with a `seed` folder for demo data

```
libraryApp/
├── index.js                 → Server entry point
├── src/
│   ├── app.controller.js    → Express bootstrap, route mounting, error handling
│   ├── DB/
│   │   ├── connection.js    → MongoDB connection
│   │   ├── db.service.js    → Generic Mongoose service layer (create/find/update/...)
│   │   ├── models/          → 8 models (User, Book, Author, Category, ...)
│   │   └── seed/            → Demo data (users, books, authors, ...)
│   ├── middlewares/         → Auth, authorization, input validation
│   ├── modules/             → 8 feature modules (auth, book, cart, order, ...)
│   └── utils/               → Helpers (tokens, hashing, email, responses)
└── frontend/                → User interface (index.html + app.js + style.css)
```

---

## 2) Technology Stack

| Technology | Purpose |
|---|---|
| **Express 5** | Web server framework |
| **Mongoose 9** | MongoDB ODM |
| **MongoDB 7** | Database |
| **JWT (jsonwebtoken)** | Access + refresh token generation/verification |
| **Bcrypt** | Password hashing |
| **Joi 18** | Request payload validation |
| **Nodemailer** | Email sending (account confirmation, password recovery) |
| **Cloudinary + Multer** | Image uploads (book covers) |
| **Socket.io** | Real-time communications (declared in deps, not yet used) |
| **dotenv** | Environment configuration |
| **morgan** | Request logging |

---

## 3) Database (8 Models)

| Model | Description | Key Fields |
|---|---|---|
| **User** | System users (admin/staff/customer) | username, email, phone, password (hashed), role, confirmEmail, otp |
| **Book** | Books | title, cover, description, author, categories, price, costPrice, quantity, minQuantity, availableToBorrow, publisher |
| **Author** | Authors | name, image, bio, birthDate, deathDate |
| **Category** | Book categories | name, description |
| **Customer** | Walk-in/offline customers | username, phone, address, type (online/branch/onlineAndBranch) |
| **Cart** | Shopping cart | user, order[] (book + quantity), isStaff, done |
| **Order** | Orders | customer (User or Customer), seller, cart, total, status, note, address, paymentMethod |
| **Review** | Book reviews | content, rate (1-5), userId, bookId, author |

**Roles**: `admin`, `staff`, `customer` — permissions vary per role.

---

## 4) Order Status Lifecycle

Status flows sequentially: **new → in_processing → ready_to_ship → shipped → delivered → canceled**

- Online customers: orders start at `new`
- Branch sales (staff/admin): orders are saved immediately as `delivered` (instant cash sale)
- The dashboard **Advance** button moves status one step at a time
- An order with status `delivered` or `canceled` cannot be canceled

---

## 5) API Endpoints

### Authentication `/auth`
| Method | Route | Description | Protection |
|---|---|---|---|
| POST | `/auth/signup` | Create new account | Public |
| GET | `/auth/confirm-email/:token` | Confirm email via link | Public |
| POST | `/auth/login` | Login (email or phone) | Public |
| POST | `/auth/refresh-token` | Refresh access token | 🔒 Refresh auth |
| POST | `/auth/forget-password-send` | Send OTP for password recovery | Public |
| GET | `/auth/forget-password/:token` | Change password | Public |

### Books `/book`
| Method | Route | Description | Protection |
|---|---|---|---|
| POST | `/book/add` | Add a book | admin / staff |
| PATCH | `/book/:id` | Update a book | admin / staff |
| DELETE | `/book/:id` | Delete a book (soft delete) | admin only |
| GET | `/book` | All books (search/category/sort/pagination) | Public |
| GET | `/book/:id` | Book details | Public |

### Authors `/author` & Categories `/category`
- Same pattern as books: create/update (admin/staff), delete (admin), list (public)
- Extra: `GET /author/books/:id` and `GET /category/books/:id` to list books of a specific author/category

### Customers `/customer`
| Method | Route | Description | Protection |
|---|---|---|---|
| POST | `/customer/add` | Add a walk-in customer | admin / staff |
| GET | `/customer` | All customers + count | admin / staff |
| GET | `/customer/:id` | One customer | admin / staff |
| DELETE | `/customer/:id` | Delete customer (soft delete) | admin only |

### Cart `/cart`
| Method | Route | Description | Protection |
|---|---|---|---|
| POST | `/cart/add-item/:id` | Add a book to cart | 🔒 Authenticated |
| POST | `/cart/remove-item/:id` | Remove a book from cart | 🔒 Authenticated |
| GET | `/cart/:id` | Get a cart | 🔒 Authenticated |

> **Baked-in rule:** Once a purchase completes (online or branch), the cart is closed (`done: true`) and remove-item becomes **ineffective** because the endpoint can no longer find the active cart.

### Orders `/order`
| Method | Route | Description | Protection |
|---|---|---|---|
| GET | `/order` | All orders | admin / staff |
| GET | `/order/customer/:id` | Orders of a specific customer | admin / staff |
| PATCH | `/order/status/:id` | Advance order status one step | admin / staff |
| GET | `/order/online/:id` | One online order | 🔒 Order owner |
| GET | `/order/online` | User's online orders | 🔒 Order owner |
| POST | `/order/online/buy/:id` | Buy online from cart | 🔒 Cart owner |
| PATCH | `/order/online/cancel/:id` | Cancel order (unless delivered/canceled) | 🔒 Authenticated |
| POST | `/order/branch/buy/:id` | Branch (cash) sale from cart | admin / staff |
| GET | `/order/:id` | One order (all types) | admin / staff |

---

## 6) Security

- **Passwords**: hashed with Bcrypt before saving (user-save hook).
- **Tokens**: JWT with two schemes — `Bearer` for users, `Admin` for admins, with separate signatures per type.
- **Credential change invalidation**: changing credentials/password revokes old tokens via `changeCredentialsTime`.
- **Authorization**: `authentication()` + `authorization([roles])` middlewares on protected routes.
- **Input validation**: Joi schemas on API inputs (currently on auth routes).
- **Data isolation**: a customer cannot access other users' carts/orders (403 otherwise).
- **Soft delete**: logical removal via `isDeleted` flag instead of physical deletion.

---

## 7) Frontend

Built as a 6-view SPA:

1. **Store**: browse books + search + filter by category/publisher + price sort + add to cart + book details
2. **Cart**: review items, change quantity, checkout online
3. **My Orders**: customer's orders and their status (color badge per status) + cancel action
4. **Dashboard** (admin/staff only)
   - **Books**: add/edit/delete + search
   - **Authors**: full CRUD
   - **Categories**: full CRUD
   - **Customers**: search/filter + view each customer's orders
   - **Orders**: all orders + **Advance** button to step status + View for details
   - **New Sale (POS)**: instant cash sale from cart to a walk-in customer (auto-creates the customer if missing)
5. **Auth**: login / signup tabs
6. **Home**: stats cards (book/order/customer counts) on top of the dashboard

**Design**: raw CSS with a dark theme, color-coded status badges, responsive layout.

---

## 8) Seed Data

The `src/DB/seed/` folder ships:
- **4 users**: Admin, Staff, Customer, Sara Ahmed (all password `1234`)
- **5 categories**, **6 authors**, **8 books**, **3 walk-in customers**
- Run with: `npm run seed`

---

## 9) Technical Notes / Future Improvements

- `report.controller.js` exists but is **empty** — ready for sales/statistics reports.
- `user.controller.js` routes are commented out — can be enabled for user management.
- Socket.io is installed but unused — future idea: real-time notifications to staff on new orders.
- Branch sales do not yet use **MongoDB transactions** — operations are sequential; a mid-way failure between stock updates and order creation could cause inconsistency. Consider wrapping multi-sale flows in sessions.
- Validation is currently applied to auth routes only; extending it to all routes is recommended.
