#pragma once

#include <string>
#include <vector>

#include "Admin.h"
#include "Client.h"
#include "Employee.h"

using namespace std;

class FilesHelper
{
public:
    static void saveLast(const string &fileName, int id);
    static int getLast(const string &fileName);

    static void saveClient(const Client &client);
    static void saveEmployee(const string &fileName, const string &lastIdFile, const Employee &employee);
    static void saveAdmin(const Admin &admin);

    static vector<Client> getClients();
    static vector<Employee> getEmployees();
    static vector<Admin> getAdmins();

    static void clearFile(const string &fileName, const string &lastIdFile);
};
