# 📊 تاسكات الباك إند: دعم الداشبورد الاحترافية

> الفرونت إند دلوقتي فيه Widgets احترافية في لوحة الإدارة (رسوم بيانية، تنبيهات، نشاط، أداء)
> شغالة على بيانات وهمية (`js/data.js`). الملف ده فيه بالظبط الـ Endpoints اللي لازم تعملها
> في الباك إند عشان توصل البيانات دي حقيقية.

---

## 📈 Phase 17: تقارير الداشبورد (Dashboard Reports)

### Task 17.1: KPIs مع فلتر المدة الزمنية
- [ ] Endpoint: `GET /reports/stats?range=today|week|month`
- [ ] يرجع: `totalSales, totalOrders, totalCustomers, stockValue, pendingOrders, avgOrderValue`
> 💡 تلميح: استخدم `$match` في الـ Aggregation على حقل `createdAt` بناءً على الـ range، واحسب `avgOrderValue = totalSales / totalOrders`. لو `totalOrders = 0` رجّع صفر بدل ما تعمل قسمة على صفر.

### Task 17.2: منحنى الإيرادات
- [ ] Endpoint: `GET /reports/sales-trend?days=14`
- [ ] يرجع Array: `[{ date: "2026-08-20", amount: 90 }, ...]`
> 💡 تلميح: استخدم Aggregation بـ `$group` على `$dateToString` لتجميع المبيعات يوم بيوم، ولو مفيش مبيعات في يوم معين رجّع `amount: 0` مش تسيبه فاضي، عشان الرسم البياني ميتقطعش.

### Task 17.3: توزيع حالات الطلبات
- [ ] Endpoint: `GET /reports/orders-by-status`
- [ ] يرجع Object: `{ "جديد": 3, "قيد التجهيز": 2, ... }`
> 💡 تلميح: `$group` على حقل `status` مع `$count`، وارجع كل الحالات حتى لو عددها صفر (عشان شكل الرسم الدائري يفضل ثابت).

### Task 17.4: أعلى العملاء إنفاقًا
- [ ] Endpoint: `GET /reports/top-customers?limit=5`
- [ ] يرجع: `[{ name, total, orders }]` مرتبة تنازليًا
> 💡 تلميح: `$group` على `customer` مع `$sum` للمبلغ و`$count` لعدد الطلبات، وبعدين `$lookup` مع Users عشان تجيب الاسم.

### Task 17.5: أداء الموظفين
- [ ] Endpoint: `GET /reports/employee-performance`
- [ ] يرجع: `[{ name, total, orders }]` — بس للفواتير اللي ليها موظف مرتبط بيها (بيع فرع)
> 💡 تلميح: لازم أول حاجة تضيف حقل `employee` (ref لموديل User) في Invoice Model من الـ Phase 3 لو لسه مش موجود، وتسجله وقت إنشاء الفاتورة.

---

## 🔔 Phase 18: التنبيهات والنشاط (Alerts & Activity)

### Task 18.1: تنبيهات المخزون المنخفض
- [ ] Endpoint: `GET /inventory/low-stock`
- [ ] يرجع كل الكتب اللي `availableCopies <= lowStockThreshold` (من إعدادات المكتبة)، مرتبة الأخطر (الأقل كمية) أولًا
> 💡 تلميح: اقرأ الـ threshold من Library Settings Model (Task 9.1) بدل ما تكتبه رقم ثابت في الكود.

### Task 18.2: خط النشاط الأخير (Activity Feed)
- [ ] Endpoint: `GET /activity/recent?limit=10`
- [ ] يرجع خليط من آخر الأحداث: طلبات جديدة، تنبيهات نفاد مخزون، عملاء جدد — مرتبة بالأحدث أولًا
> 💡 تلميح: أسهل طريقة إنك تعمل Model منفصل اسمه `ActivityLog` (type, text, createdAt) وتسجل فيه event يدوي في كل مكان مهم (بعد إنشاء طلب، بعد تسجيل عميل، لما كتاب ينفد)، بدل ما تحاول تجمع من كذا Collection وقت الطلب نفسه.

### Task 18.3: عداد الإشعارات (اختياري لكن مفيد)
- [ ] Endpoint: `GET /notifications/unread-count`
- [ ] يرجع عدد التنبيهات اللي لسه محتاجة مراجعة (كتب نفدت + طلبات جديدة لسه في حالة "جديد")
> 💡 تلميح: ده أبسط تاسك في الملف، وممكن تستخدمه تحط badge على أيقونة جرس في الشريط العلوي لاحقًا.

---

## 🗂 ملخص الـ Endpoints الجديدة

| Method | Endpoint                        | الاستخدام                |
| ------ | ------------------------------- | ------------------------ |
| GET    | `/reports/stats?range=`         | كروت الإحصائيات الأساسية |
| GET    | `/reports/sales-trend?days=`    | رسم منحنى الإيرادات      |
| GET    | `/reports/orders-by-status`     | رسم دائري لحالات الطلبات |
| GET    | `/reports/top-customers?limit=` | جدول أعلى العملاء        |
| GET    | `/reports/employee-performance` | جدول أداء الموظفين       |
| GET    | `/inventory/low-stock`          | تنبيهات المخزون          |
| GET    | `/activity/recent?limit=`       | خط النشاط الأخير         |
| GET    | `/notifications/unread-count`   | عداد الإشعارات (اختياري) |
|        |                                 |                          |

---

## ✅ إزاي تربط النتيجة بالفرونت إند

كل الدوال دي متجهزة بالفعل في `js/api.js` وبتشتغل على بيانات وهمية دلوقتي.
لما تخلّص أي Endpoint من اللي فوق:
1. افتح `js/api.js`
2. دوّر على الدالة المطابقة (زي `ReportsAPI.salesTrend`)
3. تأكد إن `USE_MOCK = false` وإن شكل الـ response بتاعك مطابق للي موضح في التاسك
4. الداشبورد هتتحدث تلقائيًا من غير أي تعديل في `admin.js`

ابدأ بـ Task 17.1 و 17.2 (الأهم بصريًا)، وسيب الإشعارات (18.3) لآخر حاجة لو الوقت ضاق.
