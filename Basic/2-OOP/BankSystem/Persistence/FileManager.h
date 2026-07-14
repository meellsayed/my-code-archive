#pragma once

#include <fstream>
#include <string>
#include <vector>

#include "Admin.h"
#include "Client.h"
#include "DataSourceInterface.h"
#include "Employee.h"
#include "Parser.h"

using namespace std;

class FileManager : public DataSourceInterface
{
private:
    string clientsFile() const
    {
        return "Data/Clients.txt";
    }

    string employeesFile() const
    {
        return "Data/Employees.txt";
    }

    string adminsFile() const
    {
        return "Data/Admins.txt";
    }

    void createIfMissing(const string &path) const
    {
        ifstream file(path);
        if (!file.good())
        {
            ofstream create_file(path);
        }
    }

    void removeDataFile(const string &file_name) const
    {
        ofstream file(file_name, ios::trunc);
    }

public:
    void createFiles()
    {
        createIfMissing(clientsFile());
        createIfMissing(employeesFile());
        createIfMissing(adminsFile());
    }

    void addClient(const Client &client) override
    {
        createIfMissing(clientsFile());
        ofstream file(clientsFile(), ios::app);
        file << client.getId() << "#//#" << client.getPassword() << "#//#"
             << client.getName() << "#//#" << client.getBalance() << "\n";
    }

    void addEmployee(const Employee &employee) override
    {
        createIfMissing(employeesFile());
        ofstream file(employeesFile(), ios::app);
        file << employee.getId() << "#//#" << employee.getPassword() << "#//#"
             << employee.getName() << "#//#" << employee.getSalary() << "\n";
    }

    void addAdmin(const Admin &admin) override
    {
        createIfMissing(adminsFile());
        ofstream file(adminsFile(), ios::app);
        file << admin.getId() << "#//#" << admin.getPassword() << "#//#"
             << admin.getName() << "#//#" << admin.getSalary() << "\n";
    }

    vector<Client> getAllClients() override
    {
        createIfMissing(clientsFile());

        vector<Client> clients;
        ifstream file(clientsFile());
        string line;

        while (getline(file, line))
        {
            if (!line.empty())
            {
                clients.push_back(Parser::parseToClient(line));
            }
        }

        return clients;
    }

    vector<Employee> getAllEmployees() override
    {
        createIfMissing(employeesFile());

        vector<Employee> employees;
        ifstream file(employeesFile());
        string line;

        while (getline(file, line))
        {
            if (!line.empty())
            {
                employees.push_back(Parser::parseToEmployee(line));
            }
        }

        return employees;
    }

    vector<Admin> getAllAdmins() override
    {
        createIfMissing(adminsFile());

        vector<Admin> admins;
        ifstream file(adminsFile());
        string line;

        while (getline(file, line))
        {
            if (!line.empty())
            {
                admins.push_back(Parser::parseToAdmin(line));
            }
        }

        return admins;
    }

    void removeAllClients() override
    {
        removeDataFile(clientsFile());
    }

    void removeAllEmployees() override
    {
        removeDataFile(employeesFile());
    }

    void removeAllAdmins() override
    {
        removeDataFile(adminsFile());
    }
};
