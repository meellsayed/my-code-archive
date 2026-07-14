#include <exception>
#include <iostream>

#include "Screens.h"

int main() {
    try {
        Screens::runApp();
    } catch (const std::exception& ex) {
        std::cout << "Application error: " << ex.what() << '\n';
    }

    return 0;
}
