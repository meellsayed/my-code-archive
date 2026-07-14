#include <iostream>
#include <string>
using namespace std;

class Payment_method
{
protected:
    string account_number;
    string transaction_history[5];
    double transaction_limit = 10000.0;
    string currency;

public:
    Payment_method(string account_number, string currency)
        : account_number(account_number), currency(currency) {}

    virtual void pay(double amount) = 0;

    virtual bool validate_payment_details()
    {
        return true;
    }

    virtual double calculate_transaction_fee(double amount)
    {
        return amount * 0.02; // 2% default fee
    }

    void add_transaction(string transaction)
    {
        // Shift elements right, add new at beginning
        for (int i = 4; i > 0; i--)
            transaction_history[i] = transaction_history[i - 1];
        transaction_history[0] = transaction;
    }

    void print_transaction_history()
    {
        cout << "Transaction History:" << endl;
        for (int i = 0; i < 5; i++)
            if (!transaction_history[i].empty())
                cout << i + 1 << ": " << transaction_history[i] << endl;
    }

    virtual ~Payment_method() {}
};

// ─────────────────────────────────────────
class Credit_card : public Payment_method
{
private:
    string cvv;

public:
    Credit_card(string account_number, string currency, string cvv)
        : Payment_method(account_number, currency), cvv(cvv) {}

    void pay(double amount) override
    {
        cout << "processing payment using a credit card" << endl;
        add_transaction("Credit card Payment: " + to_string(amount));
    }

    double calculate_transaction_fee(double amount) override
    {
        return amount * 0.03; // 3%
    }

    bool validate_payment_details() override
    {
        if (cvv.length() == 3)
            return true;
        cout << "Invalid CVV" << endl;
        return false;
    }
};

// ─────────────────────────────────────────
class Debit_card : public Payment_method
{
private:
    string pin;

public:
    Debit_card(string account_number, string currency, string pin)
        : Payment_method(account_number, currency), pin(pin) {}

    void pay(double amount) override
    {
        cout << "processing payment using a debit card" << endl;
        add_transaction("Debit card Payment: " + to_string(amount));
    }

    double calculate_transaction_fee(double amount) override
    {
        return amount * 0.01; // 1%
    }

    bool validate_payment_details() override
    {
        if (pin.length() == 4)
            return true;
        cout << "Invalid PIN" << endl;
        return false;
    }
};

// ─────────────────────────────────────────
int main()
{
    Credit_card cc("ACC-001", "USD", "123");
    Debit_card dc("ACC-002", "USD", "4567");

    // Test Credit Card
    cout << "=== Credit Card ===" << endl;
    if (cc.validate_payment_details())
    {
        cc.pay(500.0);
        cc.pay(200.0);
        cout << "Fee: " << cc.calculate_transaction_fee(500.0) << endl;
        cc.print_transaction_history();
    }

    cout << endl;

    // Test Debit Card
    cout << "=== Debit Card ===" << endl;
    if (dc.validate_payment_details())
    {
        dc.pay(300.0);
        cout << "Fee: " << dc.calculate_transaction_fee(300.0) << endl;
        dc.print_transaction_history();
    }

    cout << endl;

    // Test invalid CVV
    cout << "=== Invalid CVV Test ===" << endl;
    Credit_card cc2("ACC-003", "USD", "12"); // CVV length != 3
    cc2.validate_payment_details();

    // Test invalid PIN
    cout << "=== Invalid PIN Test ===" << endl;
    Debit_card dc2("ACC-004", "USD", "123"); // PIN length != 4
    dc2.validate_payment_details();

    return 0;
}