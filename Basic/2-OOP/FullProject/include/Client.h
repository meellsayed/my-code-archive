#pragma once

#include "Person.h"

class Client : public Person {
private:
    double balance;

public:
    Client();
    Client(int id, const std::string& name, const std::string& password, double balance);

    void setBalance(double balance);
    double getBalance() const;

    void deposit(double amount);
    void withdraw(double amount);
    void transferTo(double amount, Client& recipient);
    void checkBalance() const;
    void display() const override;
};
