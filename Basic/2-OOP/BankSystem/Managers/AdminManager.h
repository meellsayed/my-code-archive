#pragma once

#include <string>

#include "Admin.h"

using namespace std;

class AdminManager
{
public:
    static void printClientMenu();
    static Admin *login(int id, string password);
    static bool AdminOptions(Admin *admin);
};
