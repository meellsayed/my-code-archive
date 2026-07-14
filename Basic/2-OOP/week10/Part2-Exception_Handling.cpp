#include <iostream>
#include <string>
using namespace std;

class MyException : public exception
{
public:
    const char *what() const throw()
    {
        return "Can not divide by zero";
    }
};

class MyException2 : public exception
{
public:
    const char *what() const throw()
    {
        return "It is a negative value";
    }
};

int divide(int x, int y)
{

    if (y == 0)
    {
        // cout<<"y = 0" ;
        // return 0;
        // throw exception();
        throw MyException();
    }

    if (y < 0)
    {
        throw MyException2();
    }

    return x / y;
}

int main()
{
    int x, y;
    cout << "Enter 2 numbers to divide :" << endl;
    cin >> x >> y;

    try
    {
        cout << divide(x, y) << endl;
    }
    catch (exception &e)
    {
        cout << e.what() << endl;
    }

    cin >> ws;
}
