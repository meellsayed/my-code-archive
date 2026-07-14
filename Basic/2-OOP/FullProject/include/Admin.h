#pragma once

#include "Employee.h"

class Admin : public Employee {
public:
    Admin();
    Admin(int id, const std::string& name, const std::string& password, double salary);

    void addEmployee(Employee& employee);
    Employee* searchEmployee(int id);
    void editEmployee(int id, const std::string& name, const std::string& password, double salary);
    void listEmployee() const;

    void display() const override;
};
