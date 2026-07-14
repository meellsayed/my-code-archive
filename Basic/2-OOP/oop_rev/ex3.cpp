// Exercise 3: Bank Account System (Abstract Class + Multiple Inheritance)
#include <iostream>
#include <cmath>
#include <vector>
#include <memory>
using namespace std;

class Account
{
protected:
    string accountNumber;
    string ownerName;
    double balance;

public:
    // Constructor
    Account(string accNum, string owner, double balance)
        : accountNumber(accNum), ownerName(owner), balance(balance) {}

    // Pure Virtual Methods = 0 يعني لازم كل كلاس يرث يعملهم override
    virtual void deposit(double amount) = 0;
    virtual bool withdraw(double amount) = 0;
    virtual void display() const = 0;
    virtual void applyMonthlyFee() = 0;

    // Getters
    string getAccountNumber() const { return accountNumber; }
    double getBalance() const { return balance; }

    // Virtual Destructor مهم جداً في الوراثة
    virtual ~Account() {}
};

class SavingsAccount : virtual public Account
{
    double interestRate;

public:
    SavingsAccount(string accNum, string owner, double balance, double rate)
        : Account(accNum, owner, balance), interestRate(rate) {}

    void deposit(double amount) override { balance += amount; }
    bool withdraw(double amount) override { return (balance - amount >= 100) ? (balance -= amount, true) : false; }

    double calculateInterest(int months) const { return balance * pow((1 + interestRate / 12), months) - balance; }
    void display() const override
    {
        cout << "=== Savings Account ===\n"
             << "Account: " << accountNumber << "\n"
             << "Owner: " << ownerName << "\n"
             << "Balance: $" << balance << "\n"
             << "Interest Rate: " << (interestRate * 100) << "%\n";
    }
    void applyMonthlyFee() override
    {
        balance *= (1 + interestRate / 12);
        cout << "Interest applied. New balance: $" << balance << "\n";
    }
};

class CheckingAccount : virtual public Account
{
    double overdraftLimit;
    double monthlyFee;

public:
    CheckingAccount(string accNum, string owner, double balance, double limit, double fee)
        : Account(accNum, owner, balance),
          overdraftLimit(limit), monthlyFee(fee) {}
    void deposit(double amount) override { balance += amount; }
    bool withdraw(double amount) override { return (balance + overdraftLimit >= amount) ? (balance -= amount, true) : false; }
    void display() const override
    {
        cout << "=== Checking Account ===\n"
             << "Account: " << accountNumber << "\n"
             << "Owner: " << ownerName << "\n"
             << "Balance: $" << balance << "\n"
             << "Overdraft Limit: $" << overdraftLimit << "\n"
             << "Monthly Fee: $" << monthlyFee << "\n";
    }
    void applyMonthlyFee() override { balance -= monthlyFee; }
    void setOverdraftLimit(double limit) { overdraftLimit = limit; }
};

class PremiumAccount : public SavingsAccount, public CheckingAccount
{
private:
    double rewardPoints; // نقاط المكافآت

public:
    
    PremiumAccount(string accNum, string owner, double balance)
        : Account(accNum, owner, balance),                  // مهم جداً!
          SavingsAccount(accNum, owner, balance, 0.03),     // 3% interest
          CheckingAccount(accNum, owner, balance, 1000, 0), // 1000 overdraft, 0 fee
          rewardPoints(0)
    {
    }

    void deposit(double amount) override
    {
        // استخدام CheckingAccount::deposit
        CheckingAccount::deposit(amount);

        // إضافة نقاط مكافآت: 1 نقطة لكل 10 دولار
        int points = static_cast<int>(amount / 10);
        rewardPoints += points;
        cout << "Earned " << points << " reward points! Total: " << rewardPoints << "\n";
    }

    bool withdraw(double amount) override
    {
        // استخدام منطق CheckingAccount (الأكثر مرونة)
        return CheckingAccount::withdraw(amount);
    }

    void display() const override
    {
        cout << "=-=-=-= PREMIUM ACCOUNT =-=-=-=\n"
             << "Account: " << accountNumber << "\n"
             << "Owner: " << ownerName << "\n"
             << "Balance: $" << balance << "\n"
             << "Reward Points: " << rewardPoints << "\n"
             << "Benefits: High Interest + Overdraft + No Fees\n";
    }

    void applyMonthlyFee() override
    {
        // مفيش رسوم! (Waived)
        cout << "Premium Account: Monthly fee WAIVED!\n";
        // بس بنضيف الفايدة من SavingsAccount
        double interest = balance * 0.03 / 12;
        balance += interest;
        cout << "Interest added: $" << interest << "\n";
    }

    double getRewardPoints() const { return rewardPoints; }
};

int main()
{
    vector<Account *> accounts;

    // إنشاء حسابات مختلفة
    accounts.push_back(new SavingsAccount("SAV001", "Ahmed", 1000, 0.02));
    accounts.push_back(new CheckingAccount("CHK001", "Mohamed", 500, 500, 10));
    accounts.push_back(new PremiumAccount("PRM001", "Ali", 5000));

    cout << "========== INITIAL DISPLAY ==========\n";
    for (auto acc : accounts)
    {
        acc->display(); // Polymorphism: كل واحد بيعرض بطريقته
        cout << "\n";
    }

    cout << "\n========== DEPOSIT OPERATIONS ==========\n";
    for (auto acc : accounts)
    {
        acc->deposit(100); // Polymorphism
    }

    cout << "\n========== WITHDRAW OPERATIONS ==========\n";
    for (auto acc : accounts)
    {
        acc->withdraw(200); // Polymorphism
    }

    cout << "\n========== MONTHLY FEES ==========\n";
    for (auto acc : accounts)
    {
        acc->applyMonthlyFee(); // كل واحد بيطبق الرسوم بطريقته
        cout << "\n";
    }

    cout << "\n========== FINAL BALANCES ==========\n";
    for (auto acc : accounts)
    {
        cout << acc->getAccountNumber() << ": $" << acc->getBalance() << "\n";
    }

    // ⚠️ مهم: نظف الذاكرة
    for (auto acc : accounts)
    {
        delete acc;
    }

    return 0;
}