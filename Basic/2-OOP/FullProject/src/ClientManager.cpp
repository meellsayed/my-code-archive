#include "ClientManager.h"

#include <iostream>
#include <limits>

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

void ClientManager::printClientMenu() {
    std::cout << "\nClient Menu\n";
    std::cout << "1. Display my info\n";
    std::cout << "2. Check balance\n";
    std::cout << "3. Deposit\n";
    std::cout << "4. Withdraw\n";
    std::cout << "5. Transfer money\n";
    std::cout << "6. Change password\n";
    std::cout << "7. Logout\n";
}

void ClientManager::updatePassword(Person* person) {
    const std::string newPassword = readLine("Enter new password: ");
    person->setPassword(newPassword);

    auto& clients = FilesHelper::getClients();
    for (auto& client : clients) {
        if (client.getId() == person->getId()) {
            client.setPassword(newPassword);
            FilesHelper::saveAllClients(clients);
            return;
        }
    }

    auto& employees = FilesHelper::getEmployees();
    for (auto& employee : employees) {
        if (employee.getId() == person->getId()) {
            employee.setPassword(newPassword);
            FilesHelper::saveAllEmployees(employees);
            return;
        }
    }

    auto& admins = FilesHelper::getAdmins();
    for (auto& admin : admins) {
        if (admin.getId() == person->getId()) {
            admin.setPassword(newPassword);
            FilesHelper::saveAllAdmins(admins);
            return;
        }
    }
}

Client* ClientManager::login(int id, const std::string& password) {
    auto& clients = FilesHelper::getClients();
    for (auto& client : clients) {
        if (client.getId() == id && client.getPassword() == password) {
            return &client;
        }
    }
    return nullptr;
}

bool ClientManager::clientOptions(Client* client) {
    if (client == nullptr) {
        return false;
    }

    const int currentId = client->getId();

    while (true) {
        auto& clients = FilesHelper::getClients();
        client = nullptr;
        for (auto& current : clients) {
            if (current.getId() == currentId) {
                client = &current;
                break;
            }
        }

        if (client == nullptr) {
            std::cout << "Client account is no longer available.\n";
            return false;
        }

        printClientMenu();
        const int choice = readInt("Choose: ");

        try {
            if (choice == 1) {
                client->display();
            } else if (choice == 2) {
                client->checkBalance();
            } else if (choice == 3) {
                const double amount = readDouble("Amount to deposit: ");
                client->deposit(amount);
                FilesHelper::saveAllClients(clients);
                std::cout << "Deposit completed.\n";
            } else if (choice == 4) {
                const double amount = readDouble("Amount to withdraw: ");
                client->withdraw(amount);
                FilesHelper::saveAllClients(clients);
                std::cout << "Withdraw completed.\n";
            } else if (choice == 5) {
                const int recipientId = readInt("Recipient id: ");
                Client* sender = nullptr;
                Client* recipient = nullptr;

                for (auto& current : clients) {
                    if (current.getId() == client->getId()) {
                        sender = &current;
                    }
                    if (current.getId() == recipientId) {
                        recipient = &current;
                    }
                }

                if (sender == nullptr || recipient == nullptr) {
                    std::cout << "Sender or recipient not found.\n";
                    continue;
                }

                const double amount = readDouble("Amount to transfer: ");
                sender->transferTo(amount, *recipient);
                FilesHelper::saveAllClients(clients);
                std::cout << "Transfer completed.\n";
            } else if (choice == 6) {
                updatePassword(client);
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
