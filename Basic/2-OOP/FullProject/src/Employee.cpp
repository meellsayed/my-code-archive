#include "Employee.h"

#include <iomanip>
#include <iostream>
#include <stdexcept>

#include "FilesHelper.h"
#include "Validation.h"

Employee::Employee() : Person(), salary(5000.0) {}

Employee::Employee(int id, const std::string& name, const std::string& password, double salary)
    : Person(id, name, password), salary(5000.0) {
    setSalary(salary);
}

void Employee::setSalary(double newSalary) {
    if (!Validation::isValidSalary(newSalary)) {
        throw std::invalid_argument("Salary must be at least 5000.");
    }
    salary = newSalary;
}

double Employee::getSalary() const {
    return salary;
}

  {
    auto& clients = FilesHelper::getClients();
    for (const auto& current : clients) {
        if (current.getId() == client.getId()) {
            throw std::runtime_error("Client id already exists.");
        }
    }

    clients.push_back(client);
    FilesHelper::saveAllClients(clients);
}

Client* Employee::searchClient(int targetId) {
    auto& clients = FilesHelper::getClients();
    for (auto& client : clients) {
        if (client.getId() == targetId) {
            return &client;
        }
    }
    return nullptr;
}

void Employee::listClient() const {
    const auto& clients = FilesHelper::getClients();
    if (clients.empty()) {
        std::cout << "No clients found.\n";
        return;
    }

    for (const auto& client : clients) {
        client.display();
        std::cout << "-------------------------\n";
    }
}

void Employee::editClient(int targetId, const std::string& newName, const std::string& newPassword, double newBalance) {
    auto& clients = FilesHelper::getClients();
    for (auto& client : clients) {
        if (client.getId() == targetId) {
            client.setName(newName);
            client.setPassword(newPassword);
            client.setBalance(newBalance);
            FilesHelper::saveAllClients(clients);
            return;
        }
    }

    throw std::runtime_error("Client not found.");
}

void Employee::display() const {
    std::cout << "Employee Information\n";
    std::cout << "Id     : " << id << '\n';
    std::cout << "Name   : " << name << '\n';
    std::cout << "Salary : " << std::fixed << std::setprecision(2) << salary << '\n';
}
