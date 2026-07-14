#include <iostream>
#include <string>
using namespace std;
class Student
{
    int id, sub, num;
    static int n;

public:
    string name;
    // def cons
    int *grades;
    Student()
    {
        this->num = ++n;
        this->id = 0;
        this->sub = 0;
    }

    // para cons
    Student(string name, int id, int sub)
    {
        this->num = ++n;
        this->name = name;
        this->id = id;
        this->sub = sub;
        this->grades = new int[sub];
    }

    // def Copy cons
    // معملتش حاجه الديفولت كونستراكتور بيشتغل

    // Copy cons
    Student(const Student &s)
    {
        this->num = ++n;
        this->name = s.name;
        this->id = s.id;
        this->sub = s.sub;
        this->grades = new int[sub];
        for (int i = 0; i < sub; i++)
        {
            this->grades[i] = s.grades[i];
        }
    }

    // Methods
    void print()
    {
        cout << "Name   : " << this->name << endl
             << "Id     : " << this->id << endl
             << "Sub    : " << this->sub << endl
             << "Num    : " << this->num << endl;
        for (int i = 0; i < sub; i++)
            cout << grades[i] << " | ";
        cout << "\n==========================\a" << endl;
    }
};

int Student::n = 0;

int main()
{
    Student s1("medo", 15, 3);
    s1.grades[0] = 12;
    s1.grades[1] = 132;
    s1.grades[2] = 2;
    Student s2(s1); //      Copy cons
    // Student s2 (s1);  // Copy cons

    s1.print();
    s2.print();

    //==================================================

    s1.name = "ahmed";
    s1.grades[0] = 2;
    s1.grades[1] = 32;
    s1.grades[2] = 2;

    s1.print();
    s2.print();

    //==================================================
    // Student s3;
    // s3 = s1; //    athmint oprator
    // // s3 (s1); // athmint oprator
    // s3.print();
    //==================================================
}