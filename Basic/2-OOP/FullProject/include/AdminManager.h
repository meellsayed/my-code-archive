#pragma once

#include "Admin.h"

class AdminManager {
public:
    static void printAdminMenu();
    static Admin* login(int id, const std::string& password);
    static bool adminOptions(Admin* admin);
};
