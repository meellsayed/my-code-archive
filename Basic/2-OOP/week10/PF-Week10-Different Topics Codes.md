#include <iostream>
#include <string>
#include <exception>
using namespace std;

//====== Exception Handling =======
//============ Example 1 ===============

/*
class MyException : public exception{
public:
	const char* what() const throw()
	{
		return "Can not divide by zero";
	}
};

class MyException2 : public exception{
public:
	const char* what() const throw(){
		return "It is a negative value";
	}
};

int divide(int x, int y) {

	if (y == 0){
		// cout<<"y = 0" ;
		// return 0;
		// throw exception();

		throw MyException();
	}

	if (y < 0){
		throw MyException2();
	}

	return x / y;
}

int main() {
	int x, y;
	cout << "Enter 2 numbers to divide :" << endl;
	cin >> x >> y;

	try{
		cout << divide(x, y) << endl;
	}
	catch (exception& e){
		cout << e.what() << endl;
	}
}
*/

//======Operator Overloading=======
//============ Example 2 ===============

/*
class MyComplex {
private:
    //Attributes:
    double mReal, mImag;
public:
    //Constructors:
    MyComplex() {
        mReal = 0;
        mImag = 0;
    }
    MyComplex(double real, double imag) {
        mReal = real;
        mImag = imag;
    }

    //Setters:
    void setReal(double real) {
        mReal = real;
    }
    void setImag(double imag) {
        mImag = imag;
    }
    void setValue(double real, double imag) {
        mReal = real;
        mImag = imag;
    }

    //Getters:
    double getReal() {
        return mReal;
    }
    double getImag() {
        return mImag;
    }

    //Methods:
    //Unary Operator Overloading:
    //PreFix:
    MyComplex operator ++ () {
        double r = ++mReal;
        double i = ++mImag;
        return MyComplex(r, i);
    }
    MyComplex operator -- () {
        double r = --mReal;
        double i = --mImag;
        return MyComplex(r, i);
    }

    //PostFix:
    MyComplex operator ++ (int) {
        double r = mReal++;
        double i = mImag++;
        return MyComplex(r, i);
    }
    MyComplex operator -- (int) {
        double r = mReal--;
        double i = mImag--;
        return MyComplex(r, i);
    }
    bool operator == (MyComplex n) {
        if (mReal == n.mReal && mImag == n.mImag)
            return true;
        else
            return false;
    }
    //comparison
    bool operator ==(MyComplex n) {
	if (mReal == n.mReal && mImg == n.mImg)
		return true;
	else
		return false;
    }

    //Binary Operator Overloading:
    MyComplex operator + (MyComplex n) {
        double r = mReal + n.mReal;
        double i = mImag + n.mImag;
        return MyComplex(r, i);
    }
    MyComplex operator - (MyComplex n) {
        double r = mReal - n.mReal;
        double i = mImag - n.mImag;
        return MyComplex(r, i);
    }
    MyComplex operator += (MyComplex n) {
        mReal += n.mReal;
        mImag += n.mImag;
        return MyComplex(mReal, mImag);
    }
    MyComplex operator -= (MyComplex n) {
        mReal -= n.mReal;
        mImag -= n.mImag;
        return MyComplex(mReal, mImag);
    }
    
};

//== Main ==

int main() {
    MyComplex c1(10.1, 7.2);
    MyComplex c2(3, 5);

    cout << "c1 = (" << c1.getReal() << ", " << c1.getImag() << ")" << endl;
    cout << "c2 = (" << c2.getReal() << ", " << c2.getImag() << ")" << endl;

    MyComplex c3 = c1 + c2;
    cout << "c3 = c1 + c2, c3 = (" << c3.getReal() << ", " << c3.getImag() << ")" << endl;

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
*/

// ==============Templates==============
// ==============Example 3==============
// Create a Calculator Class with four 
// 			static methods :
// 	      (add, sub, mul, div) 
//     		using Templates.
// ======================================
template <class t>
class Calculator {
public:
	static t sum(t x, t y) {
		return x + y;
	}
	static t sub(t x, t y) {
		return x - y;
	}
	static t mul(t x, t y) {
		return x * y;
	}
	static t divide(t x, t y) {
		return x / y;
	}
};

int main() {
	cout << "Sum = " << Calculator <float>::sum(10, 3.5) << endl;
	cout << "Mul = " << Calculator <double>::mul(10, 7.5) << endl;
	cout << "Sub = " << Calculator <short>::sub(10, 5) << endl;
	cout << "divide = " << Calculator <int>::divide(10, 2) << endl;
}


// ==========Copy Constructor=========
// ==============Example 4==============
// Create a Student Class with four 
// attributes :
// name,id,subjects,grades*
// and create copy constructor for it.

// ======================================
#include <iostream>
#include <string>
using namespace std;

class Student {
public:
	//Attributes:
	string name;
	int id;
	int subjects;
	int* grades;
	//Constructors:
	Student() {
		this->id = 0;
		this->subjects = 0;
	}
	Student(string name,int id,int subjects) {
		this->name = name;
		this->id = id;
		this->subjects = subjects;
		this->grades = new int [subjects];
	}
	Student(Student& s) { //user def copy constructor
		this->name = s.name;
		this->id = s.id;
		this->subjects = s.subjects;
		this->grades = new int[subjects];
		for (int i = 0; i < subjects; i++) {
			this->grades[i] = s.grades[i];
		}
	}
	//Methods:
	void printInfo() {
		cout << "Name = " << name << endl;
		cout << "ID   = " << id << endl;
		cout << "Subj = " << subjects << endl;
		for (int i = 0; i < subjects; i++)
			cout << grades[i] << " ";
		cout << "\n===============\n";
	}
};

int main() {
	Student s1("Ahmed", 777, 3);
	s1.grades[0] = 8;
	s1.grades[1] = 9;
	s1.grades[2] = 10;

	//user def copy constructor
	Student s2 = s1; 

	s1.name = "Mostafa";
	s1.id = 999;
	s1.grades[0] = 55;

	s1.printInfo();
	s2.printInfo();
}

//===============================================
//Final and Friend
//==================
class Person {
public:
	virtual void sayHello() final{
		cout << "Hello i am person\n";
	}
};

class Student :public Person {
private:
	int grades;
	friend int addBounce(Student);

public:
	Student() {
		this->grades = 0;
	}

	//Can't override final function:
	//void sayHello() {
	//	cout << "Hello i am student\n";
	//}
};

// friend function definition
int addBounce(Student s) {
	//Accessing private members from the friend function
	s.grades += 5;
	return s.grades;
}

int main() {
	Student s1;
	//s1.sayHello();

	cout << "Grades After Bounce = " << addBounce(s1);
}


