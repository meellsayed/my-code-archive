#include <iostream>
#include <string>
using namespace std;

class payment_method
{
protected:
    string account_number;
    string transaction_history[5];
    double transaction_limt = 10000;
    string currency;

public:
    payment_method(string account_number, string currency)
    {
        this->account_number = account_number;
        this->currency = currency;
    }

    virtual void pay(double amount) = 0;
    virtual bool validate_payment_details() = 0;
    virtual double calculate_transaction_fee(double amount)
    {
        return amount * 0.02;
    }
    void add_transaction(string transaction)
    {
        for (int i = 4; i > 0; i--)
            transaction_history[i] = transaction_history[i - 1];
        transaction_history[0] = transaction;
    }

    void print()
    {
        cout << "Transaction History:" << endl;
        for (int i = 0; i < 5; i++)
            if (!transaction_history[i].empty())
                cout << i + 1 << ": " << transaction_history[i] << endl;
    }

    virtual ~payment_method() {}
    //
};

class credit_card : public payment_method
{
protected:
    string cvv;

public:
    credit_card(string account_number, string currency, string cvv)
        : payment_method(account_number, currency), cvv(cvv) {}

    void pay(double amount) override
    {
        cout << "processing payment using a credit card " << endl;
        add_transaction("Credit card Payment: " + to_string(amount));
    }

    double calculate_transaction_fee(double amount) override
    {
        return amount * 0.03;
    }
    bool validate_payment_details() override
    {
        if (cvv.length() == 3)
            return true;
        cout << "Invalid CVV" << endl;
        return false;
    }
};

class debit_card : public payment_method
{
protected:
    string pin;

public:
    debit_card(string account_number, string currency, string pin)
        : payment_method(account_number, currency), pin(pin) {};
    void pay(double amount) override
    {
        cout << "processing payment using a Debit card " << endl;
        add_transaction("Debit card Payment: " + to_string(amount));
    }
    double calculate_transaction_fee(double amount) override
    {
        return amount * 0.01;
    }
    bool validate_payment_details() override
    {
        if (pin.length() == 4)
            return true;
        cout << "Invalid PIN" << endl;
        return false;
    }
};

int main()
{

    
    credit_card a("credit 2", "EG", "12333");

    cout << "fees = " << a.calculate_transaction_fee(100) << endl;
    a.pay(400);
    a.pay(400);
    a.pay(1400);
    a.add_transaction("ali 1000");
    a.validate_payment_details();
    a.print();
}