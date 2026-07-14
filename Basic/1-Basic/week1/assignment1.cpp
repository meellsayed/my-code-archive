#include <iostream>
#include <string>
using namespace std;

int main()
{
    //====================   3   ==================//
    // int x{}, y{}, z{};
    // cout << "Please enter the first number: ";
    // cin >> x;
    // cout << "Please enter the second number: ";
    // cin >> y;
    // cout << "Please enter the third number: ";
    //     cin >> z;
    //     float t = (x + y + z) / 3.0;
    //     cout << "\nThe average is: " << t;
    //==================================================//

    /*====================   5   =======================//
    Write a program that calculates the sum of the digits of a three-digit number.
    The user should enter a single three-digit number,
    and the program should compute the sum of its digits.

    Example: Input: Enter a three-digit number: 132
    Output: The sum of the digits is: 6

    Example: Input: Enter a three-digit number: 451
    Output: The sum of the digits is: 10
    */
    // string x{};
    //     cout << "Enter a three-digit number : ";
    //     cin >> x;
    //     int res{};
    //     for (int i = 0; i < x.length(); i++)
    //     {
    //         res += x[i] - '0';
    //     }
    //     cout << res;

    /*====================   6   =======================//
    6. Write a program that converts a given integer (representing seconds) into hours, minutes, and seconds.
    Example:
    Input: Enter the time in seconds: 25300
    Output: The equivalent time is:
    7 hours, 1 minute, and 40 seconds
    */
    cout << "Enter the time in seconds: ";
    int sec=0;
    cin >> sec;
    int hours = sec / 3600;
    int remainder = sec % 3600;
    int minutes = remainder / 60;
    int seconds = remainder % 60;
    cout << "The equivalent time is:\n";
    cout << hours << " hours, "
         << minutes << " minute, and "
         << seconds << " seconds";




    
}
