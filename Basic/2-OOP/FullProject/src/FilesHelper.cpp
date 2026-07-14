#include "FilesHelper.h"

#include <algorithm>
#include <direct.h>
#include <fstream>
#include <sstream>

#include "Parser.h"

namespace {
std::vector<Client> clientsCache;
std::vector<Employee> employeesCache;
std::vector<Admin> adminsCache;

std::string toLine(const Client& client) {
    std::ostringstream output;
    output << client.getId() << ';' << client.getName() << ';' << client.getPassword() << ';' << client.getBalance();
    return output.str();
}

std::string toLine(const Employee& employee) {
    std::ostringstream output;
    output << employee.getId() << ';' << employee.getName() << ';' << employee.getPassword() << ';' << employee.getSalary();
    return output.str();
}

std::string toLine(const Admin& admin) {
    std::ostringstream output;
    output << admin.getId() << ';' << admin.getName() << ';' << admin.getPassword() << ';' << admin.getSalary();
    return output.str();
}

int maxClientId(const std::vector<Client>& clients) {
    int value = 0;
    for (const auto& client : clients) {
        value = std::max(value, client.getId());
    }
    return value;
}

int maxEmployeeId(const std::vector<Employee>& employees) {
    int value = 0;
    for (const auto& employee : employees) {
        value = std::max(value, employee.getId());
    }
    return value;
}

int maxAdminId(const std::vector<Admin>& admins) {
    int value = 0;
    for (const auto& admin : admins) {
        value = std::max(value, admin.getId());
    }
    return value;
}
} // namespace

std::string FilesHelper::clientsFile() {
    return "data/Clients.txt";
}

std::string FilesHelper::employeesFile() {
    return "data/Employees.txt";
}

std::string FilesHelper::adminsFile() {
    return "data/Admins.txt";
}

std::string FilesHelper::lastClientIdFile() {
    return "data/LastClientId.txt";
}

std::string FilesHelper::lastEmployeeIdFile() {
    return "data/LastEmployeeId.txt";
}

std::string FilesHelper::lastAdminIdFile() {
    return "data/LastAdminId.txt";
}

void FilesHelper::ensureStorage() {
    _mkdir("data");

    const std::vector<std::string> files = {
        clientsFile(),
        employeesFile(),
        adminsFile(),
        lastClientIdFile(),
        lastEmployeeIdFile(),
        lastAdminIdFile()
    };

    for (const auto& file : files) {
        std::ifstream test(file);
        if (!test.good()) {
            std::ofstream create(file);
            if (file.find("Last") != std::string::npos) {
                create << 0;
            }
        }
    }
}

void FilesHelper::saveLast(const std::string& fileName, int id) {
    ensureStorage();
    std::ofstream outFile(fileName, std::ios::trunc);
    outFile << id;
}

int FilesHelper::getLast(const std::string& fileName) {
    ensureStorage();
    std::ifstream inFile(fileName);
    int id = 0;
    inFile >> id;
    return id;
}

void FilesHelper::saveClient(const Client& client) {
    ensureStorage();
    std::ofstream outFile(clientsFile(), std::ios::app);
    outFile << toLine(client) << '\n';
    saveLast(lastClientIdFile(), std::max(getLast(lastClientIdFile()), client.getId()));
}

void FilesHelper::saveEmployee(const std::string& fileName, const std::string& lastIdFile, const Employee& employee) {
    ensureStorage();
    std::ofstream outFile(fileName, std::ios::app);
    outFile << toLine(employee) << '\n';
    saveLast(lastIdFile, std::max(getLast(lastIdFile), employee.getId()));
}

void FilesHelper::saveAdmin(const Admin& admin) {
    ensureStorage();
    std::ofstream outFile(adminsFile(), std::ios::app);
    outFile << toLine(admin) << '\n';
    saveLast(lastAdminIdFile(), std::max(getLast(lastAdminIdFile()), admin.getId()));
}

std::vector<Client>& FilesHelper::getClients() {
    ensureStorage();
    clientsCache.clear();

    std::ifstream inFile(clientsFile());
    std::string line;
    while (std::getline(inFile, line)) {
        if (!line.empty()) {
            clientsCache.push_back(Parser::parseToClient(line));
        }
    }

    return clientsCache;
}

std::vector<Employee>& FilesHelper::getEmployees() {
    ensureStorage();
    employeesCache.clear();

    std::ifstream inFile(employeesFile());
    std::string line;
    while (std::getline(inFile, line)) {
        if (!line.empty()) {
            employeesCache.push_back(Parser::parseToEmployee(line));
        }
    }

    return employeesCache;
}

std::vector<Admin>& FilesHelper::getAdmins() {
    ensureStorage();
    adminsCache.clear();

    std::ifstream inFile(adminsFile());
    std::string line;
    while (std::getline(inFile, line)) {
        if (!line.empty()) {
            adminsCache.push_back(Parser::parseToAdmin(line));
        }
    }

    return adminsCache;
}

void FilesHelper::clearFile(const std::string& fileName, const std::string& lastIdFile) {
    ensureStorage();
    std::ofstream outFile(fileName, std::ios::trunc);
    outFile.close();
    saveLast(lastIdFile, 0);
}

void FilesHelper::saveAllClients(const std::vector<Client>& clients) {
    ensureStorage();
    std::ofstream outFile(clientsFile(), std::ios::trunc);
    for (const auto& client : clients) {
        outFile << toLine(client) << '\n';
    }
    saveLast(lastClientIdFile(), maxClientId(clients));
}

void FilesHelper::saveAllEmployees(const std::vector<Employee>& employees) {
    ensureStorage();
    std::ofstream outFile(employeesFile(), std::ios::trunc);
    for (const auto& employee : employees) {
        outFile << toLine(employee) << '\n';
    }
    saveLast(lastEmployeeIdFile(), maxEmployeeId(employees));
}

void FilesHelper::saveAllAdmins(const std::vector<Admin>& admins) {
    ensureStorage();
    std::ofstream outFile(adminsFile(), std::ios::trunc);
    for (const auto& admin : admins) {
        outFile << toLine(admin) << '\n';
    }
    saveLast(lastAdminIdFile(), maxAdminId(admins));
}
