#pragma once
#include <iostream>
#include <string>
using namespace std;

class Circle
{
private:
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
        return this->radius * 3.14;
    }
};