#include "EmployeeManager.h"

#include <iostream>
#include <vector>

#include "ClientManager.h"
#include "FilesHelper.h"

using namespace std;

void EmployeeManager::printClientMenu()
{
    cout << "\nEmployee Menu\n";
    cout << "1. Add New Client\n";
    cout << "2. List All Clients\n";
    cout << "3. Search For Client\n";
    cout << "4. Edit Client Info\n";
    cout << "5. Update Password\n";
    cout << "6. Logout\n";
    cout << "Choose: ";
}

void EmployeeManager::newClient(Employee *employee)
{
    if (employee == nullptr)
    {
        return;
    }

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
    employee->addClient(client);
}

void EmployeeManager::listAllClients(Employee *employee)
{
    if (employee != nullptr)
    {
        employee->listClient();
    }
}

void EmployeeManager::searchForClient(Employee *employee)
{
    if (employee == nullptr)
    {
        return;
    }

    int id;
    cout << "Enter client id: ";
    cin >> id;

    Client *client = employee->searchClient(id);
    if (client == nullptr)
    {
        cout << "Client not found.\n";
        return;
    }

    client->display();
    delete client;
}

void EmployeeManager::editClientInfo(Employee *employee)
{
    if (employee == nullptr)
    {
        return;
    }

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

    employee->editClient(id, name, password, balance);
}

Employee *EmployeeManager::login(int id, string password)
{
    vector<Employee> employees = FilesHelper::getEmployees();

    for (const Employee &employee : employees)
    {
        if (employee.getId() == id && employee.getPassword() == password)
        {
            return new Employee(employee);
        }
    }

    return nullptr;
}

bool EmployeeManager::employeeOptions(Employee *employee)
{
    if (employee == nullptr)
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
            newClient(employee);
        }
        else if (choice == 2)
        {
            listAllClients(employee);
        }
        else if (choice == 3)
        {
            searchForClient(employee);
        }
        else if (choice == 4)
        {
            editClientInfo(employee);
        }
        else if (choice == 5)
        {
            ClientManager::updatePassword(employee);
        }
        else if (choice == 6)
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
