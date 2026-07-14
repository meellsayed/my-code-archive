#include <algorithm>
#include <cctype>
#include <direct.h>
#include <fstream>
#include <iostream>
#include <limits>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

using namespace std;

class Validation {
public:
    static bool isValidName(const string& name) {
        if (name.size() < 5 || name.size() > 20) {
            return false;
        }
        return all_of(name.begin(), name.end(), [](unsigned char ch) {
            return isalpha(ch) || isspace(ch);
        });
    }

    static bool isValidPassword(const string& password) {
        return password.size() >= 8 && password.size() <= 20;
    }
};

class Person {
protected:
    int id;
    string name;
    string password;

public:
    Person() : id(0) {}
    Person(int id, const string& name, const string& password) : id(id), name(name), password(password) {}
    virtual ~Person() = default;

    int getId() const { return id; }
    string getName() const { return name; }
    string getPassword() const { return password; }
    void setPassword(const string& value) {
        if (!Validation::isValidPassword(value)) {
            throw invalid_argument("Invalid password.");
        }
        password = value;
    }

    virtual void display() const = 0;
};

class Client : public Person {
private:
    double balance;

public:
    Client() : balance(1500.0) {}
    Client(int id, const string& name, const string& password, double balance)
        : Person(id, name, password), balance(balance) {}

    double getBalance() const { return balance; }
    void setBalance(double value) { balance = value; }

    void deposit(double amount) { balance += amount; }
    void withdraw(double amount) {
        if (balance - amount < 1500) {
            throw runtime_error("Minimum balance is 1500.");
        }
        balance -= amount;
    }

    void display() const override {
        cout << "Client -> Id: " << id << ", Name: " << name << ", Balance: " << balance << "\n";
    }
};

class Employee : public Person {
protected:
    double salary;

public:
    Employee() : salary(5000.0) {}
    Employee(int id, const string& name, const string& password, double salary)
        : Person(id, name, password), salary(salary) {}

    double getSalary() const { return salary; }

    void display() const override {
        cout << "Employee -> Id: " << id << ", Name: " << name << ", Salary: " << salary << "\n";
    }
};

class Admin : public Employee {
public:
    Admin() = default;
    Admin(int id, const string& name, const string& password, double salary)
        : Employee(id, name, password, salary) {}

    void display() const override {
        cout << "Admin -> Id: " << id << ", Name: " << name << ", Salary: " << salary << "\n";
    }
};

class Store {
public:
    static string clientFile() { return "phase3_data/clients.txt"; }
    static string employeeFile() { return "phase3_data/employees.txt"; }
    static string adminFile() { return "phase3_data/admins.txt"; }

    static void ensure() {
        _mkdir("phase3_data");
        touch(clientFile());
        touch(employeeFile());
        touch(adminFile());
    }

    static vector<Client> clients() {
        ensure();
        return loadClients(clientFile());
    }

    static vector<Employee> employees() {
        ensure();
        vector<Employee> result;
        ifstream file(employeeFile());
        string line;
        while (getline(file, line)) {
            if (line.empty()) continue;
            vector<string> p = split(line);
            result.push_back(Employee(stoi(p[0]), p[1], p[2], stod(p[3])));
        }
        return result;
    }

    static vector<Admin> admins() {
        ensure();
        vector<Admin> result;
        ifstream file(adminFile());
        string line;
        while (getline(file, line)) {
            if (line.empty()) continue;
            vector<string> p = split(line);
            result.push_back(Admin(stoi(p[0]), p[1], p[2], stod(p[3])));
        }
        return result;
    }

    static void saveClients(const vector<Client>& data) {
        ensure();
        ofstream file(clientFile(), ios::trunc);
        for (const Client& c : data) {
            file << c.getId() << ';' << c.getName() << ';' << c.getPassword() << ';' << c.getBalance() << "\n";
        }
    }

    static void saveEmployees(const vector<Employee>& data) {
        ensure();
        ofstream file(employeeFile(), ios::trunc);
        for (const Employee& e : data) {
            file << e.getId() << ';' << e.getName() << ';' << e.getPassword() << ';' << e.getSalary() << "\n";
        }
    }

    static void saveAdmins(const vector<Admin>& data) {
        ensure();
        ofstream file(adminFile(), ios::trunc);
        for (const Admin& a : data) {
            file << a.getId() << ';' << a.getName() << ';' << a.getPassword() << ';' << a.getSalary() << "\n";
        }
    }

private:
    static void touch(const string& path) {
        ifstream test(path);
        if (!test.good()) {
            ofstream file(path);
        }
    }

    static vector<string> split(const string& line) {
        vector<string> result;
        string item;
        stringstream stream(line);
        while (getline(stream, item, ';')) {
            result.push_back(item);
        }
        return result;
    }

    static vector<Client> loadClients(const string& path) {
        vector<Client> result;
        ifstream file(path);
        string line;
        while (getline(file, line)) {
            if (line.empty()) continue;
            vector<string> p = split(line);
            result.push_back(Client(stoi(p[0]), p[1], p[2], stod(p[3])));
        }
        return result;
    }
};

int readInt(const string& message) {
    int value;
    while (true) {
        cout << message;
        if (cin >> value) return value;
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        cout << "Invalid number.\n";
    }
}

double readDouble(const string& message) {
    double value;
    while (true) {
        cout << message;
        if (cin >> value) return value;
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        cout << "Invalid amount.\n";
    }
}

string readLine(const string& message) {
    string value;
    cout << message;
    getline(cin >> ws, value);
    return value;
}

class ClientManager {
public:
    static Client* login(int id, const string& password, vector<Client>& clients) {
        for (Client& client : clients) {
            if (client.getId() == id && client.getPassword() == password) {
                return &client;
            }
        }
        return nullptr;
    }

    static void menu(Client& client, vector<Client>& clients) {
        while (true) {
            cout << "\n1. Info\n2. Balance\n3. Deposit\n4. Withdraw\n5. Logout\n";
            int choice = readInt("Choose: ");
            if (choice == 1) {
                client.display();
            } else if (choice == 2) {
                cout << "Balance = " << client.getBalance() << "\n";
            } else if (choice == 3) {
                client.deposit(readDouble("Deposit: "));
                Store::saveClients(clients);
            } else if (choice == 4) {
                client.withdraw(readDouble("Withdraw: "));
                Store::saveClients(clients);
            } else if (choice == 5) {
                return;
            }
        }
    }
};

class EmployeeManager {
public:
    static Employee* login(int id, const string& password, vector<Employee>& employees) {
        for (Employee& employee : employees) {
            if (employee.getId() == id && employee.getPassword() == password) {
                return &employee;
            }
        }
        return nullptr;
    }

    static void menu(Employee& employee) {
        while (true) {
            cout << "\n1. My Info\n2. Add Client\n3. List Clients\n4. Logout\n";
            int choice = readInt("Choose: ");
            if (choice == 1) {
                employee.display();
            } else if (choice == 2) {
                vector<Client> clients = Store::clients();
                int id = clients.empty() ? 1 : clients.back().getId() + 1;
                clients.push_back(Client(id, readLine("Name: "), readLine("Password: "), readDouble("Balance: ")));
                Store::saveClients(clients);
            } else if (choice == 3) {
                for (const Client& client : Store::clients()) {
                    client.display();
                }
            } else if (choice == 4) {
                return;
            }
        }
    }
};

class AdminManager {
public:
    static Admin* login(int id, const string& password, vector<Admin>& admins) {
        for (Admin& admin : admins) {
            if (admin.getId() == id && admin.getPassword() == password) {
                return &admin;
            }
        }
        return nullptr;
    }

    static void menu(Admin& admin) {
        while (true) {
            cout << "\n1. My Info\n2. Add Employee\n3. List Employees\n4. Logout\n";
            int choice = readInt("Choose: ");
            if (choice == 1) {
                admin.display();
            } else if (choice == 2) {
                vector<Employee> employees = Store::employees();
                int id = employees.empty() ? 1 : employees.back().getId() + 1;
                employees.push_back(Employee(id, readLine("Name: "), readLine("Password: "), readDouble("Salary: ")));
                Store::saveEmployees(employees);
            } else if (choice == 3) {
                for (const Employee& employee : Store::employees()) {
                    employee.display();
                }
            } else if (choice == 4) {
                return;
            }
        }
    }
};

void seedData() {
    Store::ensure();
    if (Store::admins().empty()) {
        vector<Admin> admins;
        admins.push_back(Admin(1, "Admin User", "admin123", 10000));
        Store::saveAdmins(admins);
    }
}

int main() {
    try {
        // هذا الملف يمثل Phase 3 بشكل مبسط: Managers + Screens + Login flow.
        seedData();

        cout << "Bank System - Phase 3 Demo\n";
        while (true) {
            cout << "\n1. Client\n2. Employee\n3. Admin\n4. Exit\n";
            int role = readInt("Login as: ");
            if (role == 4) {
                break;
            }

            int id = readInt("Id: ");
            string password = readLine("Password: ");

            if (role == 1) {
                vector<Client> clients = Store::clients();
                Client* client = ClientManager::login(id, password, clients);
                if (client) {
                    ClientManager::menu(*client, clients);
                } else {
                    cout << "Invalid client login.\n";
                }
            } else if (role == 2) {
                vector<Employee> employees = Store::employees();
                Employee* employee = EmployeeManager::login(id, password, employees);
                if (employee) {
                    EmployeeManager::menu(*employee);
                } else {
                    cout << "Invalid employee login.\n";
                }
            } else if (role == 3) {
                vector<Admin> admins = Store::admins();
                Admin* admin = AdminManager::login(id, password, admins);
                if (admin) {
                    AdminManager::menu(*admin);
                } else {
                    cout << "Invalid admin login.\n";
                }
            }
        }
    } catch (const exception& ex) {
        cout << "Error: " << ex.what() << "\n";
    }

    return 0;
}
