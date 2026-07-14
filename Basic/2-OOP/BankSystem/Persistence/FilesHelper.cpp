#include "FilesHelper.h"

#include <fstream>

#include "FileManager.h"

void FilesHelper::saveLast(const string &fileName, int id)
{
    ofstream file(fileName, ios::trunc);
    file << id;
}

int FilesHelper::getLast(const string &fileName)
{
    ifstream file(fileName);
    int id = 0;

    if (file >> id)
    {
        return id;
    }

    return 0;
}

void FilesHelper::saveClient(const Client &client)
{
    FileManager file_manager;
    file_manager.addClient(client);
    saveLast("Data/ClientsLastId.txt", client.getId());
}

void FilesHelper::saveEmployee(const string &fileName, const string &lastIdFile, const Employee &employee)
{
    ofstream file(fileName, ios::app);
    file << employee.getId() << "#//#" << employee.getPassword() << "#//#"
         << employee.getName() << "#//#" << employee.getSalary() << "\n";
    saveLast(lastIdFile, employee.getId());
}

void FilesHelper::saveAdmin(const Admin &admin)
{
    ofstream file("Data/Admins.txt", ios::app);
    file << admin.getId() << "#//#" << admin.getPassword() << "#//#"
         << admin.getName() << "#//#" << admin.getSalary() << "\n";
    saveLast("Data/AdminsLastId.txt", admin.getId());
}

vector<Client> FilesHelper::getClients()
{
    FileManager file_manager;
    return file_manager.getAllClients();
}

vector<Employee> FilesHelper::getEmployees()
{
    FileManager file_manager;
    return file_manager.getAllEmployees();
}

vector<Admin> FilesHelper::getAdmins()
{
    FileManager file_manager;
    return file_manager.getAllAdmins();
}

void FilesHelper::clearFile(const string &fileName, const string &lastIdFile)
{
    ofstream file(fileName, ios::trunc);
    saveLast(lastIdFile, 0);
}
