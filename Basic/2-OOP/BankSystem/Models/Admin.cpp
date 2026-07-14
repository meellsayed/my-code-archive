#include "Admin.h"
#include "Client.h"
#include "FilesHelper.h"

void Admin::addClient(Client &client)
{
    FilesHelper::saveClient(client);
}

Client *Admin::searchClient(int id)
{
    vector<Client> clients = FilesHelper::getClients();

    for (const Client &client : clients)
    {
        if (client.getId() == id)
        {
            return new Client(client);
        }
    }

    return nullptr;
}

void Admin::listClient()
{
    vector<Client> clients = FilesHelper::getClients();

    for (const Client &client : clients)
    {
        client.display();
    }
}

void Admin::editClient(int id, string name, string password, double balance)
{
    vector<Client> clients = FilesHelper::getClients();

    for (Client &client : clients)
    {
        if (client.getId() == id)
        {
            client.setName(name);
            client.setPassword(password);
            client.setBalance(balance);
        }
    }

    FilesHelper::clearFile("Data/Clients.txt", "Data/ClientsLastId.txt");
    for (const Client &client : clients)
    {
        FilesHelper::saveClient(client);
    }
}

void Admin::addEmployee(Employee &employee)
{
    FilesHelper::saveEmployee("Data/Employees.txt", "Data/EmployeesLastId.txt", employee);
}

Employee *Admin::searchEmployee(int id)
{
    vector<Employee> employees = FilesHelper::getEmployees();

    for (const Employee &employee : employees)
    {
        if (employee.getId() == id)
        {
            return new Employee(employee);
        }
    }

    return nullptr;
}

void Admin::editEmployee(int id, string name, string password, double salary)
{
    vector<Employee> employees = FilesHelper::getEmployees();

    for (Employee &employee : employees)
    {
        if (employee.getId() == id)
        {
            employee.setName(name);
            employee.setPassword(password);
            employee.setSalary(salary);
        }
    }

    FilesHelper::clearFile("Data/Employees.txt", "Data/EmployeesLastId.txt");
    for (const Employee &employee : employees)
    {
        FilesHelper::saveEmployee("Data/Employees.txt", "Data/EmployeesLastId.txt", employee);
    }
}

void Admin::listEmployee()
{
    vector<Employee> employees = FilesHelper::getEmployees();

    for (const Employee &employee : employees)
    {
        employee.display();
    }
}
