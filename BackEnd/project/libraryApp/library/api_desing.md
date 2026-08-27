
## auth
POST   /api/v1/auth/signup
GET    /api/v1/auth/confirm-email/:token
POST   /api/v1/auth/login
POST   /api/v1/auth/access-token
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/forget-password
GET    /api/v1/auth/forget-password/:token

## Books
GET    /api/v1/books
POST   /api/v1/books
GET    /api/v1/books/:id
PATCH  /api/v1/books/:id
DELETE /api/v1/books/:id
PUT    /api/v1/books/:id/cover
### Authors
GET    /api/v1/authors
POST   /api/v1/authors
GET    /api/v1/authors/:id
PATCH  /api/v1/authors/:id
DELETE /api/v1/authors/:id
GET    /api/v1/authors/:id/books
### categories
GET    /api/v1/categories
POST   /api/v1/categories
GET    /api/v1/categories/:id
PATCH  /api/v1/categories/:id
DELETE /api/v1/categories/:id
GET    /api/v1/categories/:id/books

## orders
GET    /api/v1/orders/online
GET    /api/v1/orders/online/:id
POST   /api/v1/orders/online/cart/:id/buy
PATCH  /api/v1/orders/online/:id/cancel
=========== staff , admin =========== branch orders ========
GET    /api/v1/orders
GET    /api/v1/orders/:id
POST   /api/v1/orders/:id/buy
PATCH  /api/v1/orders/:id/status
GET    /api/v1/orders/customer/:id

### cart
GET    /api/v1/cart/active
GET    /api/v1/cart/:id
GET    /api/v1/cart
POST   /api/v1/cart/items/:bookId
PATCH  /api/v1/cart/items/:bookId/decrement 


## users
GET    /api/v1/users/me
PATCH  /api/v1/users/me
PUT    /api/v1/users/me/avatar


