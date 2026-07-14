#include <iostream>
#include <string>
using namespace std;

class MyComplex
{
private:
    // Attributes:
    double mReal, mImag;

public:
    // Constructors:
    MyComplex()
    {
        mReal = 0;
        mImag = 0;
    }
    MyComplex(double real, double imag)
    {
        mReal = real;
        mImag = imag;
    }

    // Setters:
    void setReal(double real)
    {
        mReal = real;
    }
    void setImag(double imag)
    {
        mImag = imag;
    }
    void setValue(double real, double imag)
    {
        mReal = real;
        mImag = imag;
    }

    // Getters:
    double getReal()
    {
        return mReal;
    }
    double getImag()
    {
        return mImag;
    }

    // Methods:
    // Unary Operator Overloading:
    // PreFix:
    MyComplex operator++()
    {
        double r = ++mReal;
        double i = ++mImag;
        return MyComplex(r, i);
    }
    MyComplex operator--()
    {
        double r = --mReal;
        double i = --mImag;
        return MyComplex(r, i);
    }

    // PostFix:
    MyComplex operator++(int)
    {
        double r = mReal++;
        double i = mImag++;
        return MyComplex(r, i);
    }
    MyComplex operator--(int)
    {
        double r = mReal--;
        double i = mImag--;
        return MyComplex(r, i);
    }
    bool operator==(MyComplex n)
    {
        if (mReal == n.mReal && mImag == n.mImag)
            return true;
        else
            return false;
    }
    // comparison
    
    // Binary Operator Overloading:
    MyComplex operator+(MyComplex n)
    {
        double r = mReal + n.mReal;
        double i = mImag + n.mImag;
        return MyComplex(r, i);
    }
    MyComplex operator-(MyComplex n)
    {
        double r = mReal - n.mReal;
        double i = mImag - n.mImag;
        return MyComplex(r, i);
    }
    MyComplex operator+=(MyComplex n)
    {
        mReal += n.mReal;
        mImag += n.mImag;
        return MyComplex(mReal, mImag);
    }
    MyComplex operator-=(MyComplex n)
    {
        mReal -= n.mReal;
        mImag -= n.mImag;
        return MyComplex(mReal, mImag);
    }
};

//== Main ==

int main()
{
    MyComplex c1(10.1, 7.2);
    MyComplex c2(3, 5);

    // cout << "c1 = (" << c1.getReal() << ", " << c1.getImag() << ")" << endl;
    // cout << "c2 = (" << c2.getReal() << ", " << c2.getImag() << ")" << endl;

    MyComplex c3 = c1 + c2;
    cout << "c3 = c1 + c2 || c3 = (" << c3.getReal() << ", " << c3.getImag() << ")" << endl;

    c3--;
    cout << "c3--, c3 = (" << c3.getReal() << ", " << c3.getImag() << ")" << endl;

    MyComplex c4 = c1 - c2;
    cout << "c4 = c1 - c2, c4 = (" << c4.getReal() << ", " << c4.getImag() << ")" << endl;

    ++c4;
    cout << "++c4, c4 = (" << c4.getReal() << ", " << c4.getImag() << ")" << endl;

    c4 += c3;
    cout << "c4 += c3, c4 = (" << c4.getReal() << ", " << c4.getImag() << ")" << endl;

    if (c4 == c3)
        cout << "Ok, c4 == c3 " << endl;
    else
        cout << "No, C4 != c3" << endl;
}