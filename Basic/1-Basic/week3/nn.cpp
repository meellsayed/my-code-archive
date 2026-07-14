
//====================== Patterns =======================

// 1- print :
//              *

//  cout << "*";

//===========================================
// 2- print :
//            *****

/*
int stars_per__line;
cin >> stars_per__line;

for (int j = 1; j <= stars_per__line; j++) {
    cout << "*";
}
*/

//===========================================
// 3- print :
//       j=   1234h

//            *****    i= 1
//            *****    i= 2
//            *****    i= 3
//            *****    i= 4
//            *****    i= h

/*
int height;
cin >> height;

for (int i = 1; i <= height; i++) {
    for (int j = 1; j <= height; j++) {
        cout << "*";
    }
    cout << endl;
}
*/

//===========================================
// 4- print :
//       j=   1234h

//            *****    i= 1
//            *   *    i= 2
//            *   *    i= 3
//            *   *    i= 4
//            *****    i= h

/*
int height;
cin >> height;

    for (int i = 1; i <= height; i++) {
        for (int j = 1; j <= height; j++) {
            if (j == 1 || i == 1 || j==height || i == height) {
                cout << "*";
            }
            else
                cout << " ";
        }
        cout << endl;
    }
    */

//===========================================
// 5- print :
//       j=   1234h

//            *       i= 1
//            **      i= 2
//            ***     i= 3
//            ****    i= 4
//            *****   i= h

/*
int height;
cin >> height;

    for (int i = 1; i <= height; i++) {
        for (int j = 1; j <= i; j++) {
            cout << "*";
        }
        cout << endl;
    }
    */
//===========================================
// 6- print :
//       j=   1234h

//            *****       i= 1
//            ****        i= 2
//            ***         i= 3
//            **          i= 4
//            *           i= h

/*
int height;
cin >> height;

for (int i = height; i >= 1; i--) {
    for (int j = 1; j <= i; j++) {
        cout << "*";
    }
    cout << endl;
}
*/

//===========================================
// 7- print :
//       j=   1234h

//            *       i= 1
//            **      i= 2
//            * *     i= 3
//            *  *    i= 4
//            *****   i= h

/*
int height;
cin >> height;

for (int i = 1; i <= height; i++) {
    for (int j = 1; j <= i; j++) {
        if (j == 1 || j == i || i == height) {
            cout << "*";
        }
        else
            cout << " ";
    }
    cout << endl;
}
*/
//===========================================
// 8- print :
//       j=   12345678h

//                *****    i= 1
//               *****     i= 2
//              *****      i= 3
//             *****       i= 4
//            *****        i= h

/*
int height;
cin >> height;

for (int i = 1; i <= height; i++) {
    for (int j = height; j >= i; j--) {
        cout << " ";
    }
    for (int j = 1; j <= height; j++) {
        cout << "*";
    }
    cout << endl;
}
*/

//===========================================
// 9- print :
//       j=   12345678h

//                *        i= 1
//               * *       i= 2
//              * * *      i= 3
//             * * * *     i= 4
//            * * * * *    i= h

/*
int height;
cin >> height;

for (int i = 1; i <= height; i++){
    for (int j = height; j >= i; j--){
        cout << " ";
    }

    for (int j = 1; j <= i; j++) {
        cout << "* ";
    }
    cout << endl;
}
*/

//===========================================
// 10- print :
//       j=   12345678h

//                *        i= 1
//               ***       i= 2
//              *****      i= 3
//             *******     i= 4
//            *********    i= h

/*
int height;
cin >> height;

for (int i = 1; i <= height; i++){
    for (int j = height; j >= i; j--){
        cout << " ";
    }

    for (int j = 1; j <= (2*i-1); j++) {
        cout << "* ";
    }
    cout << endl;
}
*/

//===========================================
// 11- print :
//       j=   12345678h

//                *        i= 1
//               ***       i= 2
//              *****      i= 3
//             *******     i= 4
//            *********    i= 5
//            *********    i= 6
//             *******     i= 7
//              *****      i= 8
//               ***       i= 9
//                *        i= 10

/*
int height;
cin >> height;

for (int i = 1; i <= height; i++){
    for (int j = height; j >= i; j--){
        cout << " ";
    }

    for (int j = 1; j <= (2*i-1); j++) {
        cout << "* ";
    }
    cout << endl;
}
for (int i = height; i >= 1; i--){
    for (int j = height; j >= i; j--){
        cout << " ";
    }

    for (int j = 1; j <= (2*i-1); j++) {
        cout << "* ";
    }
    cout << endl;
}
*/
//===========================================
// 12- print :
//       j=   12345678h

//                *        i= 1
//               * *       i= 2
//              * * *      i= 3
//             * * * *     i= 4
//            * * * * *    i= 5
//            * * * * *    i= 6
//             * * * *     i= 7
//              * * *      i= 8
//               * *       i= 9
//                *        i= h

/*
int height;
cin >> height;

for (int i = 1; i <= height; i++) {
    for (int j = height; j >= i; j--) {
        cout << " ";
    }

    for (int j = 1; j <= i; j++) {
        cout << "* ";
    }
    cout << endl;
}


for (int i = height; i >= 1; i--){
    for (int j = height; j >= i; j--){
        cout << " ";
    }

    for (int j = 1; j <= i; j++) {
        cout << "* ";
    }
    cout << endl;
}
*/
