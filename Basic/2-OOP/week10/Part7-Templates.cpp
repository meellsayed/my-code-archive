#include <iostream>
#include <string>
using namespace std;

template <typename t>
// template <class t>

class Calc
{
public:
    static t sum(t x, t y) { return x + y; }
    static t sub(t x, t y) { return x - y; }
    static t mul(t x, t y) { return x * y; }
    static t dev(t x, t y) { return x / y; }
};

int main()
{
    cout << Calc<string>::sum("medo ", "elsayed") << endl;
    cout << Calc<int>::sum(20, 10) << endl;
    cout << Calc<float>::sum(18, 12.5) << endl;
    cout << Calc<long long>::sum(12, 33);
}
