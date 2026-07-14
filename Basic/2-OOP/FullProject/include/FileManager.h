#pragma once

#include "DataSourceInterface.h"

class FileManager : public DataSourceInterface {
public:
    void addClient(const Client& client) override;
    void addEmployee(const Employee& employee) override;
    void addAdmin(const Admin& admin) override;

    std::vector<Client> getAllClients() override;
    std::vector<Employee> getAllEmployees() override;
    std::vector<Admin> getAllAdmins() override;

    void removeAllClients() override;
    void removeAllEmployees() override;
    void removeAllAdmins() override;
};
