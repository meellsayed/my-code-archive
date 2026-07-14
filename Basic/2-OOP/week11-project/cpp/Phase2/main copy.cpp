#include <algorithm>
#include <cctype>
#include <direct.h>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

using namespace std;


class FilesHelper
{
public:
    static string clientsFile() { return "phase2_data/Clients.txt"; }
    static string employeesFile() { return "phase2_data/Employees.txt"; }
    static string adminsFile() { return "phase2_data/Admins.txt"; }

    static void ensureFiles()
    {
        _mkdir("phase2_data");
        createIfMissing(clientsFile());
        createIfMissing(employeesFile());
        createIfMissing(adminsFile());
    }

    static void saveClient(const Client &client)
    {
        ensureFiles();
        ofstream file(clientsFile(), ios::app);
        file << client.getId() << ';' << client.getName() << ';'
             << client.getPassword() << ';' << client.getBalance() << "\n";
    }

    static void saveEmployee(const Employee &employee)
    {
        ensureFiles();
        ofstream file(employeesFile(), ios::app);
        file << employee.getId() << ';' << employee.getName() << ';'
             << employee.getPassword() << ';' << employee.getSalary() << "\n";
    }

    static void saveAdmin(const Admin &admin)
    {
        ensureFiles();
        ofstream file(adminsFile(), ios::app);
        file << admin.getId() << ';' << admin.getName() << ';'
             << admin.getPassword() << ';' << admin.getSalary() << "\n";
    }

    static vector<Client> getClients()
    {
        ensureFiles();
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

    static vector<Employee> getEmployees()
    {
        ensureFiles();
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

    static vector<Admin> getAdmins()
    {
        ensureFiles();
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

    static void saveAllClients(const vector<Client> &clients)
    {
        ensureFiles();
        ofstream file(clientsFile(), ios::trunc);
        for (const Client &client : clients)
        {
            file << client.getId() << ';' << client.getName() << ';'
                 << client.getPassword() << ';' << client.getBalance() << "\n";
        }
    }

    static void saveAllEmployees(const vector<Employee> &employees)
    {
        ensureFiles();
        ofstream file(employeesFile(), ios::trunc);
        for (const Employee &employee : employees)
        {
            file << employee.getId() << ';' << employee.getName() << ';'
                 << employee.getPassword() << ';' << employee.getSalary() << "\n";
        }
    }

private:
    static void createIfMissing(const string &path)
    {
        ifstream test(path);
        if (!test.good())
        {
            ofstream file(path);
        }
    }
};

class EmployeeService : public Employee
{
public:
    EmployeeService(int id, const string &name, const string &password, double salary)
        : Employee(id, name, password, salary) {}

    void addClient(Client &client) { FilesHelper::saveClient(client); }

    Client *searchClient(int id)
    {
        static vector<Client> clients;
        clients = FilesHelper::getClients();
        for (Client &client : clients)
        {
            if (client.getId() == id)
            {
                return &client;
            }
        }
        return nullptr;
    }

    void listClient()
    {
        vector<Client> clients = FilesHelper::getClients();
        for (const Client &client : clients)
        {
            client.display();
        }
    }

    void editClient(int id, const string &name, const string &password, double balance)
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
        FilesHelper::saveAllClients(clients);
    }
};

class AdminService : public Admin
{
public:
    AdminService(int id, const string &name, const string &password, double salary)
        : Admin(id, name, password, salary) {}

    void addEmployee(Employee &employee) { FilesHelper::saveEmployee(employee); }

    Employee *searchEmployee(int id)
    {
        static vector<Employee> employees;
        employees = FilesHelper::getEmployees();
        for (Employee &employee : employees)
        {
            if (employee.getId() == id)
            {
                return &employee;
            }
        }
        return nullptr;
    }

    void editEmployee(int id, const string &name, const string &password, double salary)
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
        FilesHelper::saveAllEmployees(employees);
    }

    void listEmployee()
    {
        vector<Employee> employees = FilesHelper::getEmployees();
        for (const Employee &employee : employees)
        {
            employee.display();
        }
    }
};

int main()
{
    try
    {
        // هذا الملف يركز على Phase 2: التخزين النصي + الـ Parser + عمليات الموظف والأدمن.
        FilesHelper::ensureFiles();

        EmployeeService employee(1, "Omar Salah", "emp12345", 8000);
        AdminService admin(2, "Mona Hasan", "admin123", 12000);

        Client client1(101, "Ali Ahmed", "ali12345", 2500);
        Client client2(102, "Sara Adel", "sara1234", 4000);
        employee.addClient(client1);
        employee.addClient(client2);

        Employee normalEmployee(201, "Khaled Omar", "staff123", 6500);
        admin.addEmployee(normalEmployee);

        cout << "Clients after saving:\n";
        employee.listClient();

        cout << "\nEmployees after saving:\n";
        admin.listEmployee();

        employee.editClient(101, "Ali Hassan", "ali67890", 3200);
        admin.editEmployee(201, "Khaled Adel", "staff678", 7000);

        cout << "\nAfter editing:\n";
        employee.listClient();
        admin.listEmployee();
    }
    catch (const exception &ex)
    {
        cout << "Error: " << ex.what() << "\n";
    }

    return 0;
}
