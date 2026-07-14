#include "AdminManager.h"

#include <iostream>
#include <limits>

#include "ClientManager.h"
#include "EmployeeManager.h"
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

void AdminManager::printAdminMenu() {
    std::cout << "\nAdmin Menu\n";
    std::cout << "1. Display my info\n";
    std::cout << "2. Add new client\n";
    std::cout << "3. List all clients\n";
    std::cout << "4. Search for client\n";
    std::cout << "5. Edit client info\n";
    std::cout << "6. Add new employee\n";
    std::cout << "7. List all employees\n";
    std::cout << "8. Search for employee\n";
    std::cout << "9. Edit employee info\n";
    std::cout << "10. Change password\n";
    std::cout << "11. Logout\n";
}

Admin* AdminManager::login(int id, const std::string& password) {
    auto& admins = FilesHelper::getAdmins();
    for (auto& admin : admins) {
        if (admin.getId() == id && admin.getPassword() == password) {
            return &admin;
        }
    }
    return nullptr;
}

bool AdminManager::adminOptions(Admin* admin) {
    if (admin == nullptr) {
        return false;
    }

    const int currentId = admin->getId();

    while (true) {
        auto& admins = FilesHelper::getAdmins();
        admin = nullptr;
        for (auto& current : admins) {
            if (current.getId() == currentId) {
                admin = &current;
                break;
            }
        }

        if (admin == nullptr) {
            std::cout << "Admin account is no longer available.\n";
            return false;
        }

        printAdminMenu();
        const int choice = readInt("Choose: ");

        try {
            if (choice == 1) {
                admin->display();
            } else if (choice == 2) {
                EmployeeManager::newClient(admin);
            } else if (choice == 3) {
                admin->listClient();
            } else if (choice == 4) {
                const int id = readInt("Client id: ");
                Client* client = admin->searchClient(id);
                if (client == nullptr) {
                    std::cout << "Client not found.\n";
                } else {
                    client->display();
                }
            } else if (choice == 5) {
                EmployeeManager::editClientInfo(admin);
            } else if (choice == 6) {
                const int id = FilesHelper::getLast(FilesHelper::lastEmployeeIdFile()) + 1;
                const std::string name = readLine("Employee name: ");
                const std::string password = readLine("Employee password: ");
                const double salary = readDouble("Employee salary: ");
                Employee employee(id, name, password, salary);
                admin->addEmployee(employee);
                std::cout << "Employee added with id " << id << ".\n";
            } else if (choice == 7) {
                admin->listEmployee();
            } else if (choice == 8) {
                const int id = readInt("Employee id: ");
                Employee* employee = admin->searchEmployee(id);
                if (employee == nullptr) {
                    std::cout << "Employee not found.\n";
                } else {
                    employee->display();
                }
            } else if (choice == 9) {
                const int id = readInt("Employee id to edit: ");
                const std::string name = readLine("New name: ");
                const std::string password = readLine("New password: ");
                const double salary = readDouble("New salary: ");
                admin->editEmployee(id, name, password, salary);
                std::cout << "Employee updated successfully.\n";
            } else if (choice == 10) {
                ClientManager::updatePassword(admin);
                std::cout << "Password updated.\n";
            } else if (choice == 11) {
                return false;
            } else {
                std::cout << "Invalid choice.\n";
            }
        } catch (const std::exception& ex) {
            std::cout << ex.what() << '\n';
        }
    }
}
