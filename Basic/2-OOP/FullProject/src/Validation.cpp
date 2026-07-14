#include "Validation.h"

#include <algorithm>
#include <cctype>

bool Validation::isValidName(const std::string& name) {
    if (name.size() < 5 || name.size() > 20) {
        return false;
    }

    return std::all_of(name.begin(), name.end(), [](unsigned char ch) {
        return std::isalpha(ch) || std::isspace(ch);
    });
}

bool Validation::isValidPassword(const std::string& password) {
    return password.size() >= 8 && password.size() <= 20;
}

bool Validation::isValidBalance(double balance) {
    return balance >= 1500.0;
}

bool Validation::isValidSalary(double salary) {
    return salary >= 5000.0;
}

bool Validation::isPositiveAmount(double amount) {
    return amount > 0.0;
}
