#pragma once

#include "Client.h"
#include "Person.h"

class Employee : public Person {
protected:
    double salary;

public:
    Employee();
    Employee(int id, const std::string& name, const std::string& password, double salary);

    void setSalary(double salary);
    double getSalary() const;

    void addClient(Client& client);
    Client* searchClient(int id);
    void listClient() const;
    void editClient(int id, const std::string& name, const std::string& password, double balance);

    void display() const override;
};
