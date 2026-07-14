#include "Person.h"

#include <stdexcept>

#include "Validation.h"

Person::Person() : id(0), name(""), password("") {}

Person::Person(int id, const std::string& name, const std::string& password) : id(0) {
    setId(id);
    setName(name);
    setPassword(password);
}

void Person::setId(int newId) {
    if (newId <= 0) {
        throw std::invalid_argument("Id must be greater than zero.");
    }
    id = newId;
}

void Person::setName(const std::string& newName) {
    if (!Validation::isValidName(newName)) {
        throw std::invalid_argument("Name must be alphabetic and between 5 and 20 characters.");
    }
    name = newName;
}

void Person::setPassword(const std::string& newPassword) {
    if (!Validation::isValidPassword(newPassword)) {
        throw std::invalid_argument("Password must be between 8 and 20 characters.");
    }
    password = newPassword;
}

int Person::getId() const {
    return id;
}

const std::string& Person::get_Name() const {
    return name;
}

const std::string& Person::getPassword() const {
    return password;
}
