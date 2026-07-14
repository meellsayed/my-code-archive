#pragma once

#include <string>
#include <vector>

#include "Admin.h"
#include "Client.h"
#include "Employee.h"

using namespace std;

class Parser
{
public:
    static vector<string> split(const string &line, const string &sp = "#//#")
    {
        vector<string> result;

        size_t pos = 0;
        size_t start = 0;

        while ((pos = line.find(sp, start)) != string::npos)
        {
            result.push_back(line.substr(start, pos - start));
            start = pos + sp.length();
        }

        result.push_back(line.substr(start));
        return result;
    }

    static Client parseToClient(const string &line)
    {
        vector<string> data = split(line);
        return Client(stoi(data[0]), data[1], data[2], stod(data[3]));
    }

    static Employee parseToEmployee(const string &line)
    {
        vector<string> data = split(line);
        return Employee(stoi(data[0]), data[1], data[2], stod(data[3]));
    }

    static Admin parseToAdmin(const string &line)
    {
        vector<string> data = split(line);
        return Admin(stoi(data[0]), data[1], data[2], stod(data[3]));
    }
};
