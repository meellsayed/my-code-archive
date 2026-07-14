#include "EmployeeManager.h"

#include <iostream>
#include <limits>

#include "ClientManager.h"
#include "FilesHelper.h"

namespace {
int readInt(const std::string& message) {
    int value;
    while (true) {
        std::cout << message;
        if (std::cin >> value) {
            return value;
        }

        std::cout << "Please enter a valid number.\n";
        std::cin.clear();
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
    }
}

double readDouble(const std::string& message) {
    double value;
    while (true) {
        std::cout << message;
        if (std::cin >> value) {
            return value;
        }

        std::cout << "Please enter a valid amount.\n";
        std::cin.clear();
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
    }
}

std::string readLine(const std::string& message) {
    std::string value;
    std::cout << message;
    std::getline(std::cin >> std::ws, value);
    return value;
}
} // namespace

void EmployeeManager::printEmployeeMenu() {
    std::cout << "\nEmployee Menu\n";
    std::cout << "1. Display my info\n";
    std::cout << "2. Add new client\n";
    std::cout << "3. List all clients\n";
    std::cout << "4. Search for client\n";
    std::cout << "5. Edit client info\n";
    std::cout << "6. Change password\n";
    std::cout << "7. Logout\n";
}

void EmployeeManager::newClient(Employee* employee) {
    const int id = FilesHelper::getLast(FilesHelper::lastClientIdFile()) + 1;
    const std::string name = readLine("Client name: ");
    const std::string password = readLine("Client password: ");
    const double balance = readDouble("Client balance: ");

    Client client(id, name, password, balance);
    employee->addClient(client);
    std::cout << "Client added with id " << id << ".\n";
}

void EmployeeManager::listAllClients(Employee* employee) {
    employee->listClient();
}

void EmployeeManager::searchForClient(Employee* employee) {
    const int id = readInt("Client id: ");
    Client* client = employee->searchClient(id);
    if (client == nullptr) {
        std::cout << "Client not found.\n";
        return;
    }

    client->display();
}

void EmployeeManager::editClientInfo(Employee* employee) {
    const int id = readInt("Client id to edit: ");
    const std::string name = readLine("New name: ");
    const std::string password = readLine("New password: ");
    const double balance = readDouble("New balance: ");

    employee->editClient(id, name, password, balance);
    std::cout << "Client updated successfully.\n";
}

Employee* EmployeeManager::login(int id, const std::string& password) {
    auto& employees = FilesHelper::getEmployees();
    for (auto& employee : employees) {
        if (employee.getId() == id && employee.getPassword() == password) {
            return &employee;
        }
    }
    return nullptr;
}

bool EmployeeManager::employeeOptions(Employee* employee) {
    if (employee == nullptr) {
        return false;
    }

    const int currentId = employee->getId();

    while (true) {
        auto& employees = FilesHelper::getEmployees();
        employee = nullptr;
        for (auto& current : employees) {
            if (current.getId() == currentId) {
                employee = &current;
                break;
            }
        }

        if (employee == nullptr) {
            std::cout << "Employee account is no longer available.\n";
            return false;
        }

        printEmployeeMenu();
        const int choice = readInt("Choose: ");

        try {
            if (choice == 1) {
                employee->display();
            } else if (choice == 2) {
                newClient(employee);
            } else if (choice == 3) {
                listAllClients(employee);
            } else if (choice == 4) {
                searchForClient(employee);
            } else if (choice == 5) {
                editClientInfo(employee);
            } else if (choice == 6) {
                ClientManager::updatePassword(employee);
                std::cout << "Password updated.\n";
            } else if (choice == 7) {
                return false;
            } else {
                std::cout << "Invalid choice.\n";
            }
        } catch (const std::exception& ex) {
            std::cout << ex.what() << '\n';
        }
    }
}
