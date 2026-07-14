#pragma once
#include <vector>
#include <iostream>
#include <string>
#include <cstdlib>
#include <string>


#include "Validation.h"
using namespace std;

class Person
{
protected:
    int id;
    string name;
    string password;

public:
    Person() { id = 0; }
    Person(const int &id, const string &password, const string &name)
    {
        setId(id);
        setName(name);
        setPassword(password);
    }

    void setPassword(const string &password)
    {
        if (!Validation::is_valid_password(password))
            throw invalid_argument("Invalid password.");
        this->password = password;
    }

    void setName(const string &name)
    {
        if (!Validation::is_valid_name(name))
            throw invalid_argument("Invalid name.");

        this->name = name;
    }

    void setId(const int &id)
    {
        if (id <= 0)
        {
            throw invalid_argument("Id must be greater than zero.");
        }
        this->id = id;
    }

    int getId() const { return id; }
    string getPassword() const { return password; }
    string getName() const { return name; }

    // Method
    virtual void display() const = 0;
    virtual ~Person() = default;
};
