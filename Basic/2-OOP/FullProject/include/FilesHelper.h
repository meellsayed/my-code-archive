#pragma once

#include <string>
#include <vector>

#include "Admin.h"
#include "Client.h"
#include "Employee.h"

class FilesHelper {
public:
    static void saveLast(const std::string& fileName, int id);
    static int getLast(const std::string& fileName);

    static void saveClient(const Client& client);
    static void saveEmployee(const std::string& fileName, const std::string& lastIdFile, const Employee& employee);
    static void saveAdmin(const Admin& admin);

    static std::vector<Client>& getClients();
    static std::vector<Employee>& getEmployees();
    static std::vector<Admin>& getAdmins();

    static void clearFile(const std::string& fileName, const std::string& lastIdFile);

    static void saveAllClients(const std::vector<Client>& clients);
    static void saveAllEmployees(const std::vector<Employee>& employees);
    static void saveAllAdmins(const std::vector<Admin>& admins);

    static std::string clientsFile();
    static std::string employeesFile();
    static std::string adminsFile();
    static std::string lastClientIdFile();
    static std::string lastEmployeeIdFile();
    static std::string lastAdminIdFile();

private:
    static void ensureStorage();
};
