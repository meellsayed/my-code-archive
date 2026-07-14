#pragma once

#include <string>
#include <vector>

#include "Admin.h"
#include "Client.h"
#include "Employee.h"

class Parser {
public:
    static std::vector<std::string> split(const std::string& line);
    static Client parseToClient(const std::string& line);
    static Employee parseToEmployee(const std::string& line);
    static Admin parseToAdmin(const std::string& line);
};
