#include "AdminManager.h"

#include <iostream>
#include <vector>

#include "ClientManager.h"
#include "FilesHelper.h"

using namespace std;

void AdminManager::printClientMenu()
{
    cout << "\nAdmin Menu\n";
    cout << "1. Add New Client\n";
    cout << "2. Search For Client\n";
    cout << "3. List All Clients\n";
    cout << "4. Edit Client Info\n";
    cout << "5. Add Employee\n";
    cout << "6. Search Employee\n";
    cout << "7. Edit Employee\n";
    cout << "8. List Employees\n";
    cout << "9. Update Password\n";
    cout << "10. Logout\n";
    cout << "Choose: ";
}

Admin *AdminManager::login(int id, string password)
{
    vector<Admin> admins = FilesHelper::getAdmins();

    for (const Admin &admin : admins)
    {
        if (admin.getId() == id && admin.getPassword() == password)
        {
            return new Admin(admin);
        }
    }

    return nullptr;
}

bool AdminManager::AdminOptions(Admin *admin)
{
    if (admin == nullptr)
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
            int id;
            string name;
            string password;
            double balance;

            cout << "Enter client id: ";
            cin >> id;
            cout << "Enter client name: ";
            cin >> name;
            cout << "Enter client password: ";
            cin >> password;
            cout << "Enter client balance: ";
            cin >> balance;

            Client client(id, password, name, balance);
            admin->addClient(client);
        }
        else if (choice == 2)
        {
            int id;
            cout << "Enter client id: ";
            cin >> id;

            Client *client = admin->searchClient(id);
            if (client == nullptr)
            {
                cout << "Client not found.\n";
            }
            else
            {
                client->display();
                delete client;
            }
        }
        else if (choice == 3)
        {
            admin->listClient();
        }
        else if (choice == 4)
        {
            int id;
            string name;
            string password;
            double balance;

            cout << "Enter client id: ";
            cin >> id;
            cout << "Enter new name: ";
            cin >> name;
            cout << "Enter new password: ";
            cin >> password;
            cout << "Enter new balance: ";
            cin >> balance;

            admin->editClient(id, name, password, balance);
        }
        else if (choice == 5)
        {
            int id;
            string name;
            string password;
            double salary;

            cout << "Enter employee id: ";
            cin >> id;
            cout << "Enter employee name: ";
            cin >> name;
            cout << "Enter employee password: ";
            cin >> password;
            cout << "Enter employee salary: ";
            cin >> salary;

            Employee employee(id, password, name, salary);
            admin->addEmployee(employee);
        }
        else if (choice == 6)
        {
            int id;
            cout << "Enter employee id: ";
            cin >> id;

            Employee *employee = admin->searchEmployee(id);
            if (employee == nullptr)
            {
                cout << "Employee not found.\n";
            }
            else
            {
                employee->display();
                delete employee;
            }
        }
        else if (choice == 7)
        {
            int id;
            string name;
            string password;
            double salary;

            cout << "Enter employee id: ";
            cin >> id;
            cout << "Enter new name: ";
            cin >> name;
            cout << "Enter new password: ";
            cin >> password;
            cout << "Enter new salary: ";
            cin >> salary;

            admin->editEmployee(id, name, password, salary);
        }
        else if (choice == 8)
        {
            admin->listEmployee();
        }
        else if (choice == 9)
        {
            ClientManager::updatePassword(admin);
        }
        else if (choice == 10)
        {
            return false;
        }
        else
        {
            cout << "Invalid option.\n";
        }
    }
    catch (const exception &e)
    {
        cout << e.what() << "\n";
    }

    return true;
}
