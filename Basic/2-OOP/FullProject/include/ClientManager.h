#pragma once

#include "Client.h"

class ClientManager {
public:
    static void printClientMenu();
    static void updatePassword(Person* person);
    static Client* login(int id, const std::string& password);
    static bool clientOptions(Client* client);
};
