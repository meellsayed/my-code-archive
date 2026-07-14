#include <iostream>
using namespace std;

class Animal
{
public:
    virtual void speak() = 0; // Abstract
};


class Dog : public Animal
{
public:
    void speak() override { cout << "Woof! 🐕\n"; }
};


class Cat : public Animal
{
public:
    void speak() { cout << "Meow! 🐈\n"; }
};




// ✅ شغالة مع أي Animal (Dog, Cat, أي حاجة جديدة)
void makeItSpeak(Animal *animal)
{                    // ← Pointer هنا!
    animal->speak(); // ← سهم هنا!
}

int main()
{
    Dog dog;
    Cat cat;

    // & = خد العنوان
    makeItSpeak(&dog); // Output: Woof! 🐕
    makeItSpeak(&cat); // Output: Meow! 🐈

    // لو عندك array من pointers:
    Animal *zoo[] = {&dog, &cat};
    for (Animal *a : zoo)
    {
        a->speak(); // نفس الكود، نتائج مختلفة!
    }
}