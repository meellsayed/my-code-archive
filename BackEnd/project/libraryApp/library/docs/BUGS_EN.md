# Bugs & Issues Report — Library Management System

> Date: 19/08/2026 | Against current version v0.1.2

Severity levels:
- 🔴 Critical (data loss / security / crash)
- 🟠 Medium (logic flaw / unexpected behavior)
- 🟡 Minor (code hygiene / improvements)

---

## 1) Critical 🔴

### 1.1 `global.service.js` — `getOne` returns ALL orders
- **File:** `src/modules/order/services/global.service.js:96`
- **Description:** Function receives `id` from params but **ignores it entirely** — runs `find({ isDeleted: false })` with no filter, returning every order instead of one (used by `GET /order/:id`).
- **Impact:** Data exposure + resource waste.
- **Fix:** Use `findById`, verify existence, return the single order.

### 1.2 `online.service.js` — Cart locked to `done` BEFORE ownership check
- **File:** `src/modules/order/services/online.service.js:25`
- **Description:** `findOneAndUpdate` sets `done: true` **before** verifying `cart.user != req.user._id` (line 41). A wrong user (or attacker) who knows a cart id can lock another user's cart, then get a 403 — but the real owner's cart is already destroyed.
- **Impact:** Owner loses their active cart data.
- **Fix:** Include ownership in the filter itself, **before** setting `done: true`.

### 1.3 `branch.service.js` — `customer.phone` accessed without validation
- **File:** `src/modules/order/services/branch.service.js:28`
- **Description:** Missing/invalid `customer` or `customer.phone` in the body → `TypeError` (server 500 crash) instead of a clear error.
- **Fix:** Strong input validation in service or route before use.

### 1.4 `cart.service.js` — `getOne` reads `cart.user` before null check
- **File:** `src/modules/cart/services/cart.service.js:118`
- **Description:** With a bad cart id (`cart = null`), line 122 `req.user._id != cart.user` throws TypeError.
- **Fix:** Check `if (!cart)` before any access.

### 1.5 Cart locked before order success (no transactions)
- **File:** `online.service.js:25` and `branch.service.js:39`
- **Description:** Stock decrement + order creation + cart closure are NOT wrapped in a Mongo session/transaction. If order creation fails after stock is decremented (connection error / validation), inventory shrinks with no recorded order.
- **Fix:** Wrap (stock decrement → create order → close cart) in a single **transaction**.

### 1.6 `token.js` — `decodedToken` defaults `next = {}`
- **File:** `src/utils/security/token.js:47`
- **Description:** Middleware in `auth.middleware.js` calls `decodedToken({authorization, tokenType})` **without passing next**. When the token is missing/invalid, `return next(new Error(...))` is invoked on a plain `{}` — the thrown error lands in the global handler → responses become **500** instead of 401/400.
- **Impact:** Wrong error codes + possible server-detail leakage.
- **Fix:** Return `{ error }` or pass `next` explicitly from the middleware.

### 1.7 `validation.middleware.js` — `Types` not imported
- **File:** `src/middlewares/validation.middleware.js:5`
- **Description:** `isValidObjectId` uses `Types.ObjectId.isValid` but `Types` is never imported from mongoose → would crash if used. Currently unused, but a ticking time bomb.
- **Fix:** `import { Types } from "mongoose"` or use `mongoose.isValidObjectId`.

---

## 2) Logical / Unexpected-behavior bugs 🟠

### 2.1 `global.service.js` — `seller` filter uses `search` by mistake
- **File:** `src/modules/order/services/global.service.js:62`
- **Description:** Inside the `seller` block the regex search runs on `$regex: search` instead of `$regex: seller` → seller filtering incorrectly reuses the search value.
- **Fix:** Use `seller` in the regex.

### 2.2 `done` status filter is stale
- **File:** `src/modules/order/services/global.service.js:80`
- **Description:** `case "done"` exists in the switch but `done` was removed from the Order enum → the filter always returns zero results.
- **Fix:** Remove the case or map to a valid status (`delivered`).

### 2.3 `branch.service.js` — `getOrders` broken & never routed
- **File:** `src/modules/order/services/branch.service.js:112`
- **Description:**
  - Reads `search/sort/filter` from `req.params` instead of `req.query`.
  - `filter: { customer: id }` uses `id` which is never defined.
  - `dbService.find` at lines 129 & 139 is called **without await** → Promises land inside `$in`.
  - The built `query` is never actually used.
- **Fix:** Either repair it and wire a route, or delete it.

### 2.4 `cart.service.js` — `isStaff` is inverted
- **File:** `src/modules/cart/services/cart.service.js:16`
- **Description:** `const isStaff = req.user.role === roleTypes.customer` → a real customer's cart is flagged `isStaff: true` and vice-versa. Name and logic are inverted.
- **Fix:** `req.user.role !== roleTypes.customer` or rename the field to reflect intent.

### 2.5 `cancelOrder` without ownership or role check
- **File:** `online.service.js:114` + `order.controller.js:36`
- **Description:** Route `PATCH /order/online/cancel/:id` is protected by `authentication()` only (no authorization), and the service never verifies the order belongs to the caller → any logged-in user can cancel anyone's order.
- **Fix:** Check `req.user._id == order.customer` + `authorization([customer, admin, staff])`.

### 2.6 `cart.service.js` — `removeItem` ignores quantity
- **File:** `src/modules/cart/services/cart.service.js:104`
- **Description:** `$pull` removes the whole book line regardless of the `quantity` in the body — partial removal is impossible.
- **Fix:** Respect the quantity (decrement partial quantities).

### 2.7 Login does not enforce `confirmEmail`
- **File:** `login.service.js:23`
- **Description:** Accounts with `confirmEmail: false` can log in normally even though the system emails a confirmation link on signup.
- **Fix:** Block login until confirmed with a clear message.

### 2.8 Signup does not create a Customer record (code commented out)
- **File:** `registration.service.js:60`
- **Description:** Customer-record creation for new signups is **fully commented out** — online accounts are never linked to customer data, conflicting with the customer-type concept.
- **Fix:** Re-enable/rebuild Customer creation/linking after signup.

---

## 3) Minor notes 🟡

- **3.1** `hash.js:7` — `generateHash` calls `bcrypt.genSaltSync()` and ignores the passed `salt` — always default (16), despite `SALT` in env.
- **3.2** `report.controller.js` — empty file (placeholder for sales reports, not implemented).
- **3.3** `user.controller.js` — all routes commented out (user management disabled).
- **3.4** `order.controller.js` route order — `GET /order/online/:id` and `/order/customer/:id` precede `GET /order/:id`; `/:id` could accidentally catch generic values (not conflicting today, but fragile).
- **3.5** `seed.js` uses `insertMany` — the `pre("save")` password hook is NOT triggered, and `seed.data.js` ships one static hash for all users (password 1234) — fine for dev, unsafe for production.
- **3.6** `Book.model.js` — the `status` field used in `book.service.js` addOne/updateOne is **not defined in the schema** → status is silently dropped.
- **3.7** `Customer.service.js deleteOne` — no null check on `customer` → possible TypeError.
- **3.8** `updatedBy` not set in `customer.deleteOne` though the schema supports it.
- **3.9** `app.controller.js` — `/user` and `/report` routers exist but are never mounted.
- **3.10** `book.service.js`/`category.service.js` accept a `status` field that doesn't exist in either schema.
- **3.11** `sendEmail.event.js` has ready OTP/2FA login templates that are **never used**.
- **3.12** `socket.io` and `multer/cloudinary` installed but unused.
- **3.13** No **rate limiting** on login/OTP endpoints → brute-force susceptible.
- **3.14** `otp.js` uses `Math.random()` — not cryptographically secure; prefer `crypto.randomInt`.

---

## 4) Suggested fix priority

1. 🔴 Fix `getOne` (1.1) + cart lock-before-ownership (1.2) + null-check in cart getOne (1.4)
2. 🔴 Input validation for branch buy (1.3)
3. 🔴 Wrap flows in transactions (1.5)
4. 🟠 Ownership/authorization for cancelOrder (2.5) + enforce confirmEmail (2.7)
5. 🟠 Fix `seller` filter (2.1) and `isStaff` (2.4)
6. 🟡 Clean up dead code (report/ user/ branch.getOrders) and fix validation middleware (1.7)
