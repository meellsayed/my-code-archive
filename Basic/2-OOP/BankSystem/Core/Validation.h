#pragma once
#include <vector>
#include <iostream>
#include <string>
#include <cstdlib>
#include <string>
using namespace std;
class Validation
{
public:
    static bool is_valid_name(const string &name)
    {
        if (name.size() >= 5 && name.size() <= 20)
        {
            for (char c : name)
            {
                if (!isalpha(c))
                    return false;
            }
            return true;
        }
        return false;
    }
    static bool is_valid_password(const string &password)
    {
        if (password.size() >= 8 && password.size() <= 20)
            return true;
        return false;
    }
    static bool is_valid_balance(double balance)
    {
        if (balance >= 1500)
            return true;
        return false;
    }
    static bool is_valid_salary(double salary)
    {
        if (salary >= 5000)
            return true;
        return false;
    }
};
