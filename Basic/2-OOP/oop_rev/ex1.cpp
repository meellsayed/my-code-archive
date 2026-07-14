// University Management System (Inheritance + Polymorphism)
#include <iostream>
using namespace std;

class Person
{
    string name;
    int age;

public:
    Person(string name, int age)
    {
        this->name = name;
        this->age = age;
    }
    virtual void display()
    {
        cout << "Name   : " << name << endl
             << "Age    : " << age << endl;
    }
    virtual double calculateSalary() const = 0;
    virtual ~Person() {};
};

class Student : public Person
{
    double gpa;
    string major;

public:
    Student(string name, int age, double gpa, string major)
        : Person(name, age)
    {
        this->gpa = gpa;
        this->major = major;
    }

    void display() override
    {
        Person::display();

        cout << "Gpa    : " << gpa << endl
             << "Major  : " << major << endl
             << "isHonorStudent : " << (isHonorStudent() ? "Yes" : "No") << endl;
    }

    double calculateSalary() const override { return 0; }

    bool isHonorStudent() const { return gpa >= 3.5; }
};

class Professor : public Person
{
    string department;
    int yearsOfService;
    double baseSalary;

public:
    Professor(string name, int age, string dept, int years, double base) : Person(name, age)
    {
        department = dept;
        yearsOfService = years;
        baseSalary = base;
    }
    void display() override
    {
        Person::display();

        cout << "department     : " << department << endl
             << "yearsOfService : " << yearsOfService << endl
             << "baseSalary     : " << baseSalary << endl
             << "calculateSalary: " << calculateSalary() << endl;
    }

    double calculateSalary() const override { return baseSalary + (yearsOfService * 1000); }

    int getYearsOfService() const { return yearsOfService; }
};

int main()
{

    const int SIZE = 5;
    Person *persons[SIZE];

    persons[0] = new Student("Ahmed Ali", 20, 3.8, "Computer Science");
    persons[1] = new Professor("Dr. Sarah Hassan", 45, "Mathematics", 15, 8000);
    persons[2] = new Student("Mona Youssef", 22, 3.2, "Physics");
    persons[3] = new Professor("Dr. Khaled Omar", 50, "Physics", 20, 9000);
    persons[4] = new Student("Mohamed Elsayed", 18, 5, "C++ Programar");

    cout << "========================================\n\a\n";

    for (int i = 0; i < SIZE; i++)
    {
        cout << "----------------------------------------" << endl;
        cout << "Person #" << (i + 1) << ":" << endl;
        cout << "----------------------------------------" << endl;

        // Polymorphism ==============================================================================<<<<>>>>
        persons[i]->display();

        cout << endl;
    }

    for (int i = 0; i < SIZE; i++)
    {
        delete persons[i];
        persons[i] = nullptr; // Good practice
    }

    return 0;
}