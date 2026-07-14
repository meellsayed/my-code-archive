#include "Parser.h"

#include <sstream>
#include <stdexcept>

std::vector<std::string> Parser::split(const std::string& line) {
    std::vector<std::string> parts;
    std::stringstream stream(line);
    std::string item;

    while (std::getline(stream, item, ';')) {
        parts.push_back(item);
    }

    return parts;
}

Client Parser::parseToClient(const std::string& line) {
    const auto parts = split(line);
    if (parts.size() != 4) {
        throw std::runtime_error("Invalid client line format.");
    }

    return Client(std::stoi(parts[0]), parts[1], parts[2], std::stod(parts[3]));
}

Employee Parser::parseToEmployee(const std::string& line) {
    const auto parts = split(line);
    if (parts.size() != 4) {
        throw std::runtime_error("Invalid employee line format.");
    }

    return Employee(std::stoi(parts[0]), parts[1], parts[2], std::stod(parts[3]));
}

Admin Parser::parseToAdmin(const std::string& line) {
    const auto parts = split(line);
    if (parts.size() != 4) {
        throw std::runtime_error("Invalid admin line format.");
    }

    return Admin(std::stoi(parts[0]), parts[1], parts[2], std::stod(parts[3]));
}
