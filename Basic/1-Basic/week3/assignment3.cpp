#include <iostream>
#include <string>
using namespace std;

void _12(int arr[8])
{
    /*12. Find Unique Elements in an Array
    Write a program to input elements into an array from the user and print all unique elements
    (elements that appear only once).
    Example: - Input array: 1 2 3 5 1 5 20 2 12 10 -
    Output: All unique elements in the array are: 3 20 12 10*/

    for (int i{}; i < 8; i++)
    {
        int count = 0;
        for (int j = 0; j < 8; j++)
        {
            if (arr[i] == arr[j])
            {
                count++;
            }
        }
        if (count == 1)
        {
            cout << arr[i] << " ";
        }
    }
}

int main()
{
    int arr[8]{};

    for (int i = 0; i < 8; i++)
    {
        cin >> arr[i];
    }
    _12(arr);
}
