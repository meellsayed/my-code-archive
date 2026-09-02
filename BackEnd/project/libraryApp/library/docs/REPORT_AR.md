# تقرير نظام إدارة المكتبة (Library Management System)

> أحدث نسخة: **v0.1.2** — تاريخ التقرير: 19/08/2026

---

## 1) نظرة عامة على المشروع

نظام متكامل لإدارة مكتبة، مبني بنمط **Full Stack** يتكون من:

- **الواجهة الخلفية (Backend)**: Node.js + Express + MongoDB (Mongoose)
- **الواجهة الأمامية (Frontend)**: صفحة HTML واحدة (SPA) بجافاسكربت خام + CSS (بدون أي Framework)
- **قاعدة البيانات**: MongoDB عبر (Mongoose) مع مجلد `seed` لملء بيانات تجريبية

البنية تتوزع كالتالي:

```
libraryApp/
├── index.js                 → نقطة دخول السيرفر
├── src/
│   ├── app.controller.js    → تهيئة Express والـ routes والأخطاء
│   ├── DB/
│   │   ├── connection.js    → الاتصال بـ MongoDB
│   │   ├── db.service.js    → طبقة عامة للتخاطب مع Mongoose (create/find/update/...)
│   │   ├── models/          → 8 موديلات (User, Book, Author, Category, ...)
│   │   └── seed/            → بيانات تجريبية (مستخدمين، كتب، مؤلفين، ...)
│   ├── middlewares/         → مصادقة + تفويض + تحقق من البيانات
│   ├── modules/             → 8 وحدات وظيفية (auth, book, cart, order, ...)
│   └── utils/               → أدوات مساعدة (tokens, hashing, email, responses)
└── frontend/                → واجهة المستخدم (index.html + app.js + style.css)
```

---

## 2) التقنيات المستخدمة

| التقنية | الغرض |
|---|---|
| **Express 5** | إطار عمل السيرفر |
| **Mongoose 9** | ODM للتعامل مع MongoDB |
| **MongoDB 7** | قاعدة البيانات |
| **JWT (jsonwebtoken)** | إنشاء والتحقق من التوكنات (access + refresh) |
| **Bcrypt** | تشفير كلمات المرور |
| **Joi 18** | تحقق صحة البيانات المدخلة |
| **Nodemailer** | إرسال الإيميلات (تأكيد الحساب، استعادة كلمة المرور) |
| **Cloudinary + Multer** | رفع الصور (أغلفة الكتب) |
| **Socket.io** | اتصالات لحظية (معرّف في الحزم لكن غير مستخدم حالياً) |
| **dotenv** | إدارة المتغيرات البيئية |
| **morgan** | تسجيل الطلبات |

---

## 3) قاعدة البيانات (8 موديلات)

| الموديل | الوصف | أهم الحقول |
|---|---|---|
| **User** | مستخدمي النظام (أدمن/موظف/زبون) | username, email, phone, password (مشفّر), role, confirmEmail, otp |
| **Book** | الكتب | title, cover, description, author, categories, price, costPrice, quantity, minQuantity, availableToBorrow, publisher |
| **Author** | المؤلفون | name, image, bio, birthDate, deathDate |
| **Category** | التصنيفات | name, description |
| **Customer** | زبائن خارجيـون (بيع فرع/ووك-إن) | username, phone, address, type (online/branch/onlineAndBranch) |
| **Cart** | سلة المشتريات | user, order[] (book + quantity), isStaff, done |
| **Order** | الطلبات | customer (User أو Customer), seller, cart, total, status, note, address, paymentMethod |
| **Review** | التقييمات | content, rate (1-5), userId, bookId, author |

**الأدوار (Roles)**: `admin` ، `staff` ، `customer` — الرؤية والصلاحيات تختلف حسب الدور.

---

## 4) حالات الطلب (Order Status)

تدفق الحالة يتبع التسلسل: 
**new** → **in_processing** → **ready_to_ship** → **shipped** → **delivered** → **canceled**

- الزبون الأونلاين: الطلب يبدأ بـ `new`
- بيع الفرع (موظف/أدمن): الطلب يُحفظ فوراً بحالة `delivered` (بيع كاش فوري)
- زر **Advance** في اللوحة يقدّم الحالة خطوة بخطوة تلقائياً
- لا يمكن إلغاء طلب بحالة `delivered` أو `canceled`

---

## 5) واجهة برمجة التطبيقات (API Endpoints)

### المصادقة `/auth`
| الطريقة | المسار | الوصف | الحماية |
|---|---|---|---|
| POST | `/auth/signup` | إنشاء حساب جديد | عام |
| GET | `/auth/confirm-email/:token` | تأكيد البريد بضغط الرابط | عام |
| POST | `/auth/login` | تسجيل الدخول (بريد أو هاتف) | عام |
| POST | `/auth/refresh-token` | تجديد الـ access token | 🔒 مصادقة refresh |
| POST | `/auth/forget-password-send` | إرسال OTP لاستعادة كلمة المرور | عام |
| GET | `/auth/forget-password/:token` | تغيير كلمة المرور | عام |

### الكتب `/book`
| الطريقة | المسار | الوصف | الحماية |
|---|---|---|---|
| POST | `/book/add` | إضافة كتاب | admin / staff |
| PATCH | `/book/:id` | تعديل كتاب | admin / staff |
| DELETE | `/book/:id` | حذف كتاب (soft delete) | admin فقط |
| GET | `/book` | كل الكتب (بحث + تصنيف + ترتيب + صفحات) | عام |
| GET | `/book/:id` | تفاصيل كتاب | عام |

### المؤلفون `/author` والتصنيفات `/category`
- نفس نمط الكتب: إضافة/تعديل (admin/staff)، حذف (admin)، عرض (عام)
- إضافة: `GET /author/books/:id` و `GET /category/books/:id` لعرض كتب كل مؤلف/تصنيف

### الزبائن `/customer`
| الطريقة | المسار | الوصف | الحماية |
|---|---|---|---|
| POST | `/customer/add` | إضافة زبون (ووك-إن) | admin / staff |
| GET | `/customer` | كل الزبائن + عددهم | admin / staff |
| GET | `/customer/:id` | زبون واحد | admin / staff |
| DELETE | `/customer/:id` | حذف زبون (soft delete) | admin فقط |

### السلة `/cart`
| الطريقة | المسار | الوصف | الحماية |
|---|---|---|---|
| POST | `/cart/add-item/:id` | إضافة كتاب للسلة | 🔒 مسجّل دخول |
| POST | `/cart/remove-item/:id` | إزالة كتاب من السلة | 🔒 مسجّل دخول |
| GET | `/cart/:id` | جلب سلة | 🔒 مسجّل دخول |

> **ملاحظة مضمّنة:** بمجرد تنفيذ الشراء (أونلاين أو فرع) تُغلق السلة (`done: true`) ويصبح إزالة العناصر **غير مجدية** لأن الـ endpoint لا يجد السلة النشطة بعد الآن.

### الطلبات `/order`
| الطريقة | المسار | الوصف | الحماية |
|---|---|---|---|
| GET | `/order` | كل الطلبات (بحث بسيط) | admin / staff |
| GET | `/order/customer/:id` | طلبات زبون معيّن | admin / staff |
| PATCH | `/order/status/:id` | تقديم حالة الطلب خطوة | admin / staff |
| GET | `/order/online/:id` | طلب أونلاين واحد | 🔒 مالك الطلب |
| GET | `/order/online` | طلبات المستخدم الأونلاين | 🔒 مالك الطلب |
| POST | `/order/online/buy/:id` | شراء أونلاين من سلة | 🔒 مالك السلة |
| PATCH | `/order/online/cancel/:id` | إلغاء طلب (إن لم يكن delivered/canceled) | 🔒 مسجّل دخول |
| POST | `/order/branch/buy/:id` | بيع فرع (كاش) من سلة | admin / staff |
| GET | `/order/:id` | طلب واحد (كل الأنواع) | admin / staff |

---

## 6) الأمان

- **كلمات المرور**: مشفّرة بـ Bcrypt قبل الحفظ (Hook يسبق حفظ المستخدم).
- **التوكنات**: JWT بطريقتين — `Bearer` للمستخدمين، `Admin` للأدمن، مع توقيع منفصل لكل نوع.
- **الحماية من إعادة الاستخدام**: إذا غيّر المستخدم بياناته/كلمة مروره، تُبطَل التوكنات القديمة (حقل `changeCredentialsTime`).
- **التفويض**: دوال `authentication()` + `authorization([roles])` على كل route واللي يحميها.
- **التحقق من البيانات**: Joi schemas على مدخلات الـ API.
- **عزل البيانات**: الزبون لا يستطيع رؤية سلّته/طلبات غيره (403 إن حاول).
- **Soft Delete**: الحذف منطقي عبر `isDeleted` بدلاً من حذف فعلي.

---

## 7) الواجهة الأمامية (Frontend)

مبنية كنظام SPA من 6 شاشات (صفحة واحدة):

1. **المتجر (Store)**: عرض الكتب + بحث + تصفية حسب التصنيف/الناشر + فرز بالسعر + إضافة للسلة + تفاصيل الكتاب
2. **السلة (Cart)**: مراجعة العناصر، تغيير الكميات، الدفع أونلاين
3. **طلباتي (My Orders)**: طلبات الزبون وحالتها (مع شارة لونية لكل حالة) + إلغاء
4. **لوحة التحكم (Dashboard)**: متاحة للأدمن والموظف فقط
   - **الكتب**: إضافة/تعديل/حذف + بحث
   - **المؤلفون**: إدارة كاملة
   - **التصنيفات**: إدارة كاملة
   - **الزبائن**: بحث/فلترة + عرض طلبات كل زبون
   - **الطلبات**: عرض كل الطلبات + زر **Advance** لتقديم الحالة + زر View للتفاصيل
   - **بيع جديد (POS)**: بيع كاش فوري من السلة لزبون ووك-إن (ينشئ زبوناً تلقائياً لو مش موجود)
5. **تسجيل الدخول/إنشاء حساب (Auth)**: tabs للتنقل بينهم
6. **الرئيسية**: إحصائيات عامة (أعداد الكتب/الطلبات/الزبائن) أعلى اللوحة

**التصميم**: CSS خام بموضوع داكن (Dark) مع شارات ملونة للحالات، تصميم متجاوب (Responsive).

---

## 8) البيانات التجريبية (Seed)

المجلد `src/DB/seed/` يتضمن:
- **4 مستخدمين**: Admin، Staff، Customer، Sara Ahmed (كلهم بباسورد `1234`)
- **5 تصنيفات**، **6 مؤلفين**، **8 كتب**، **3 زبائن ووك-إن**
- التشغيل: `npm run seed`

---

## 9) ملاحظات تقنية / تحسينات مستقبلية

- `report.controller.js` موجود لكنه **فارغ** حالياً — جاهز لتقارير المبيعات/الإحصائيات.
- `user.controller.js` معطّل (routes معلّقة بالتعليق) — يمكن تفعيلها لإدارة المستخدمين.
- مكتبة Socket.io معرّفة في الحزم لكن غير مستخدمة — أفكار مستقبلية: إشعارات فورية للموظفين عند أي طلب جديد.
- بيع الفرع لا يدعم **transactions** بعد (العمليات متسلسلة، ولو انقطع الاتصال بين الحسابات قد يتسبب بنقص بيانات) — يفضّل إضافة `Mongoose sessions` للبيع المتعدد.
- التحقق (validation) مطبّق على الـ auth فقط حالياً، ويمكن تعميمه على بقية الـ routes.
