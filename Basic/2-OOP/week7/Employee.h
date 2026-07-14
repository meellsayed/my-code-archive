#pragma once
#include <iostream>
#include <string>
using namespace std;

class Employee
{
private:
    int id, salary;
    string fristName, lastName;

public:
    Employee(int id, string fristName, string lastName, int salary)
    {
        this->id = id;
        this->fristName = fristName;
        this->lastName = lastName;
        this->salary = salary;
    }

    int get_ID()
    {
        return this->id;
    }
    string get_fristName()
    {
        return this->fristName;
    }
    string get_lastName()
    {
        return this->lastName;
    }
    string get_name()
    {
        return this->fristName + ' ' + this->lastName;
    }
    int get_salary()
    {
        return this->salary;
    }
    void set_salary(int salary)
    {
        this->salary = salary;
    }
    int get_annual_salary()
    {
        this->salary *= 12;
    }
    int raise_salary(int percent)
    {
        this->salary *= (1 + percent / 100);
        return this->salary;
    }
};