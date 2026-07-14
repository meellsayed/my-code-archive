#pragma once

#include <vector>

#include "Admin.h"
#include "Client.h"
#include "Employee.h"

class DataSourceInterface {
public:
    virtual ~DataSourceInterface() = default;

    virtual void addClient(const Client& client) = 0;
    virtual void addEmployee(const Employee& employee) = 0;
    virtual void addAdmin(const Admin& admin) = 0;

    virtual std::vector<Client> getAllClients() = 0;
    virtual std::vector<Employee> getAllEmployees() = 0;
    virtual std::vector<Admin> getAllAdmins() = 0;

    virtual void removeAllClients() = 0;
    virtual void removeAllEmployees() = 0;
    virtual void removeAllAdmins() = 0;
};
