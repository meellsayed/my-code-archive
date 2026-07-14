#pragma once
#include <vector>
#include <iostream>
#include <string>
#include <cstdlib>
#include <string>
#include <vector>

#include "Employee.h"

using namespace std;

class Admin : public Employee
{

public:
    Admin(int id, const string &password, const string &name, double salary)
        : Employee(id, password, name, salary) {}

    void addClient(Client &client);
    Client *searchClient(int id);
    void listClient();
    void editClient(int id, string name, string password, double balance);

    void addEmployee(Employee &employee);
    Employee *searchEmployee(int id);
    void editEmployee(int id, string name, string password, double salary);
    void listEmployee();

    void display() const override
    {
        // فقط غيّرنا طريقة العرض لتظهر كلمة Admin بدل Employee.
        cout << "Admin -> Id: " << id << ", Name: " << name
             << ", Salary: " << salary << "\n";
    }

    
};
