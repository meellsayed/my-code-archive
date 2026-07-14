#pragma once
#include <vector>
#include <iostream>
#include <string>
#include <cstdlib>
#include <string>

#include "Validation.h"
#include "Person.h"

using namespace std;
class Client : public Person
{
private:
    double balance;

public:
    Client(const int &id, const string &password, const string &name, const double &balance)
        : Person(id, password, name)
    {
        setBalance(balance);
    }

    void setBalance(const double &balance)
    {
        if (!Validation::is_valid_balance(balance))
            throw invalid_argument("Balance mast be at least 1500.");

        this->balance = balance;
    }

    double getBalance() const
    {
        return balance;
    }

    // i will add fee ان شاء الله تعالى
    void deposit(const double &amount)
    {
        if (amount <= 0)
            throw invalid_argument("Deposit must be positive.");
        balance += amount;
    }
    void withdraw(const double &amount)
    {
        if (amount <= 0)
        {
            throw invalid_argument("Withdraw must be positive.");
        }

        if (balance - amount < 1500.0)
        {
            throw runtime_error("Minimum balance is 1500.");
        }
        balance -= amount;
    }
    void transferTo(const double &amount, Client &client)
    {

        withdraw(amount);
        client.deposit(amount);
    }

    void checkBalance()
    {
        cout << "Balance = " << balance << "\n";
    }

    // Display
    void display() const override
    {
        cout << "Client -> Id: " << id << ", Name: " << name
             << ", Balance: " << balance << "\n";
    }
};
