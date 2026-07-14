#include "Screens.h"

#include <iostream>
#include <string>

#include "AdminManager.h"
#include "ClientManager.h"
#include "EmployeeManager.h"

using namespace std;

void Screens::bankName()
{
    cout << "========================\n";
    cout << "      Bank System\n";
    cout << "========================\n";
}

void Screens::welcome()
{
    bankName();
    cout << "Welcome to our banking app\n";
}

void Screens::loginOptions()
{
    cout << "1. Client\n";
    cout << "2. Employee\n";
    cout << "3. Admin\n";
    cout << "4. Exit\n";
}

int Screens::loginAs()
{
    int choice;
    cout << "Login as: ";
    cin >> choice;
    return choice;
}

void Screens::invalid(int c)
{
    cout << "Invalid choice: " << c << "\n";
}

void Screens::logout()
{
    cout << "Logged out successfully.\n";
}

void Screens::loginScreen(int c)
{
    int id;
    string password;

    cout << "Enter id: ";
    cin >> id;
    cout << "Enter password: ";
    cin >> password;

    if (c == 1)
    {
        Client *client = ClientManager::login(id, password);
        if (client == nullptr)
        {
            cout << "Invalid id or password.\n";
            return;
        }

        while (ClientManager::clientOptions(client))
        {
        }

        logout();
        delete client;
    }
    else if (c == 2)
    {
        Employee *employee = EmployeeManager::login(id, password);
        if (employee == nullptr)
        {
            cout << "Invalid id or password.\n";
            return;
        }

        while (EmployeeManager::employeeOptions(employee))
        {
        }

        logout();
        delete employee;
    }
    else if (c == 3)
    {
        Admin *admin = AdminManager::login(id, password);
        if (admin == nullptr)
        {
            cout << "Invalid id or password.\n";
            return;
        }

        while (AdminManager::AdminOptions(admin))
        {
        }

        logout();
        delete admin;
    }
    else
    {
        invalid(c);
    }
}

void Screens::runApp()
{
    while (true)
    {
        welcome();
        loginOptions();
        int choice = loginAs();

        if (choice == 4)
        {
            cout << "Goodbye.\n";
            break;
        }

        loginScreen(choice);
        cout << "\n";
    }
}
