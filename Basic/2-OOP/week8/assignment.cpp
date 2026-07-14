#include <iostream>
#include <string>
using namespace std;

class Circle
{
protected:
    double radius;
    string color;

public:
    // constractor
    Circle()
    {
        this->radius = 1.0;
        this->color = "red";
    }
    Circle(double radius)
    {
        this->radius = radius;
        this->color = "red";
    }
    Circle(double radius, string color)
    {
        this->radius = radius;
        this->color = color;
    }

    // Seters
    void setRadius(double radius)
    {
        this->radius = radius;
    }
    void setColor(string color)
    {
        this->color = color;
    }

    // Geters
    double getRadius()
    {
        return this->radius;
    }
    string getColor()
    {
        return this->color;
    }

    // Methods
    double get_area()
    {
        return this->radius * 3.14 * radius;
    }
    void displayInfo()
    {
        cout << "area = " << get_area() << endl;
    }
    ~Circle()
    {
        cout << "\nBay\n\a";
    }
};

class Cylinder : public Circle
{
private:
    double height;

public:
    Cylinder()
    {
        this->height = 1.0;
    };
    Cylinder(double radius) : Circle(radius)
    {
        this->height = 1.0;
    }
    Cylinder(double radius, double height) : Circle(radius)
    {
        this->height = height;
    }
    Cylinder(double radius, double height, string color) : Circle(radius, color)
    {
        this->height = height;
    }
    double getHeight()
    {
        return this->height;
    }
    void setHeight(double height)
    {
        this->height = height;
    }

    double get_volume()
    {
        // الحجم = مساحة القاعده * الارتفاع
        return get_area() * this->height;
    }
    void displayInfo()
    {
        Circle::displayInfo();
        cout << "Volume = " << get_volume() << endl;
        cout << "color  = " << getColor() << endl;
    }
    ~Cylinder() {

    };
};

//================================================

class Customer
{
protected:
    int id, discount;
    string name;

public:
    Customer();
    Customer(int id, string name, int discount)
    {
        this->id = id;
        this->name = name;
        this->discount = discount;
    }

    // Geters
    int get_id()
    {
        return id;
    }
    string get_name()
    {
        return name;
    }
    int get_discount()
    {
        return discount;
    }

    // Siters
    void set_discount(int discount)
    {
        this->discount = discount;
    }

    void display_info()
    {
        cout << "id   = " << id;
        cout << "\nname = " << name;
        cout << "\ndis  =" << discount;
    }
};

class Invoice
{
    int id, amount;
    Customer customer;

public:
    Invoice(int id, Customer customer, int amount)
    {
        this->id = id;
        this->amount = amount;
    }
    int get_id()
    {
        return id;
    }

    int getAmountAfterDis()
    {
        return amount - (customer.get_discount() / 100) * amount;
    }

    void displayInfo()
    {
        cout << "inv id     = " << id << endl;
        cout << "inv amount = " << amount << endl;
        cout << "inv amount after dis = " << getAmountAfterDis();
        customer.display_info();
    }
};

int main()
{
    Customer c (111, "medo", 10);
    Invoice i(222, c, 1000);
    i.displayInfo();
}
