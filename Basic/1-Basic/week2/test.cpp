#include <iostream>
#include <string>
using namespace std;

int main()
{
    int x{};
    cin >> x;

    string S1{};

    int n{};

    // for (; x > 0;)
    // {
    //     S1 += to_string(x % 10);
    //     x /= 10;
    // }
    // cout << S1;

    for (; x > INT_MIN;)
    {
        n = (n * 10) + x % 10;
        x /= 10;
    }
    cout << n;
}
