#include "Client.h"

#include <iomanip>
#include <iostream>
#include <stdexcept>

#include "Validation.h"

Client::Client() : Person(), balance(1500.0) {}

Client::Client(int id, const std::string& name, const std::string& password, double balance)
    : Person(id, name, password), balance(1500.0) {
    setBalance(balance);
}

void Client::setBalance(double newBalance) {
    if (!Validation::isValidBalance(newBalance)) {
        throw std::invalid_argument("Balance must be at least 1500.");
    }
    balance = newBalance;
}

double Client::getBalance() const {
    return balance;
}

void Client::deposit(double amount) {
    if (!Validation::isPositiveAmount(amount)) {
        throw std::invalid_argument("Deposit amount must be positive.");
    }
    balance += amount;
}

void Client::withdraw(double amount) {
    if (!Validation::isPositiveAmount(amount)) {
        throw std::invalid_argument("Withdraw amount must be positive.");
    }
    if (balance - amount < 1500.0) {
        throw std::runtime_error("Cannot withdraw because minimum balance is 1500.");
    }
    balance -= amount;
}

void Client::transferTo(double amount, Client& recipient) {
    withdraw(amount);
    recipient.deposit(amount);
}

void Client::checkBalance() const {
    std::cout << "Current balance: " << std::fixed << std::setprecision(2) << balance << '\n';
}

void Client::display() const {
    std::cout << "Client Information\n";
    std::cout << "Id      : " << id << '\n';
    std::cout << "Name    : " << name << '\n';
    std::cout << "Balance : " << std::fixed << std::setprecision(2) << balance << '\n';
}
