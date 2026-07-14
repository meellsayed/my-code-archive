#pragma once

#include <string>

class Validation {
public:
    static bool isValidName(const std::string& name);
    static bool isValidPassword(const std::string& password);
    static bool isValidBalance(double balance);
    static bool isValidSalary(double salary);
    static bool isPositiveAmount(double amount);
};
