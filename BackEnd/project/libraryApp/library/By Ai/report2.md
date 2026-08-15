# Library App — Code Review Report (2)

**Date:** Aug 07, 2026
**Scope:** Full codebase (`index.js`, `src/`, `library/`)
**Stage:** Early-stage MVP (learning project)
**Note:** No files were modified; this is a read-only review. Reviewed against the current code (note: the older `report.md` is partially stale — several of its findings are already fixed, e.g. `const user = req.user`, commented-out `EmailEvent`, `updatedBy` typo).

---

## Overall Impression

A genuinely promising early-stage MVP. The core structure (layered architecture, generic DB service, event-driven emails, token separation) is well above the average beginner project. However, it currently contains **several real logic bugs** that will bite you in testing — a broken OTP verification, a broken error-status mechanism, an unreachable endpoint, and a wrong soft-delete filter used everywhere. These are the priority. Everything else is cosmetic or future work.

**Stage-appropriate verdict: solid foundation, needs bug-fixing before feature-building.**

---

## Current Strengths

1. **Layered architecture** — controller → service → generic `db.service` → models. Clean separation of responsibilities, very reasonable for a beginner and easy to reason about.
2. **Generic CRUD abstraction** (`src/DB/db.service.js`) — a single place for find/create/update/delete. Good DRY instinct. It's the backbone of the whole app.
3. **JSDoc typing throughout** — services, handlers, and helpers are annotated. Excellent habit for a learning project.
4. **`changeCredentialsTime` token-invalidation pattern** (`token.js:87`) — genuinely good security design that many production apps miss.
5. **Event-emitter email design** (`sendEmail.event.js`) — decouples email sending from the request flow. Smart architecture choice.
6. **JWT refresh/access token separation** — distinct signatures per token type and per role.
7. **Bcrypt password hashing**, **soft-delete flags**, and **`timestamps: true`** on every model.
8. **Joi validation extracted into separate schemas** (`auth.validation.js`) — separated from logic.
9. **Consistent response helpers** (`successResponse`, `asyncHandler`) — a consistent baseline.
10. **`filterObject` utility** for stripping `undefined` before DB writes — a thoughtful touch.

---

## Things Done Well

- Module-per-domain folders (`auth`, `book`, `author`, `invoice`) with controller/service split — the right pattern.
- `book.controller.js` populates `categories` and `author` with `select` to limit field leakage — good API hygiene.
- Login response deliberately picks only `{username, email}` rather than dumping the user doc — good habit (though `forgetPassword` breaks it).
- Signup validation enforces password/confirmation equality via Joi `ref`.
- `filterObject` guards against `undefined` fields reaching the DB.
- `parseInt(expiresIn)` and the `MOOD === "DEV"` gating of real email sending are pragmatic dev/prod switches.

---

## Areas That Could Be Improved

### High Priority (real bugs — fix before adding features)

1. **OTP check is completely bypassed — Critical** (`src/modules/auth/services/registration.service.js:73`)
   `if (!data.otp == user.otp)` — operator precedence makes this `(!data.otp) == user.otp`. And `data.otp` is `undefined` anyway because the token payload key is `confirmEmailOTP` (`sendEmail.event.js:27`). The expression is always `true == "123456"` → **always false** → the error is never thrown → **email confirmation succeeds without any OTP verification**. The check you wrote can never catch a wrong OTP.

2. **Every error is returned as HTTP 400 — High** (`src/utils/response/error.response.js:8`)
   `asyncHandler` unconditionally runs `error.cause = 400`, destroying the `cause: 401/403/404` set in every service. The entire `cause` mechanism is dead — clients can never tell the difference between bad request, unauthorized, forbidden, or not found.

3. **GET `/book/get-all` is unreachable — High** (`src/modules/book/book.controller.js:13-14`)
   `router.get("/:id", getBook)` is registered **before** `router.get("/get-all", ...)`. In Express 5, `/:id` matches a single segment, so `/book/get-all` hits `getBook` with `id="get-all"` → `findById("get-all")` → CastError → 400. `getBooks` never runs. (Stale comment in `author.controller.js:13` shows this was hit before — fixed there by ordering, but not in book.)

4. **`isDeleted: { $exists: true }` is wrong everywhere — High (data correctness)**
   `$exists: true` matches documents that _have the field_ — and every document has it (default `false`). So soft-deleted records are **still returned** by every search: `book.service.js:190, 211, 217, 238, 244` and `author.service.js:25, 93, 105, 127`. Should be `isDeleted: false`. Also blocks re-adding a soft-deleted book title (`book.service.js:54-61`).

5. **`findBooksByAuthor` and `findBooksByCategory` can never match — High** (`book.service.js:207-231`, `234-258`)
   `dbService.find` returns an **array of full documents**, then that array is passed as an equality match / `$in` value against an `ObjectId` ref field. Array-of-documents never matches a scalar `ObjectId` → **these endpoints always return empty**. Need to map to `_id`s and use `$in`.

6. **`isValidObjectId` references an undefined `Types` — High (latent crash)** (`src/middlewares/validation.middleware.js:5`)
   `Types` is never imported (no `import { Types } from "mongoose"`). Any validation using `generalFields._id` throws `ReferenceError`. Dormant today (no schema uses it) but a ticking bomb.

7. **`forgetPassword` returns the full user document to the client — Medium/High (info leak)** (`src/modules/auth/services/login.service.js:108`)
   `data: { user }` sends the entire Mongoose doc, including the **bcrypt password hash**. The login response was sanitized; this one wasn't.

8. **The "remove" endpoint adds to the cart — Medium/High (misleading feature)** (`src/modules/invoice/invoice.controller.js:13-17` + `cart.service.js`)
   Both `/cart/add-item/:id` and `/cart/remove-item/:id` call the same `addItemAndRemove` handler. No removal logic exists. The route contract lies.

### Consider Soon

9. **`.env.dev` with secrets is tracked in git; no `.gitignore`; empty `.env.example` — High (repo hygiene/security)**
   `git ls-files` shows `src/config/.env.dev` committed, no `.gitignore` in the repo. (Couldn't read the file — permission denied — so flagged from git tracking alone.) Git-rm it, add `.gitignore`, put placeholders in `.env.example`. Also remove hardcoded `"./src/config/.env.dev"` path + `PORT = 3000` in `index.js`; use `process.env.PORT`.

10. **Login ignores `confirmEmail`** (`login.service.js:22-57`) — unconfirmed users can fully log in, defeating the email-confirmation flow.

11. **OTP security** — plaintext in DB (`User.model.js:23`), no expiry (`otpExpiresIn` never set), plaintext embedded in the JWT (`sendEmail.event.js:27`), generated with non-crypto `Math.random()` (`otp.js:5`), compared with `!=`. Weakest link in the auth.

12. **Refresh token: 1-year lifetime, no rotation/revocation** (`token.js:33`). Acceptable for MVP; needs a strategy before real users.

13. **New password embedded in the forget-password JWT URL** (`sendEmail.event.js:62-64`) and the flow is a **GET that mutates state** (`login.service.js:81-108`, `auth.controller.js:16`). Password travels in URLs (logs, browser history). Prefer the link to prove identity, then take the new password via POST form.

14. **Email event-name mismatches** (`sendEmail.event.js:84, 92`) — handlers registered under `"loginConfirmationOTP"` / `"enable2faSendOTP"`, but constants are `"Login-Confirmation-OTP"` / `"Enable-2fa-OTP"`. Emitting via constants never triggers them. Dead feature.

15. **`pre("save")` never calls `next`** (`User.model.js:36-42`) — `return next;` / `next;` are bare references. Works only because the hook is `async`. Fragile and pointless (generateHash is sync).

16. **`buyCart` is not atomic** (`invoice.service.js:8-58`) — stock decrements run in an un-awaited `async forEach`, no transaction. Concurrent purchases can oversell; failures leave partial stock. Also: **no ownership check** (anyone can buy any `cartId`), can crash if `order.book` is null, doesn't clear the cart, doesn't record tax/discount.

17. **Error handler leaks internals** (`error.response.js:19-25`) — returns full `error` + `stack` to every client. Must be gated by env in prod.

18. **`generateToken` `options.expiresIn` always overridden** (`token.js:16-19`) — `expiresIn` defaults to `1800` and always wins, so the confirm-email token is 30 min not 5 (`sendEmail.event.js:32`). Only top-level `expiresIn` works.

19. **Check-then-create race** (`book.service.js:54-61`, `author.service.js:22-29`) — duplicate-key `E11000` from the unique index arrives as a raw ugly 400.

20. **Unused/dead imports** — `runAsyncWorkFinishedHook` from `graphql/execution/hooks.js` in `book.controller.js:4` and `invoice.controller.js:5` (exists in installed graphql v17 but internal + unused — fragile); circular-ish `import userRouter from "../user.controller.js"` in `user.service.js:1`.

### Not Important Now

- **Dead dependencies** in `package.json`: `graphql`, `graphql-http`, `graphql-playground-middleware-express`, `socket.io`, `cloudinary`, `multer`, `multer-storage-cloudinary`, `crypto-js`, `mongodb`, `cors` (none referenced in `src/`). `morgan` used but in `devDependencies`.
- **Naming inconsistencies**: `process.env.MOOD` (typo for "MODE") everywhere, `==` vs `===` inconsistency; `/users`, `/auth` plural vs `/book`, `/author` singular; `updateBook` returns `201` for an update.
- **No tests, no lint, no CI, no root README, no npm scripts** for tooling.
- **Email templates** reuse the same branded template (verify ≈ forget), hardcoded `localhost:4200`, leftover "Social Media App"/"YourCompany"/cloudinary imagery.
- **Stub/incomplete modules**: `category` empty and **not mounted** in `app.controller.js`; `user` is a stub; `Review` model has no controller/routes; `invoice.status/discount/tax` unused.
- **Broken references**: `User.activeOrder` refs `"Order"` (model is `Cart`); `User.role` refs `"Role"` (no model); `authorization` compares an ObjectId role against strings — unusable.
- **`connectDB`** (`connection.js:12`): `\/n` is literal, not newline; no `process.exit`/retry on failure; `connectDB()` not awaited.
- **`generateHash` salt param is dead** (`hash.js:7`) — `genSaltSync()` overrides it.
- **`db.service.js`**: `updateOne`/`updateMany`/`deleteOne` accept `select`/`populate` params silently ignored (verified: no throw, just no-op). Misleading API surface.
- **`getBook`/`getAuthor` return `200` with `{book: null}`** instead of `404`.
- **No 404 handler** for unknown routes; no `express.json` size limit; no rate limiting.

---

## Performance Notes

- **No real hot paths yet** — nothing is a problem today. Watch these as data grows:
  - `db.service.find` has a hidden **`limit: 1000`** default — list endpoints will silently cap. Add explicit pagination.
  - Every list endpoint populates 2–3 levels deep — fine now, slow later without `select`/pagination.
  - A new nodemailer **transporter is created per email** (`send.email.js:17`) — hoist to module scope.
  - `buyCart`'s parallel `await order.book.save()` calls (`invoice.service.js:36-40`) — unbounded parallel saves; use a transaction/bulkWrite at scale.
  - `generateOTP` uses `Math.random()` — a _security_ issue, not perf.

---

## Architecture Notes

- Direction is **correct**: controller → service → db.service → model is the classic beginner-friendly layered design, and maps cleanly onto `library/modules.md`.
- The **generic db.service is the right call** but shows the tension of genericity: call sites pass `populate` to functions that ignore it (`create`), or params that don't apply (`updateOne`+`select`). Consider specializing later instead of growing the generic surface.
- **Event-driven email is good architecture** — fix the event-name constants so handlers are reachable, and consider a queue/`setImmediate` so a slow email can't stall a request.
- The **route-ordering collision** is a symptom worth internalizing: static routes must be declared before `/:param` routes.
- **Error-response shape is inconsistent** — `validation()` returns raw `{message, details}` while the global handler returns `{message, error, stack}`. Unify.

---

## Scalability Notes

- **Stateless auth (no refresh rotation, no blacklist)** is the biggest future redesign point.
- The **`$exists: true` filter** and **array-vs-ObjectId query bugs** will silently corrupt data as it grows.
- **No pagination/aggregation** — the reports feature (best sellers, daily/monthly invoice, profit) will need aggregation pipelines.
- **Model references drifting**: `Order` vs `Cart`, missing `Role`, `Publisher` stubbed — do a schema decision pass before building further.
- Folder structure scales fine; module-per-domain layout is future-proof.

---

## Security Notes

(MVP-appropriate — obvious issues only.)

1. **Committed env file with secrets** (tracked in git, no `.gitignore`) — the most urgent item. Rotate anything that was in there.
2. **Bypassed OTP check** (`registration.service.js:73`) — email confirmation verifies nothing.
3. **`Math.random()` OTPs**, plaintext in DB, no expiry, plaintext in JWT — use `crypto.randomInt` and hash+expire.
4. **New password embedded in a JWT inside an emailed URL** — leaks via logs/browser history.
5. **Login has no `confirmEmail` gate**, no rate limiting/lockout on login (brute-force open — defer, but note).
6. **Full error objects + stack traces returned to clients** — hide behind `NODE_ENV` in prod.
7. **`forgetPassword` leaks the password hash** in its response.
8. **`buyCart` doesn't authorize the cart owner.**
9. **Hardcoded JWT fallback signatures** (`token.js:12`, `verifyToken` default `""`) — if env vars are missing, tokens silently use a public default; fail-fast instead.
10. **No helmet / input-size limits / sanitization** — fine for an MVP, add before exposure.
11. `verifyToken` **throws** on invalid/expired tokens inside `decodedToken` (`token.js:72-76`) — propagates to `asyncHandler` and returns `400` instead of `401`.

---

## Future Improvements

Do these later, roughly in order of payoff:

1. **Fix the bug list first** — nothing else matters until behavior is correct.
2. **Add tests** — the service layer is easy to unit-test (`db.service` is mockable). Start with auth (OTP, tokens, forget-password) and book query logic. Biggest ROI for a learning project.
3. **Add eslint + prettier** — catches the `!data.otp == user.otp` class of bug at write-time (`no-constant-binary-expression`, operator-precedence rules).
4. **Unify the error contract** — one shape, one mapper for Mongoose errors (`E11000`, `CastError`, `ValidationError`).
5. **Pagination + filtering** on list endpoints (`page`, `limit`, `sort`).
6. **Inventory feature** (from spec): low-stock alerts, stock movement log, transaction-safe checkout.
7. **Reports** via aggregation pipelines (best sellers, daily/monthly invoice, profit).
8. **Roles/permissions** — implement `Role` model and make `authorization` work.
9. **Categories module** — model exists; wire the controller and mount it.
10. **2FA / Google login** (in `modules.md` TODO) — only after OTP is made secure.
11. **Email**: reuse one transport, retry/backoff, proper template variables.

**Skip for now**: microservices, Redis caching, GraphQL (deps installed but unused), refresh-token rotation store, Docker/K8s, load testing.

---

## Prioritized Recommendations

| Priority          | Item                                                                                                      | Why                                              |
| ----------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **High**          | Fix OTP verification logic (`registration.service.js:73`)                                                 | Currently confirms emails without verification   |
| **High**          | Fix `asyncHandler` overwriting `error.cause`                                                              | All errors are 400; auth is invisible to clients |
| **High**          | Reorder book routes (`/:id` after static routes)                                                          | `/book/get-all` is dead                          |
| **High**          | Replace `isDeleted: {$exists:true}` with `isDeleted:false`                                                | Soft-deleted data is being returned              |
| **High**          | Fix author/category `findBooksBy*` queries (map to `_id`, use `$in`)                                      | Endpoints always return empty                    |
| **High**          | Import `Types` in `validation.middleware.js`                                                              | Latent ReferenceError on first `_id` validation  |
| **High**          | Sanitize `forgetPassword` response + implement real cart removal                                          | Info leak / misleading API                       |
| **Consider Soon** | Git hygiene: untrack `.env.dev`, add `.gitignore`, populate `.env.example`                                | Committed secrets                                |
| **Consider Soon** | Gate `confirmEmail` on login; harden OTP (crypto, hash, expiry); remove password from forget-password JWT | Core auth integrity                              |
| **Consider Soon** | Fix event-name constants; make `buyCart` transactional + owner-checked                                    | Dead features / data races                       |
| **Consider Soon** | Don't leak `error`/`stack` in prod; map Mongoose errors                                                   | Response quality                                 |
| **Not Now**       | Dead deps, template branding, empty modules, naming/typo cleanup, no README/tests/lint                    | Nice-to-have polish                              |

---

## Final Verdict

For an early learning MVP, this is **above average** — the architecture instincts are right, the layering is clean, and a few genuinely good patterns (`changeCredentialsTime`, event-driven email, generic CRUD) are already in place. The score is held back almost entirely by **correctness bugs, not design**: an OTP check that verifies nothing, an error handler that flattens every status to 400, a route collision, a wrong soft-delete filter across both modules, and two query-building mistakes that make search endpoints silently empty.

The good news: all High-Priority issues are small, local, and exactly the kind of thing you'll learn the most from fixing — and all catchable by tests and a linter, both worth adding before your next feature. Get the current behavior correct and verified, and you'll have a genuinely solid foundation to build inventory, reports, and roles on.

**Score (as an early-stage MVP): 6.5/10** — strong architecture, above-average organization, held back by 5–6 real logic bugs and auth-flow security gaps. Not production-ready, but clearly heading the right way.
