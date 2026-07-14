#include <iostream>
#include <string>
using namespace std;
// 🎬 Abstract = "فكرة الممثل"
class Actor
{
public:
    virtual void act() = 0; // كل ممثل يمثل بطريقته
};

// 🎭 3 ممثلين مختلفين
class ComedyActor : public Actor
{
    void act() override
    {
        cout << "😂 *tells joke* *falls down*\n";
    }
};

class ActionActor : public Actor
{
    void act() override
    {
        cout << "💥 *explosion* *jumps from building*\n";
    }
};

class DramaActor : public Actor
{
    void act() override
    {
        cout << "😢 *cries* *looks at sunset*\n";
    }
};

// 🎬 المخرج (مش فرق معاه مين الممثل)
void directScene(Actor *actor)
{
    cout << "Director: Action!\n";
    actor->act(); // Polymorphism هنا!
    // actor.act(); // هذا لن يعمل لأن act() هو وظيفة افتراضية
}

int main()
{
    ComedyActor ahmed;
    ActionActor tom , mohamed;
    DramaActor mona;

    directScene(&ahmed); // 😂
    directScene(&tom);   // 💥
    directScene(&mohamed); // 💥
    directScene(&mona);  // 😢
}