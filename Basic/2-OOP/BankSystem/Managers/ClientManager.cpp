#include "ClientManager.h"

#include <iostream>
#include <vector>

#include "Admin.h"
#include "Employee.h"
#include "FilesHelper.h"

using namespace std;

namespace
{
void rewriteClients(const vector<Client> &clients)
{
    FilesHelper::clearFile("Data/Clients.txt", "Data/ClientsLastId.txt");
    for (const Client &client : clients)
    {
        FilesHelper::saveClient(client);
    }
}

void rewriteEmployees(const vector<Employee> &employees)
{
    FilesHelper::clearFile("Data/Employees.txt", "Data/EmployeesLastId.txt");
    for (const Employee &employee : employees)
    {
        FilesHelper::saveEmployee("Data/Employees.txt", "Data/EmployeesLastId.txt", employee);
    }
}

void rewriteAdmins(const vector<Admin> &admins)
{
    FilesHelper::clearFile("Data/Admins.txt", "Data/AdminsLastId.txt");
    for (const Admin &admin : admins)
    {
        FilesHelper::saveAdmin(admin);
    }
}
}

void ClientManager::printClientMenu()
{
    cout << "\nClient Menu\n";
    cout << "1. Deposit\n";
    cout << "2. Withdraw\n";
    cout << "3. Transfer\n";
    cout << "4. Check Balance\n";
    cout << "5. Display Info\n";
    cout << "6. Update Password\n";
    cout << "7. Logout\n";
    cout << "Choose: ";
}

void ClientManager::updatePassword(Person *person)
{
    if (person == nullptr)
    {
        return;
    }

    string new_password;
    cout << "Enter new password: ";
    cin >> new_password;
    person->setPassword(new_password);

    if (Client *client = dynamic_cast<Client *>(person))
    {
        vector<Client> clients = FilesHelper::getClients();
        for (Client &saved_client : clients)
        {
            if (saved_client.getId() == client->getId())
            {
                saved_client.setPassword(new_password);
            }
        }
        rewriteClients(clients);
        return;
    }

    if (Admin *admin = dynamic_cast<Admin *>(person))
    {
        vector<Admin> admins = FilesHelper::getAdmins();
        for (Admin &saved_admin : admins)
        {
            if (saved_admin.getId() == admin->getId())
            {
                saved_admin.setPassword(new_password);
            }
        }
        rewriteAdmins(admins);
        return;
    }

    if (Employee *employee = dynamic_cast<Employee *>(person))
    {
        vector<Employee> employees = FilesHelper::getEmployees();
        for (Employee &saved_employee : employees)
        {
            if (saved_employee.getId() == employee->getId())
            {
                saved_employee.setPassword(new_password);
            }
        }
        rewriteEmployees(employees);
    }
}

Client *ClientManager::login(int id, string password)
{
    vector<Client> clients = FilesHelper::getClients();

    for (const Client &client : clients)
    {
        if (client.getId() == id && client.getPassword() == password)
        {
            return new Client(client);
        }
    }

    return nullptr;
}

bool ClientManager::clientOptions(Client *client)
{
    if (client == nullptr)
    {
        return false;
    }

    int choice = 0;
    printClientMenu();
    cin >> choice;

    try
    {
        if (choice == 1)
        {
            double amount;
            cout << "Enter amount: ";
            cin >> amount;
            client->deposit(amount);
        }
        else if (choice == 2)
        {
            double amount;
            cout << "Enter amount: ";
            cin >> amount;
            client->withdraw(amount);
        }
        else if (choice == 3)
        {
            int recipient_id;
            double amount;
            cout << "Enter recipient id: ";
            cin >> recipient_id;
            cout << "Enter amount: ";
            cin >> amount;

            vector<Client> clients = FilesHelper::getClients();
            Client *recipient = nullptr;

            for (Client &saved_client : clients)
            {
                if (saved_client.getId() == recipient_id)
                {
                    recipient = &saved_client;
                    break;
                }
            }

            if (recipient == nullptr)
            {
                cout << "Client not found.\n";
                return true;
            }

            client->transferTo(amount, *recipient);
            for (Client &saved_client : clients)
            {
                if (saved_client.getId() == client->getId())
                {
                    saved_client = *client;
                }
            }
            rewriteClients(clients);
            return true;
        }
        else if (choice == 4)
        {
            client->checkBalance();
            return true;
        }
        else if (choice == 5)
        {
            client->display();
            return true;
        }
        else if (choice == 6)
        {
            updatePassword(client);
            return true;
        }
        else if (choice == 7)
        {
            return false;
        }
        else
        {
            cout << "Invalid option.\n";
            return true;
        }

        vector<Client> clients = FilesHelper::getClients();
        for (Client &saved_client : clients)
        {
            if (saved_client.getId() == client->getId())
            {
                saved_client = *client;
            }
        }
        rewriteClients(clients);
    }
    catch (const exception &e)
    {
        cout << e.what() << "\n";
    }

    return true;
}
