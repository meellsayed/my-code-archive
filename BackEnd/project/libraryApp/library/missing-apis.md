# APIs الناقصة (Missing APIs)

> مقارنة بين `api_desing.md` والـ Backend الفعلي والـ Frontend المتوقع

---

## 1. APIs موجودة في Backend لكن مش موثقة في api_desing.md

### Customer Module
```
GET    /api/v1/customer              → جلب كل العملاء (admin/staff)
GET    /api/v1/customer/:id          → جلب عميل واحد (admin/staff)
POST   /api/v1/customer              → إنشاء عميل (admin/staff)
DELETE /api/v1/customer/:id          → حذف عميل (admin only)
```

### Stock Module
```
GET    /api/v1/stock/books           → جلب كتب المخزون (admin/staff)
GET    /api/v1/stock/books/:id       → جلب حركات مخزون كتاب (admin/staff)
POST   /api/v1/stock/books/:id       → تعديل المخزون (admin/staff)
```

### Report Module
```
GET    /api/v1/report/sales          → تقرير المبيعات (admin only)
GET    /api/v1/report/sales/top      → أعلى المبيعات
```

### Cart Module
```
GET    /api/v1/cart/me               → جلب عربيات المستخدم الحالي
```

---

## 2. APIs Backend موجودة لكن مش مستخدمة في Frontend

### Auth
```
GET    /api/v1/auth/confirm-email/:token   → تأكيد البريد الإلكتروني
POST   /api/v1/auth/reset-password         → إعادة تعيين كلمة المرور
GET    /api/v1/auth/forget-password/:token  → التحقق من رمز كلمة المرور
```

### Cart
```
GET    /api/v1/cart/me                → جلب عربيات المستخدم (موجود في Backend، Frontend مش بيستخدمه)
PATCH  /api/v1/cart/items/:bookId/decrement → نقص كمية (Backend بيستقبله، Frontend بيبعت POST بكمية سالبة بداله)
```

### Authors / Categories
```
GET    /api/v1/authors/:id/books      → جلب كتب مؤلف معين
GET    /api/v1/categories/:id/books   → جلب كتب تصنيف معين
```

### Orders
```
PATCH  /api/v1/orders/pos             → طلب POS (موجود في Backend)
```

---

## 3. APIs Frontend محتاجها但她Backend ناقصة

> APIs الـ Frontend بيستدعيها لكن مش موجودة في Backend أو api_desing.md

### لا يوجد APIs ناقصة
> كل الـ APIs اللي الـ Frontend بيستدعيها موجودة في Backend ✅

---

## 4. APIs Backend ناقصة (محتاجة تنضاف)

### Customer Module
```
PATCH  /api/v1/customer/:id           → تعديل عميل (موجود في الـ Controller لكن commented out)
```

---

## 5. ملخص

| الحالة | العدد |
|--------|-------|
| APIs موجودة في Backend وموجودة في api_desing.md | 38 |
| APIs موجودة في Backend لكن مش موثقة | **11** |
| APIs Backend ناقصة (محتاجة تنضاف) | **1** (PATCH customer) |
| APIs Frontend بيستدعيها但 Backend ناقصة | **0** |
