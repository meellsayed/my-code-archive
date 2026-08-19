# تقرير العيوب والأخطاء — نظام إدارة المكتبة

> التاريخ: 19/08/2026 | ضد النسخة الحالية v0.1.2

مستويات الخطورة:
- 🔴 حرج (بيسبب أخطاء بيانات/أمان/انهيار)
- 🟠 متوسط (خطأ منطقي أو سلوك غير متوقع)
- 🟡 بسيط (نظافة كود / تحسينات)

---

## 1) أخطاء حرجة 🔴

### 1.1 `global.service.js` — دالة `getOne` بتُرجع كل الطلبات
- **الملف:** `src/modules/order/services/global.service.js:96`
- **الوصف:** الدالة تستقبل `id` من الـ params لكنها **تتجاهله تماماً** وتنفذ `find({ isDeleted: false })` بدون فلاتر → بتُرجع كل الطلبات بدلاً من طلب واحد (لكل route `GET /order/:id`).
- **الخطورة:** إفشاء بيانات + استهلاك موارد.
- **الحل:** استبدالها بـ `findById` مع التحقق أن الطلب موجود ثم إرجاعه.

### 1.2 `online.service.js` — شراء السلة: الكارت بيتقفل **قبل** التحقق من الملكية
- **الملف:** `src/modules/order/services/online.service.js:25`
- **الوصف:** `findOneAndUpdate` بيعمل `done: true` على السلة **قبل** التحقق `cart.user != req.user._id` (سطر 41). المستخدم المخطئ (أو الهاكر) اللي يعرف `cart id` يقدر يقفل سلة شخص تاني وبعدها يرجعله 403 — وفي الحقيقة السلة اتنفّذت في التانية من مالكها الحقيقي.
- **الخطورة:** فقدان بيانات سلة المستخدم صاحبها.
- **الحل:** التحقق من الملكية شرط في الـ filter نفسه **قبل** تنفيذ `done: true`.

### 1.3 `branch.service.js` — بيع الفرع: استخدام `customer.phone` بدون تحقق
- **الملف:** `src/modules/order/services/branch.service.js:28`
- **الوصف:** لو الـ body معبوش `customer` أو `customer.phone` → `TypeError` (انهيار السيرفر 500) بدل رسالة واضحة.
- **الحل:** تحقق مهما قوي من المدخلات في service أو route.

### 1.4 `cart.service.js` — دالة `getOne`: قراءة `cart.user` قبل التحقق من null
- **الملف:** `src/modules/cart/services/cart.service.js:118`
- **الوصف:** لو id السلة خاطئ (`cart = null`) → سطر 122 `req.user._id != cart.user` يرمي TypeError.
- **الحل:** التحقق `if (!cart)` قبل أي استخدام.

### 1.5 قفل السلة قبل نجاح الطلب (نقص transactions)
- **الملف:** `online.service.js:25` و `branch.service.js:39`
- **الوصف:** خصم الكميات من المخزون والكارت يتم بدون `Mongoose session/transaction`. لو فشل إنشاء الطلب (خطأ اتصال أو validation) بعد خصم الكميات → نقص في المخزون من غير طلب مسجّل.
- **الحل:** لفّ عمليات (خصم المخزون + إنشاء الطلب + إغلاق الكارت) في **transaction** واحدة.

### 1.6 `token.js` — `decodedToken` يستقبل `next = {}` افتراضياً
- **الملف:** `src/utils/security/token.js:47`
- **الوصف:** الـ middleware في `auth.middleware.js` بينادي `decodedToken({authorization, tokenType})` **من غير تمرير next**. لما الـ token ناقص أو غلط → `return next(new Error(...))` وبما إن next كائن فارغ → بيحصل تنفيذ كائن بدل دالة → الـ error بيتسقط في global handler → بيرجع **500** بدل 401/400.
- **الخطورة:** رسائل أخطاء خاطئة + كشف تفاصيل سيرفر في الـ response في بعض الحالات.
- **الحل:** تعديل الدالة لترجع `{ error }` أو تمرير `next` صراحة من الـ middleware.

### 1.7 `validation.middleware.js` — `Types` مش مستورد
- **الملف:** `src/middlewares/validation.middleware.js:5`
- **الوصف:** دالة `isValidObjectId` بتستخدم `Types.ObjectId.isValid` لكن `Types` مش مستورد من mongoose → لو اتستخدمت هتنهار. حالياً مش مستخدمة لكنها قنبلة موقوتة.
- **الحل:** `import { Types } from "mongoose"` أو استبدالها بـ `mongoose.isValidObjectId`.

---

## 2) أخطاء منطقية / سلوك غير متوقع 🟠

### 2.1 `global.service.js` — filter الـ `seller` بيستخدم `search` غلطاً
- **الملف:** `src/modules/order/services/global.service.js:62`
- **الوصف:** جوه بلوك الـ `seller`، البحث بيتعمل على `$regex: search` بدل `$regex: seller` → الفلترة بالبائع بتشتغل بالغلط على نفس قيمة البحث.
- **الحل:** استخدام `seller` في الـ regex.

### 2.2 فلتر الحالة `done` لم يعد موجوداً في الـ enum
- **الملف:** `src/modules/order/services/global.service.js:80`
- **الوصف:** `case "done"` موجد في الـ switch لكن قيمة `done` اتشالت من الـ Order enum → الفلترة بتُرجع صفر نتائج دائماً.
- **الحل:** حذف الحالة أو استبدالها بواحدة صالحة (`delivered`).

### 2.3 `branch.service.js` — دالة `getOrders` ناقصة/معطوبة وغير مرتبطة بـ route
- **الملف:** `src/modules/order/services/branch.service.js:112`
- **الوصف:** 
  - بيستخدم `req.params` لقراءة `search/sort/filter` بدل `req.query`.
  - `filter: { customer: id }` بـ `id` غير معرّف إطلاقاً.
  - `dbService.find` في سطر 129 و 139 **من غير await** → بيصير Promise بتتستخدم في `$in`.
  - الكويري اللي اتبنى (`query`) مش مستخدمة أصلاً.
- **الحل:** إما إصلاحها وربطها بـ route أو حذفها.

### 2.4 `cart.service.js` — `isStaff` معكوس
- **الملف:** `src/modules/cart/services/cart.service.js:16`
- **الوصف:** `const isStaff = req.user.role === roleTypes.customer` → الكارت بتاع العميل الحقيقي بيتبعت بـ `isStaff: true` والعكس. الاسم والمنطق معكوسين.
- **الحل:** `req.user.role !== roleTypes.customer` أو تعديل الحقل ليعبر عن المعنى الصحيح.

### 2.5 `cancelOrder` بدون تحقق ملكية أو صلاحية
- **الملف:** `online.service.js:114` + `order.controller.js:36`
- **الوصف:** الـ route `PATCH /order/online/cancel/:id` محمي بـ `authentication()` فقط (بدون authorization) **والدالة نفسها لا تتحقق أن الطلب يخص المستخدم** → أي يوزر مسجّل يقدر يلغي طلب أي حد.
- **الحل:** تحقق `req.user._id == order.customer` + `authorization([customer, admin, staff])`.

### 2.6 `cart.service.js` — دالة `addItem` أي مستخدم بيضيف في سلة الموجود بـ user لأول شخص
- **الملف:** `src/modules/cart/services/cart.service.js:25`
- **الوصف:** لو كان فيه سلة نشطة `done:false` لنفس الـ user، أي شخص آخر بنفس الـ id... (لا، الـ filter بيستخدم `user: userId`، صحيح). **ملاحظة:** المشكلة أنها بتستخدم `findOneAndUpdate` filter بالـ user • لكن `removeItem` بيمسح العنصر تماماً بغض النظر عن الكمية المدخلة.
- **الحل:** جعل `removeItem` يحترم الكمية المدخلة (خصم جزئي).

### 2.7 الـ login لا يتحقق من `confirmEmail`
- **الملف:** `login.service.js:23`
- **الوصف:** لو المستخدم مسجّل بالبريد `confirmEmail: false` يقدر يسجل دخول عادي، مع إن النظام بيبعت تأكيد بريد على التسجيل.
- **الحل:** منع الدخول حتى confirmation ويبان رسالة تأكيد واضحة.

### 2.8 التسجيل لا ينشئ سجل `Customer` (كود معلّق)
- **الملف:** `registration.service.js:60`
- **الوصف:** إنشاء سجلات Customer للسجّل الجديد **معلّق بالكامل** — فمفيش ربط بين الحساب الأونلاين وبيانات الزبائن، وده بدخل تعارض مع فكرة customer types.
- **الحل:** تفعيل إنشاء/ربط Customer بعد التسجيل.

---

## 3) ملاحظات بسيطة 🟡

- **3.1** `hash.js:7` — `generateHash` بيستخدم `bcrypt.genSaltSync()` ويتجاهل الـ `salt` المدخل — ثابت دائماً (16 افتراضي) رغم وجود `SALT` في env.
- **3.2** `report.controller.js` — ملف فارغ (الصفحة جاهزة لتقارير مبيعات لكن غير مطبّقة).
- **3.3** `user.controller.js` — كل الـ routes معلّقة (إدارة المستخدمين غير مفعّلة).
- **3.4** `order.controller.js` ترتيب الـ routes — `GET /order/online/:id` و `GET /order/customer/:id` قبل `GET /order/:id` → ممكن `/:id` يلتقط قيم عامة من غير قصد (حالياً لا تتعارض لكن حساس).
- **3.5** `seed.js` يستخدم `insertMany` — الـ `pre("save")` hook للـ password لا يُنفَّذ مع `insertMany`، الـ hash الموجود في `seed.data.js` ثابت لكل المستخدمين (كلمة سر موحدة 1234) — مقبول للـ dev لكن غير آمن للإنتاج.
- **3.6** `Book.model.js` — الحقل `status` (في `book.service.js` addOne/updateOne) **غير معرّف في السكيما** → أي قيمة status مش بتتحفظ.
- **3.7** `Customer.service.js deleteOne` — لا يتحقق من `customer` null ممكن TypeError.
- **3.8** حقل `updatedBy` في `customer.deleteOne` غير مضبوط رغم أن السكيما تدعمه.
- **3.9** `app.controller.js` — مسار `/user` و `/report` غير مركّبين رغم وجود مراتِبهم.
- **3.10** تعدد صلاحيات — `book.service.js addOne/updateOne` و `category` يأخذوا `status` من الـ body وهذا الحقل غير موجود في السكيما نهائياً.
- **3.11** `sendEmail.event.js` — قوالب OTP لتسجيل دخول (2FA) جاهزة ومكتوبة لكن **غير مستخدمة** في أي sposition — الاكتفاء بالتأكيد ونسيان الـ OTP.
- **3.12** مكتبة `socket.io` و `multer/cloudinary` مثبتة لكن غير مستخدمة — features جاهزة للتفعيل.
- **3.13** لا يوجد **rate limiting** على login/OTP → عرضة للـ brute force.
- **3.14** `otp.js` يستخدم `Math.random()` غير آمن cryptographically — يفضّل `crypto.randomInt`.

---

## 4) أولوية المعالجة المقترحة

1. 🔴 إصلاح `getOne` (1.1) + قفل الكارت قبل الملكية (1.2) + null-check في cart getOne (1.4)
2. 🔴 إضافة برهان الإدخال في branch buy (1.3)
3. 🔴 ربط العمليات بـ transactions (1.5)
4. 🟠 إصلاح تفويض/ملكية cancelOrder (2.5) والتحقق من confirmEmail (2.7)
5. 🟠 تصحيح `seller` filter (2.1) و `isStaff` (2.4)
6. 🟡 تنظيف الكود الميت (report/ user/ branch.getOrders) وتفعيل التحقق الصحيح (1.7)
