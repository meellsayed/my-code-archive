#include "Admin.h"

#include <iostream>
#include <stdexcept>

#include "FilesHelper.h"

Admin::Admin() : Employee() {}

Admin::Admin(int id, const std::string& name, const std::string& password, double salary)
    : Employee(id, name, password, salary) {}

void Admin::addEmployee(Employee& employee) {
    auto& employees = FilesHelper::getEmployees();
    for (const auto& current : employees) {
        if (current.getId() == employee.getId()) {
            throw std::runtime_error("Employee id already exists.");
        }
    }

    employees.push_back(employee);
    FilesHelper::saveAllEmployees(employees);
}

Employee* Admin::searchEmployee(int targetId) {
    auto& employees = FilesHelper::getEmployees();
    for (auto& employee : employees) {
        if (employee.getId() == targetId) {
            return &employee;
        }
    }
    return nullptr;
}

void Admin::editEmployee(int targetId, const std::string& newName, const std::string& newPassword, double newSalary) {
    auto& employees = FilesHelper::getEmployees();
    for (auto& employee : employees) {
        if (employee.getId() == targetId) {
            employee.setName(newName);
            employee.setPassword(newPassword);
            employee.setSalary(newSalary);
            FilesHelper::saveAllEmployees(employees);
            return;
        }
    }

    throw std::runtime_error("Employee not found.");
}

void Admin::listEmployee() const {
    const auto& employees = FilesHelper::getEmployees();
    if (employees.empty()) {
        std::cout << "No employees found.\n";
        return;
    }

    for (const auto& employee : employees) {
        employee.display();
        std::cout << "-------------------------\n";
    }
}

void Admin::display() const {
    std::cout << "Admin Information\n";
    std::cout << "Id     : " << id << '\n';
    std::cout << "Name   : " << name << '\n';
    std::cout << "Salary : " << salary << '\n';
}
