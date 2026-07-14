#include <iostream>
#include <string>
#include <vector>
#include "Parser.h"
using namespace std;

int main()
{

    vector<string> v = Parser::split("medo#//# Elsayed #//#Ali\n");
    Parser::print_auto_vector(v);
}
