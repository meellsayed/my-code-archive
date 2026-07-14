#include <iostream>
#include <string>
using namespace std;

class Rectangle
{
private:
    float height;
    float width;

public:
    // Constructors
    Rectangle()
    {
        width = 0;
        height = 0;
    }
    Rectangle(float h, float w)
    {
        height = h;
        width = w;
    }

    // Setters
    void setWidth(float x)
    {
        width = x;
    }
    void setHeight(float x)
    {
        height = x;
    }

    // Getters
    float getHeight()
    {
        return height;
    }
    float getWidth()
    {
        return width;
    }
    float calArea()
    {
        return width * height;
    }

    // Destructor
    ~Rectangle()
    {
        cout << "bye bye Rectangle" << endl;
    }
};

int main()
{
    Rectangle r1;
    cout << "Enter Rectangle height : " << endl;
    float x;
    cin >> x;
    r1.setHeight(x);

    cout << "Enter Rectangle Width : " << endl;
    float y;
    cin >> y;
    r1.setWidth(y);

    cout << "Rectangle 1 Area =   " << endl;
    cout << r1.calArea() << endl;

    Rectangle r2(10, 20);
    cout << "Rectangle 2 Area =   " << endl;
    cout << r2.calArea() << endl;

    return 0;
}

//=========================================