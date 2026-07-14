#include <iostream>
using namespace std;

int main()
{
    int x=0, y=0;
    cout << "Please enter the x , y numbers: ";
    cin >> x >> y;
    switch (x > y)
    {
    case 0:
        cout << "max = y";
        break;
    case 1:
        cout << "max = x";
        break;
    }

    // for (; x > 0;)
    // {
    //     n += x % 10;
    //     x /= 10;
    // }
    // cout << n;
}
