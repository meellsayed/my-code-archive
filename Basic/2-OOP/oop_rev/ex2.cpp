#include <iostream>
using namespace std;

class Person
{
public:
    // جرب تشيل virtual من هنا وشوف الفرق!
    virtual void whoAmI() { cout << "Person" << endl; }
};

class Student : public Person
{
public:
    void whoAmI() override
    {
        cout << "Student" << endl;
    }
};

class Man : public Person
{
public:
    void whoAmI() override
    {
        cout << "M a n" << endl;
    }
};

int main()
{
    Person *p = new Student(); // Pointer من نوع Person
    Person *u = new Man();     // Pointer من نوع Man

    p->whoAmI(); // مع virtual: Student | بدون: Person
    u->whoAmI();
    delete p;
    delete u;

    return 0;
}