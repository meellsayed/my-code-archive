// ============================================================
// نظام إدارة مكتبة — Library Management System
// تم تصحيح الأخطاء وإضافة تعليقات شاملة
// ============================================================

#include <iostream>
#include <string>
#include <vector>
#include <memory>    // unique_ptr, make_unique
#include <algorithm> // find_if, remove_if
#include <stdexcept> // exception
#include <ctime>     // time_t, localtime
#include <iomanip>   // setw, put_time
#include <sstream>   // stringstream

// ⚠️ تجنّب استخدام "using namespace std" في مشاريع كبيرة لأنه يسبب
// تعارضًا في الأسماء (Name Collision). هنا أبقيناه لأغراض تعليمية.
using namespace std;

// ============================================================
// 1. الواجهات (Interfaces) — Pure Abstract Classes
//    واجهة = عقد يُلزم كل كلاس يرثها بتنفيذ دوالها
// ============================================================

// واجهة الطباعة: أي كلاس يرثها يجب أن يُنفّذ printDetails
class IPrintable
{
public:
    // دالة افتراضية نقية = يجب تنفيذها في الكلاسات الفرعية
    virtual void printDetails(ostream &os) const = 0;

    // destructor افتراضي ضروري لضمان تحرير الذاكرة بشكل صحيح
    virtual ~IPrintable() = default;
};

// واجهة الاستعارة: أي كلاس يرثها يجب أن يُنفّذ borrow/return/isAvailable
class IBorrowable
{
public:
    virtual bool borrow(const string &borrower) = 0; // استعارة عنصر
    virtual bool returnItem() = 0;                   // إرجاع عنصر
    virtual bool isAvailable() const = 0;            // هل العنصر متاح؟
    virtual ~IBorrowable() = default;
};

// ============================================================
// 2. هرم الاستثناءات (Exception Hierarchy)
//    نبني استثناءات مخصصة بدل استخدام رسائل عشوائية
// ============================================================

// الاستثناء الأساسي لجميع أخطاء المكتبة
class LibraryException : public exception
{
protected:
    string message; // نص رسالة الخطأ

public:
    // explicit يمنع التحويل الضمني غير المقصود من string إلى LibraryException
    explicit LibraryException(const string &msg) : message(msg) {}

    // override لـ what() من std::exception — noexcept لأنه لا يرمي استثناءات
    const char *what() const noexcept override { return message.c_str(); }
};

// استثناء خاص: عندما لا يُوجد العنصر في الكتالوج
class ItemNotFoundException : public LibraryException
{
public:
    explicit ItemNotFoundException(const string &id)
        : LibraryException("Item not found: " + id) {}
};

// استثناء خاص: عندما يكون العنصر موجودًا لكنه مُستعار حاليًا
class ItemNotAvailableException : public LibraryException
{
public:
    explicit ItemNotAvailableException(const string &id)
        : LibraryException("Item not available: " + id) {}
};

// ============================================================
// 3. الكلاس الأساسي المجرد (Abstract Base Class)
//    يرث من الواجهتين ويُوفر السلوك المشترك لجميع عناصر المكتبة
// ============================================================
class LibraryItem : public IPrintable, public IBorrowable
{
protected:
    string itemId;          // المعرّف الفريد للعنصر
    string title;           // عنوان العنصر
    string author;          // المؤلف/المخرج
    bool available;         // هل متاح للاستعارة؟
    string currentBorrower; // اسم المستعير الحالي (فارغ إن كان متاحًا)
    time_t borrowDate;      // تاريخ الاستعارة (0 إن لم يُستعر)

    // ── دالة مساعدة: تحويل time_t إلى نص مقروء ──
    // 🐛 BUG FIX: localtime() غير آمن (not thread-safe) لأنه يُرجع
    // مؤشرًا إلى بنية static مشتركة. الحل: استخدام localtime_r (Linux/macOS)
    // أو localtime_s (Windows).
    string formatDate(time_t date) const
    {
        if (date == 0)
            return "N/A"; // لم يُستعر بعد

        // نستدعي localtime ثم ننسخ البنية فورًا قبل أي استدعاء آخر
        // هذا آمن في البرامج ذات الخيط الواحد ويعمل على كل الأنظمة
        tm ltm_buf = *localtime(&date);
        tm *ltm = &ltm_buf;

        stringstream ss;
        ss << put_time(ltm, "%Y-%m-%d %H:%M"); // صيغة: سنة-شهر-يوم ساعة:دقيقة
        return ss.str();
    }

public:
    // Constructor: تهيئة بيانات العنصر الأساسية
    LibraryItem(string id, string t, string a)
        : itemId(id), title(t), author(a), available(true), borrowDate(0) {}

    // Virtual destructor ضروري لأن لدينا وراثة
    virtual ~LibraryItem() = default;

    // ── Getters ──
    string getId() const { return itemId; }
    string getTitle() const { return title; }

    // ── تنفيذ IBorrowable ──

    // هل العنصر متاح للاستعارة؟
    bool isAvailable() const override { return available; }

    // استعارة العنصر: يُسجّل اسم المستعير والتاريخ
    // يُرجع false إن كان العنصر غير متاح
    bool borrow(const string &borrower) override
    {
        if (!available)
            return false; // لا يمكن استعارة ما هو مُستعار

        available = false;
        currentBorrower = borrower;
        borrowDate = time(0); // الوقت الحالي بالثواني منذ 1970
        return true;
    }

    // إرجاع العنصر: يُصفّر بيانات الاستعارة
    // يُرجع false إن كان العنصر متاحًا أصلًا (لا شيء لإرجاعه)
    bool returnItem() override
    {
        if (available)
            return false; // العنصر لم يُستعر أصلًا

        available = true;
        currentBorrower.clear(); // مسح اسم المستعير
        borrowDate = 0;          // إعادة ضبط التاريخ
        return true;
    }

    // دالة افتراضية نقية: كل نوع عنصر له طريقة حساب غرامة تأخير مختلفة
    virtual double calculateLateFee(int daysLate) const = 0;

    // طباعة التفاصيل الأساسية المشتركة (يُستدعى من الكلاسات الفرعية)
    void printDetails(ostream &os) const override
    {
        os << "+-------------------------------------+\n";
        os << "| ID:    " << setw(33) << left << itemId << "|\n";
        os << "| Title: " << setw(33) << title << "|\n";
        os << "| Author: " << setw(32) << author << "|\n";
        os << "| Status: " << setw(32)
           << (available ? "[+] Available" : "[-] Borrowed by " + currentBorrower) << "|\n";

        // طباعة تاريخ الاستعارة فقط إن كان العنصر مُستعارًا
        if (!available)
        {
            os << "| Borrowed: " << setw(30) << formatDate(borrowDate) << "|\n";
        }
    }
};

// ============================================================
// 4. الكلاسات الفرعية الملموسة (Concrete Classes)
//    كل كلاس يُمثل نوعًا مختلفًا من عناصر المكتبة
// ============================================================

// ── كلاس الكتاب ──
class Book : public LibraryItem
{
    int pageCount; // عدد الصفحات
    string genre;  // النوع الأدبي (مثل: Programming, Fiction)
    string isbn;   // رقم ISBN الفريد للكتاب

public:
    Book(string id, string t, string a, int pages, string g, string isbn)
        : LibraryItem(id, t, a), pageCount(pages), genre(g), isbn(isbn) {}

    // غرامة التأخير للكتاب: 2.5 دولار/يوم
    double calculateLateFee(int daysLate) const override
    {
        return daysLate * 2.5;
    }

    // طباعة تفاصيل الكتاب (يستدعي printDetails الأب أولًا)
    void printDetails(ostream &os) const override
    {
        LibraryItem::printDetails(os); // طباعة التفاصيل المشتركة أولًا
        os << "| Type: Book                          |\n";
        os << "| Pages: " << setw(32) << pageCount << "|\n";
        os << "| Genre: " << setw(32) << genre << "|\n";
        os << "| ISBN: " << setw(33) << isbn << "|\n";
        os << "+-------------------------------------+\n";
    }
};

// ── كلاس DVD ──
class DVD : public LibraryItem
{
    int durationMinutes;      // مدة الفيلم بالدقائق
    string rating;            // تصنيف الفيلم (G, PG, PG-13, R...)
    vector<string> subtitles; // قائمة لغات الترجمة المتاحة

public:
    DVD(string id, string t, string a, int duration, string r)
        : LibraryItem(id, t, a), durationMinutes(duration), rating(r) {}

    // إضافة لغة ترجمة للـ DVD
    void addSubtitle(const string &lang)
    {
        subtitles.push_back(lang);
    }

    // غرامة التأخير لـ DVD: 5 دولار/يوم (أغلى من الكتب)
    double calculateLateFee(int daysLate) const override
    {
        return daysLate * 5.0;
    }

    void printDetails(ostream &os) const override
    {
        LibraryItem::printDetails(os);
        os << "| Type: DVD                           |\n";
        os << "| Duration: " << setw(26) << durationMinutes << " min |\n";
        os << "| Rating: " << setw(31) << rating << "|\n";

        // 🐛 BUG FIX: الكود الأصلي كان:
        //   os << setw(26 - subtitles.size() * 3) << ...
        // المشكلة: subtitles.size() يُرجع size_t (unsigned integer)
        // إذا كانت قيمة (subtitles.size() * 3) > 26 يحدث underflow
        // وتصبح القيمة رقمًا ضخمًا جدًا → سلوك غير معرّف (Undefined Behavior)
        // الحل: التحويل إلى int أولًا قبل الطرح، ثم استخدام max(0,...) للأمان

        os << "| Subtitles: ";
        for (const auto &sub : subtitles)
            os << sub << " "; // طباعة كل لغة

        // حساب الـ padding بشكل آمن لضمان محاذاة الإطار
        int usedSpace = static_cast<int>(subtitles.size()) * 3; // تقدير المساحة المستخدمة
        int padding = max(0, 26 - usedSpace);                   // لا نسمح بقيمة سالبة
        os << setw(padding) << " " << "|\n";

        os << "+-------------------------------------+\n";
    }
};

// ── كلاس المجلة ──
class Magazine : public LibraryItem
{
    int issueNumber;  // رقم الإصدار
    string publisher; // اسم دار النشر
    bool isWeekly;    // أسبوعية أم شهرية؟

public:
    Magazine(string id, string t, string a, int issue, string pub, bool weekly)
        : LibraryItem(id, t, a), issueNumber(issue), publisher(pub), isWeekly(weekly) {}

    // غرامة التأخير للمجلة: 1 دولار/يوم (الأرخص)
    double calculateLateFee(int daysLate) const override
    {
        return daysLate * 1.0;
    }

    void printDetails(ostream &os) const override
    {
        LibraryItem::printDetails(os);
        os << "| Type: Magazine                      |\n";
        os << "| Issue: " << setw(32) << issueNumber << "|\n";
        os << "| Publisher: " << setw(28) << publisher << "|\n";
        os << "| Frequency: " << setw(28) << (isWeekly ? "Weekly" : "Monthly") << "|\n";
        os << "+-------------------------------------+\n";
    }
};

// ============================================================
// 5. القالب العام (Template Class) — Repository
//    حاوية عامة تستطيع تخزين أي نوع T يملك دالة getId()
// ============================================================
template <typename T>
class Repository
{
protected:
    // نستخدم unique_ptr لضمان إدارة الذاكرة تلقائيًا (RAII)
    vector<unique_ptr<T>> items;

public:
    // إضافة عنصر جديد — نأخذ الملكية بـ move لأن unique_ptr لا يُنسخ
    void add(unique_ptr<T> item)
    {
        items.push_back(move(item));
    }

    // 🐛 BUG FIX: الكود الأصلي سمّى الدالة "find" وهو نفس اسم std::find
    // بسبب "using namespace std"، هذا يسبب غموضًا (Ambiguity) للمترجم.
    // الحل: تغيير الاسم إلى findById ليكون واضحًا ومختلفًا
    //
    // البحث عن عنصر بالمعرّف — يُرجع مؤشرًا خامًا أو nullptr إن لم يُوجد
    T *findById(const string &id) const
    {
        // find_if: تبحث عن أول عنصر يحقق الشرط المُعطى
        auto it = find_if(items.begin(), items.end(),
                          [&id](const auto &item) // Lambda تقارن المعرّف
                          { return item->getId() == id; });

        // إن وُجد: أرجع مؤشرًا خامًا للعنصر، وإلا أرجع nullptr
        return (it != items.end()) ? it->get() : nullptr;
    }

    // حذف عنصر بالمعرّف باستخدام نمط erase-remove
    void remove(const string &id)
    {
        items.erase(
            // remove_if تُحرّك العناصر المطابقة لنهاية المتجه
            remove_if(items.begin(), items.end(),
                      [&id](const auto &item)
                      { return item->getId() == id; }),
            items.end()); // ثم erase يحذفها فعليًا
    }

    // عرض جميع العناصر — الافتراضي cout لكن يمكن تمرير أي stream
    void displayAll(ostream &os = cout) const
    {
        for (const auto &item : items)
        {
            item->printDetails(os);
            os << "\n";
        }
    }

    // عدد العناصر المخزّنة
    size_t count() const { return items.size(); }

    // دعم range-based for loop (for (auto& x : repo))
    auto begin() { return items.begin(); }
    auto end() { return items.end(); }
    auto begin() const { return items.begin(); }
    auto end() const { return items.end(); }
};

// ============================================================
// 6. نمط Singleton — Library Manager
//    يضمن وجود نسخة واحدة فقط من المكتبة في البرنامج
// ============================================================
class Library
{
private:
    // المؤشر الوحيد للنسخة الفريدة من المكتبة
    static unique_ptr<Library> instance;

    // الكتالوج الذي يحتوي جميع عناصر المكتبة
    Repository<LibraryItem> catalog;

    // Constructor خاص: يمنع إنشاء نسخ من خارج الكلاس
    Library() = default;

public:
    // حذف copy constructor و copy assignment لضمان نمط Singleton
    Library(const Library &) = delete;
    Library &operator=(const Library &) = delete;

    // الطريقة الوحيدة للحصول على النسخة الفريدة
    // Lazy Initialization: تُنشأ فقط عند أول استدعاء
    static Library &getInstance()
    {
        if (!instance) // إنشاء النسخة إن لم تكن موجودة
        {
            instance.reset(new Library());
        }
        return *instance;
    }

    // إضافة عنصر جديد للكتالوج
    void addItem(unique_ptr<LibraryItem> item)
    {
        catalog.add(move(item));
    }

    // عرض جميع العناصر بتنسيق جميل
    void displayCatalog() const
    {
        cout << "\n+=======================================+\n";
        cout << "|        [LIB] LIBRARY CATALOG [LIB]          |\n";
        cout << "+=======================================+\n\n";
        catalog.displayAll();
    }

    // استعارة عنصر: يرمي استثناءات إن لم يُوجد أو غير متاح
    bool borrowItem(const string &itemId, const string &borrower)
    {
        // 🔗 استخدام findById بدل find (تم التصحيح في Repository)
        auto item = catalog.findById(itemId);

        if (!item)
            throw ItemNotFoundException(itemId); // العنصر غير موجود

        if (!item->isAvailable())
            throw ItemNotAvailableException(itemId); // العنصر مُستعار

        return item->borrow(borrower);
    }

    // إرجاع عنصر: يرمي استثناءً إن لم يُوجد
    bool returnItem(const string &itemId)
    {
        auto item = catalog.findById(itemId);

        if (!item)
            throw ItemNotFoundException(itemId);

        return item->returnItem();
    }

    // البحث عن عناصر بجزء من العنوان
    void searchByTitle(const string &searchTerm) const
    {
        cout << "\n[?] Search results for '" << searchTerm << "':\n";
        bool found = false;

        for (const auto &item : catalog)
        {
            // find != npos تعني: الكلمة موجودة في العنوان
            if (item->getTitle().find(searchTerm) != string::npos)
            {
                item->printDetails(cout);
                found = true;
            }
        }

        if (!found)
            cout << "No items found.\n";
    }
};

// تهيئة المتغير الساكن خارج الكلاس (ضروري في C++)
unique_ptr<Library> Library::instance = nullptr;

// ============================================================
// 7. Operator Overloading — تحميل زائد للعملية <<
//    يسمح بطباعة LibraryItem مباشرة: cout << item
// ============================================================
ostream &operator<<(ostream &os, const LibraryItem &item)
{
    item.printDetails(os); // تفويض الطباعة لدالة printDetails
    return os;             // إرجاع الـ stream للسلسلة: cout << a << b
}

// ============================================================
// 8. الدالة الرئيسية — Main Demonstration
// ============================================================
int main()
{
    // نلف كل الكود في try-catch لالتقاط أي استثناء غير متوقع
    try
    {
        // الحصول على النسخة الوحيدة من المكتبة (Singleton)
        Library &lib = Library::getInstance();

        // ── إضافة الكتب ──
        // make_unique: ينشئ unique_ptr بأمان (يتجنب new اليدوي)
        lib.addItem(make_unique<Book>(
            "B001", "Clean Code", "Robert Martin", 464, "Programming", "978-0132350884"));
        lib.addItem(make_unique<Book>(
            "B002", "Design Patterns", "Gang of Four", 395, "Programming", "978-0201633610"));

        // ── إضافة DVD مع ترجمات ──
        auto dvd = make_unique<DVD>("D001", "The Matrix", "Wachowski", 136, "PG-13");
        dvd->addSubtitle("English");
        dvd->addSubtitle("Arabic");
        dvd->addSubtitle("French");
        lib.addItem(move(dvd)); // نقل الملكية لأن unique_ptr لا يُنسخ

        // ── إضافة المجلة ──
        lib.addItem(make_unique<Magazine>(
            "M001", "National Geographic", "Various", 245, "NatGeo", false));

        // عرض الكتالوج الكامل
        lib.displayCatalog();

        // ── عمليات الاستعارة ──
        cout << "\n[OUT] Borrowing B001 for Ahmed...\n";
        lib.borrowItem("B001", "Ahmed");

        cout << "\n[OUT] Borrowing D001 for Sara...\n";
        lib.borrowItem("D001", "Sara");

        // محاولة استعارة عنصر مُستعار — يجب أن يرمي استثناءً
        cout << "\n[OUT] Trying to borrow B001 again...\n";
        try
        {
            lib.borrowItem("B001", "Mohamed");
        }
        catch (const ItemNotAvailableException &e)
        {
            // التقاط استثناء "غير متاح" بشكل منفصل
            cout << "[ERR] Error: " << e.what() << endl;
        }

        // عرض الكتالوج بعد الاستعارة
        lib.displayCatalog();

        // البحث في الكتالوج
        lib.searchByTitle("Code");

        // ── إرجاع عنصر ──
        cout << "\n[IN] Returning B001...\n";
        lib.returnItem("B001");

        // عرض الحالة النهائية
        lib.displayCatalog();
    }
    catch (const exception &e)
    {
        // التقاط أي استثناء غير متوقع وعرض رسالة الخطأ
        cerr << "Fatal error: " << e.what() << endl;
        return 1; // كود خروج غير صفري يدل على وجود خطأ
    }

    return 0; // نجاح البرنامج
}