#pragma once
#include <vector>
#include <iostream>
#include <string>
#include <cstdlib>
#include <string>
#include <vector>
#include "Validation.h"
#include "Person.h"
using namespace std;

class Client;

class Employee : public Person
{
protected:
    double salary;

public:
    Employee(const int &id, const string &password, const string &name, const double &salary) : Person(id, password, name) { setSalary(salary); }

    void setSalary(const double &salary)
    {
        if (!Validation::is_valid_salary(salary))
            throw invalid_argument("Min Salary 5000");
        this->salary = salary;
    } 
    double getSalary() const { return salary; }

    void addClient(Client &client);

    Client *searchClient(int id);

    void listClient();

    void editClient(int id, string name, string password, double balance);

    void display() const override
    {
        cout << "Employee -> Id: " << id << ", Name: " << name
             << ", Salary: " << salary << "\n";
    }
};
