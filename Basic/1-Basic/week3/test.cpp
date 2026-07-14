#include <iostream>
#include <string>
using namespace std;

int maxOfArr(int arr[5])
{
    int max = arr[0];
    for (int i = 1; i < 5; i++)
    {
        if (max < arr[i])
            max = arr[i];
    }
    return max;
}

int main()
{
    /*=========     EX:3    ========
    Write a program that Take from
    user width and height from user
    then print empty rectangle    */
    // int w{}, h{};
    // cout << "width and height is : ";
    // cin >> w >> h;
    // // w = 6
    // // h = 4
    // /*
    //  ******
    //  *    *
    //  *    *
    //  ******
    //  */
    // h = INT_MAX;
    // for (int i{}; i < h; i++)
    // {
    //     for (int j{}; j < w; j++)
    //     {
    //         if (i == 0 || i == h - 1 || j == 0 || j == w - 1)
    //             cout << "*";
    //         else
    //             cout << " ";
    //     }
    //     cout << endl;
    // }
    // cout << "Please enter // length : ";
    // int x;
    // cin >> x;
    // for (int i = 1; i <= x; ++i)
    // {
    //     for (int m = x; m > i; m--)
    //         cout << " ";
    //     for (int j = 1; j <= 2*i; ++j)
    //         cout << "*";
    //     cout << endl;
    // }

    //=================================  array  ==============================
    int arr[5]{};

    for (int i = 0; i < 5; i++)
    {
        cin >> arr[i];
    }

    cout << "max of array = " << maxOfArr(arr) << endl;

    // int sum{};
    //  for (int i = 0; i < size(arr); i++)
    //  {
    //      if (arr[i] < 0)
    //          arr[i] = 0;
    //      cout << arr[i] << " ,";
    //  }
}
