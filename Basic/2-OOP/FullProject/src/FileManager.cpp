#include "FileManager.h"

#include "FilesHelper.h"

void FileManager::addClient(const Client& client) {
    FilesHelper::saveClient(client);
}

void FileManager::addEmployee(const Employee& employee) {
    FilesHelper::saveEmployee(FilesHelper::employeesFile(), FilesHelper::lastEmployeeIdFile(), employee);
}

void FileManager::addAdmin(const Admin& admin) {
    FilesHelper::saveAdmin(admin);
}

std::vector<Client> FileManager::getAllClients() {
    return FilesHelper::getClients();
}

std::vector<Employee> FileManager::getAllEmployees() {
    return FilesHelper::getEmployees();
}

std::vector<Admin> FileManager::getAllAdmins() {
    return FilesHelper::getAdmins();
}

void FileManager::removeAllClients() {
    FilesHelper::clearFile(FilesHelper::clientsFile(), FilesHelper::lastClientIdFile());
}

void FileManager::removeAllEmployees() {
    FilesHelper::clearFile(FilesHelper::employeesFile(), FilesHelper::lastEmployeeIdFile());
}

void FileManager::removeAllAdmins() {
    FilesHelper::clearFile(FilesHelper::adminsFile(), FilesHelper::lastAdminIdFile());
}
