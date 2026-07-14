// function calc(num1, op, num2) {
//   switch (op) {
//     case "+":
//       console.log(`${num1} + ${num2} = ${num1 + num2}`);
//       break;
//     case "-":
//       console.log(`${num1} - ${num2} = ${num1 - num2}`);
//       break;
//     case "*":
//       console.log(`${num1} x ${num2} = ${num1 * num2}`);
//       break;
//     default:
//       console.error("Opraition Error !!");
//       break;
//   }
// }

// calc(12, "*", 3);

// // Decleration function
// function add1(num1, num2) {
//   sum = num1 + num2;
//   console.log(`add1 = ${sum}`);
// }
// add1(10, 1);

// // Expression || ennounmos
// const add2 = function (num1, num2) {
//   sum = num1 + num2;
//   console.log(`add2 = ${sum}`);
// };
// add2(10, 2);

// // 7-Arrow function

// const add3_1 = (num1, num2) => {
//   let sum = num1 + num2;
//   console.log(`add3_1 = ${sum}`);
// };

// // const add3_2 = (num1, num2) => num1 + num2;
// const add3_2 = (num1, num2) => console.log(`add3_2 = ${num1 + num2}`);

// const add3_3 = (num1) => console.log(`add3_3 = ${num1 + 10}`);

// add3_1(10, 3);
// add3_2(10, 3);
// add3_3(3); // +10

// //======================================================
// //                      Arrays
// //======================================================

// let colors = ["red", "green", 10, null, undefined, true, [1, 0, "man"], "blue"];

// console.log(colors);
// colors.push(10);
// colors.unshift(1);
// console.log(colors);
// colors.shift();
// colors.pop();
// console.log(colors);
// console.log(colors[6][2]);

// console.log(colors.includes("green"));
// console.log(colors.indexOf("green"));
// console.log(colors.lastIndexOf("green"));

// //======================================================
// //                      Objects
// //======================================================

const userData = {
  fristName: "Mohamed",
  lastName: "Elsayed",
  DOB: 2007,
  income: 0,
  calcAge: function () {
    // let age = 2026 - userData.DOB;
    let age = 2026 - this.DOB;
    return age;
  },
};
userData.captal = "medoo";
console.log(userData);
console.log(userData["income"]);
console.log(userData.captal);
console.log(userData.calcAge());
