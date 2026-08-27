# Library App — Task List

Generated from `report2.md`. Check off tasks as they are completed.

---

## High Priority (bugs — fix before adding features)

- [ ] **Fix OTP verification logic** — `src/modules/auth/services/registration.service.js:73`
  - `if (!data.otp == user.otp)` is broken by operator precedence and reads the wrong key (`confirmEmailOTP` is the actual payload key). Email confirmation currently succeeds with no OTP verification.
- [ ] **Stop `asyncHandler` overwriting `error.cause`** — `src/utils/response/error.response.js:8`
  - Remove the unconditional `error.cause = 400` so the 401/403/404 set in services are preserved.
- [ ] **Reorder book routes** — `src/modules/book/book.controller.js:13-14`
  - Move `router.get("/get-all", ...)` (and other static routes) before `router.get("/:id", ...)` so `/book/get-all` isn't captured as `:id`.
- [ ] **Replace `isDeleted: { $exists: true }` with `isDeleted: false`** — `book.service.js:190,211,217,238,244` and `author.service.js:25,93,105,127`
  - Soft-deleted records are currently still returned by every search.
- [ ] **Fix `findBooksByAuthor` query** — `src/modules/book/services/book.service.js:207-231`
  - Map the author documents to `_id`s and use `$in` instead of passing an array of full docs as an equality match.
- [ ] **Fix `findBooksByCategory` query** — `src/modules/book/services/book.service.js:234-258`
  - Map category docs to `_id`s and use `$in`.
- [ ] **Import `Types` in validation middleware** — `src/middlewares/validation.middleware.js:5`
  - Add `import { Types } from "mongoose"` (or similar) so `isValidObjectId` doesn't throw `ReferenceError`.
- [ ] **Sanitize `forgetPassword` response** — `src/modules/auth/services/login.service.js:108`
  - Do not return the full user doc (includes bcrypt password hash); pick only safe fields.
- [ ] **Implement real cart removal** — `src/modules/order/order.controller.js:13-17` + `src/modules/order/services/cart.service.js`
  - `/cart/remove-item/:id` currently calls the same `addItemAndRemove` handler. Add actual decrement/removal logic (and route it to a separate handler).

---

## Consider Soon

- [ ] **Git hygiene: untrack `.env.dev` + add `.gitignore`** — repo root
  - Run `git rm --cached src/config/.env.dev`, add a `.gitignore`, and rotate any secrets that were committed. Put placeholder keys in `src/config/.env.example`.
- [ ] **Read port/env from `process.env`** — `index.js:4-6`
  - Remove the hardcoded `"./src/config/.env.dev"` path and `PORT = 3000`; use `process.env.PORT` and a proper env resolution.
- [ ] **Gate login on `confirmEmail`** — `src/modules/auth/services/login.service.js:22-57`
  - Block login (or require confirmation) for unconfirmed users.
- [ ] **Harden OTP handling** — `otp.js`, `User.model.js:23`, `registration.service.js`, `login.service.js:70`, `sendEmail.event.js:27`
  - Generate with `crypto.randomInt`, store hashed, add an expiry, and remove the plaintext OTP from the JWT.
- [ ] **Refresh token policy** — `src/utils/security/token.js:33`
  - Decide rotation/revocation strategy before real users (currently 1 year, no blacklist).
- [ ] **Remove new password from forget-password JWT URL** — `sendEmail.event.js:62-64` + `login.service.js:81-108`
  - Make the link prove identity only; collect the new password via a POST form. Change route to POST/PATCH.
- [ ] **Fix email event-name mismatches** — `src/utils/events/sendEmail.event.js:84,92`
  - Register handlers with `sendEmailEventType.sendLoginConfirmationOTP` / `sendEmailEventType.sendEnable2faOTP` (currently dead).
- [ ] **Fix `pre("save")` hook** — `src/DB/models/User.model.js:36-42`
  - Actually call `next()` (or simplify — the hook is redundant since `generateHash` is sync).
- [ ] **Make `buyCart` atomic + ownership-checked** — `src/modules/order/services/order.service.js:8-58`
  - Use a transaction/session, await stock updates, verify `cart.user === req.user._id`, guard `order.book` null, clear cart after purchase, apply discount/tax.
- [ ] **Gate error details by env** — `src/utils/response/error.response.js:19-25`
  - Return `error`/`stack` only in DEV; hide in production.
- [ ] **Fix `generateToken` `options.expiresIn`** — `src/utils/security/token.js:16-19`
  - Honor `options.expiresIn` (currently always overridden by the default `1800`), so the confirm-email token is 5 min, not 30.
- [ ] **Map Mongoose errors to friendly messages** — `book.service.js:54-61`, `author.service.js:22-29`
  - Catch `E11000` duplicate-key and return a clear 400 instead of the raw error.
- [ ] **Remove unused imports** — `book.controller.js:4`, `order.controller.js:5`, `user.service.js:1`
  - Delete `runAsyncWorkFinishedHook` (graphql internal, unused) and the circular `userRouter` import.

---

## Not Important Now

- [ ] **Remove dead dependencies** — `package.json`
  - `graphql`, `graphql-http`, `graphql-playground-middleware-express`, `socket.io`, `cloudinary`, `multer`, `multer-storage-cloudinary`, `crypto-js`, `mongodb`, `cors`. Move `morgan` to `dependencies`.
- [ ] **Clean up naming inconsistencies**
  - `process.env.MOOD` → `MODE`; unify `==` vs `===`; singular/plural routes (`/book`, `/author` vs `/users`, `/auth`); `updateBook` status `201` → `200`.
- [ ] **Add tooling: eslint + prettier + tests + README**
  - Add scripts to `package.json`; start with auth + book service tests.
- [ ] **Fix email template branding/duplication**
  - `verify.email.template.js` ≈ `sendEmailForgetOtp.template.js`; remove `localhost:4200`, "Social Media App"/"YourCompany", external cloudinary images.
- [ ] **Wire up stub modules**
  - `category` (empty + not mounted in `app.controller.js`), `user` stub, `Review` model (no controller/routes).
- [ ] **Fix broken model references**
  - `User.activeOrder` ref `"Order"` (model is `Cart`); `User.role` ref `"Role"` (no model); make `authorization` middleware work with roles.
- [ ] **Improve `connectDB`** — `src/DB/connection.js:12`
  - Fix `\/n` literal, exit/retry on failure, await in bootstrap.
- [ ] **Fix dead `salt` param** — `src/utils/security/hash.js:7`
  - Respect the passed salt or remove the parameter.
- [ ] **Trim misleading `db.service` params** — `src/DB/db.service.js`
  - `updateOne`/`updateMany`/`deleteOne` accept `select`/`populate` that do nothing.
- [ ] **Return 404 when not found** — `book.service.js` `getBook`, `author.service.js` `getAuthor`
  - Currently return `200` with `{book: null}`.
- [ ] **Add global 404 handler + JSON body size limit + rate limiting**

---

## Future Features (after bugs fixed)

- [ ] **Pagination + filtering** on list endpoints (`page`, `limit`, `sort`)
- [ ] **Inventory feature** — low-stock alerts, stock movement log, transaction-safe checkout
- [ ] **Reports** via aggregation pipelines (best sellers, daily/monthly order, profit)
- [ ] **Roles/permissions** — implement `Role` model; make `authorization` functional
- [ ] **Categories module** — controller (add/update/delete) + mount in `app.controller.js`
- [ ] **2FA / Google login** — after OTP is made secure
- [ ] **Email improvements** — one reusable transport, retry/backoff, proper template variables
