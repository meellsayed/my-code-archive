#include <iostream>
using namespace std;

/* ========= A- 2D ARRAY TASKS ========= */

// 1. Sum of main diagonal
void sumMainDiagonal()
{
    int a[3][3], sum = 0;
    cout << "Enter 3x3 matrix:\n";
    for (int i = 0; i < 3; i++)
        for (int j = 0; j < 3; j++)
        {
            cin >> a[i][j];
            if (i == j)
                sum += a[i][j];
        }
    cout << "Sum of main diagonal elements = " << sum << endl;
}

// 2. Add two matrices
void addMatrices()
{
    int a[3][3], b[3][3];
    cout << "Enter Matrix 1:\n";
    for (int i = 0; i < 3; i++)
        for (int j = 0; j < 3; j++)
            cin >> a[i][j];

    cout << "Enter Matrix 2:\n";
    for (int i = 0; i < 3; i++)
        for (int j = 0; j < 3; j++)
            cin >> b[i][j];

    cout << "Sum of both matrices:\n";
    for (int i = 0; i < 3; i++)
    {
        for (int j = 0; j < 3; j++)
            cout << a[i][j] + b[i][j] << " ";
        cout << endl;
    }
}

// 3. Row sum
void rowSum()
{
    int a[3][3];
    cout << "Enter 3x3 matrix:\n";
    for (int i = 0; i < 3; i++)
        for (int j = 0; j < 3; j++)
            cin >> a[i][j];

    for (int i = 0; i < 3; i++)
    {
        int sum = 0;
        for (int j = 0; j < 3; j++)
            sum += a[i][j];
        cout << "Sum of row " << i + 1 << " = " << sum << endl;
    }
}

// 4. Symmetric matrix
void checkSymmetric()
{
    int a[3][3];
    bool symmetric = true;

    cout << "Enter 3x3 matrix:\n";
    for (int i = 0; i < 3; i++)
        for (int j = 0; j < 3; j++)
            cin >> a[i][j];

    for (int i = 0; i < 3; i++)
        for (int j = 0; j < 3; j++)
            if (a[i][j] != a[j][i])
                symmetric = false;

    if (symmetric)
        cout << "The matrix is symmetric.\n";
    else
        cout << "The matrix is asymmetric.\n";
}

/* ========= B- FUNCTIONS ========= */

// 5. Print integer
void printInt(int x)
{
    cout << x << endl;
}

// 6. Average of three integers
float average(int a, int b, int c)
{
    return (a + b + c) / 3.0f;
}

// 7. Prime check
bool isPrime(int n)
{
    if (n <= 1)
        return false;
    for (int i = 2; i * i <= n; i++)
        if (n % i == 0)
            return false;
    return true;
}

// 8. Even check
bool isEven(int n)
{
    return n % 2 == 0;
}

// 9. Max and Min
void findMaxMin(int arr[], int size)
{
    int max = arr[0], min = arr[0];
    for (int i = 1; i < size; i++)
    {
        if (arr[i] > max)
            max = arr[i];
        if (arr[i] < min)
            min = arr[i];
    }
    cout << "Maximum: " << max << endl;
    cout << "Minimum: " << min << endl;
}

// 10. Cube
int cube(int n)
{
    return n * n * n;
}

// 11. Circle measurements
void circle(float r)
{
    const float PI = 3.1416;
    cout << "Diameter = " << 2 * r << " units\n";
    cout << "Circumference = " << 2 * PI * r << " units\n";
    cout << "Area = " << PI * r * r << " square units\n";
}

// 12. Divisors
void printDivisors(int n)
{
    for (int i = 1; i <= n; i++)
        if (n % i == 0)
            cout << i << " ";
    cout << endl;
}

// 13. Divisible by 3 and 4
bool divisibleBy3And4(int n)
{
    return (n % 3 == 0 && n % 4 == 0);
}

/* ========= MAIN ========= */

int main()
{
    int choice;
    cout << "Choose task (1 - 13): ";
    cin >> choice;

    if (choice == 1)
        sumMainDiagonal();
    else if (choice == 2)
        addMatrices();
    else if (choice == 3)
        rowSum();
    else if (choice == 4)
        checkSymmetric();
    else if (choice == 5)
    {
        int x;
        cin >> x;
        printInt(x);
    }
    else if (choice == 6)
    {
        int a, b, c;
        cin >> a >> b >> c;
        cout << average(a, b, c) << endl;
    }
    else if (choice == 7)
    {
        int n;
        cin >> n;
        cout << (isPrime(n) ? "true" : "false") << endl;
    }
    else if (choice == 8)
    {
        int n;
        cin >> n;
        cout << (isEven(n) ? "true" : "false") << endl;
    }
    else if (choice == 9)
    {
        int n;
        cin >> n;
        int arr[n];
        for (int i = 0; i < n; i++)
            cin >> arr[i];
        findMaxMin(arr, n);
    }
    else if (choice == 10)
    {
        int n;
        cin >> n;
        cout << "Cube of " << n << " = " << cube(n) << endl;
    }
    else if (choice == 11)
    {
        float r;
        cin >> r;
        circle(r);
    }
    else if (choice == 12)
    {
        int n;
        cin >> n;
        printDivisors(n);
    }
    else if (choice == 13)
    {
        int n;
        cin >> n;
        cout << (divisibleBy3And4(n) ? "true" : "false") << endl;
    }

    return 0;
}
