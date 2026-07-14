#pragma once

#include <string>

class Person {
protected:
    int id;
    std::string name;
    std::string password;

public:
    Person();
    Person(int id, const std::string& name, const std::string& password);
    virtual ~Person() = default;

    void setId(int id);
    void setName(const std::string& name);
    void setPassword(const std::string& password);

    int getId() const;
    const std::string& getName() const;
    const std::string& getPassword() const;

    virtual void display() const = 0;
};
