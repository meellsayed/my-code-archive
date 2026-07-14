#include "Screens.h"

#include <iostream>
#include <limits>
#include <string>

#include "AdminManager.h"
#include "ClientManager.h"
#include "EmployeeManager.h"
#include "FileManager.h"
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

std::string readLine(const std::string& message) {
    std::string value;
    std::cout << message;
    std::getline(std::cin >> std::ws, value);
    return value;
}

void seedDefaultAdminIfNeeded() {
    if (!FilesHelper::getAdmins().empty()) {
        return;
    }

    Admin admin(1, "AdminUser", "admin123", 10000);
    FileManager fileManager;
    fileManager.addAdmin(admin);
}
} // namespace

void Screens::bankName() {
    std::cout << "====================================\n";
    std::cout << "           Bank System App          \n";
    std::cout << "====================================\n";
}

void Screens::welcome() {
    bankName();
    std::cout << "Welcome to the simple bank system.\n";
}

void Screens::loginOptions() {
    std::cout << "\nLogin As\n";
    std::cout << "1. Client\n";
    std::cout << "2. Employee\n";
    std::cout << "3. Admin\n";
    std::cout << "4. Exit\n";
}

int Screens::loginAs() {
    return readInt("Choose role: ");
}

void Screens::invalid(int choice) {
    std::cout << "Choice " << choice << " is invalid.\n";
}

void Screens::logout() {
    std::cout << "Logged out successfully.\n";
}

void Screens::loginScreen(int choice) {
    const int id = readInt("Id: ");
    const std::string password = readLine("Password: ");

    if (choice == 1) {
        Client* client = ClientManager::login(id, password);
        if (client == nullptr) {
            std::cout << "Invalid client credentials.\n";
            return;
        }
        ClientManager::clientOptions(client);
        logout();
    } else if (choice == 2) {
        Employee* employee = EmployeeManager::login(id, password);
        if (employee == nullptr) {
            std::cout << "Invalid employee credentials.\n";
            return;
        }
        EmployeeManager::employeeOptions(employee);
        logout();
    } else if (choice == 3) {
        Admin* admin = AdminManager::login(id, password);
        if (admin == nullptr) {
            std::cout << "Invalid admin credentials.\n";
            return;
        }
        AdminManager::adminOptions(admin);
        logout();
    } else {
        invalid(choice);
    }
}

void Screens::runApp() {
    seedDefaultAdminIfNeeded();
    welcome();

    while (true) {
        loginOptions();
        const int choice = loginAs();
        if (choice == 4) {
            std::cout << "Goodbye.\n";
            return;
        }

        loginScreen(choice);
    }
}
