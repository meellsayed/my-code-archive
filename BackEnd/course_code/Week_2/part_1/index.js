function makeArr(from, to, step = 1) {
  let arr1 = [];

  for (let i = from; i <= to; ) {
    arr1.push(i);
    i = i + step;
  }
  return arr1;
}
// ===================================================================
//                   for loop and break vs continue
// ===================================================================

// let data =[1,13,32,20,0]
// for (let i = 0; i < data.length; i++) {
//     if (data[i]==20) {
//         // break; // stop for loop
//         continue; // skip one itrishin
//     }
//     console.log(data[i]);
// }

//===========================================
// function getOddAndEven(arr) {
//   let even = [];
//   let odd = [];

//   for (let i = 0; i < arr.length; i++) {
//     if (arr[i] % 2 == 0) {
//       even.push(arr[i]);
//     } else {
//       odd.push(arr[i]);
//     }
//   }
//   return { odd, even };
// }

// let arr1 = arr(1, 10);
// console.log(getOddAndEven(arr1));

//
// ===================================================================
//                           While Loop
// ===================================================================

// let i = 0;
// let arr = makeArr(1, 10);
// while (i < arr.length) {
//   console.log(arr[i]);
//   i ++;
// }

// ============================================================================
//                                   Destructing
// ============================================================================

// let data = [10, 20, 30, 40, 50, 60];
// let        [x ,   ,   , y , z ,   ] = data;
// console.log(x,y,z);
// console.log(x);

// let opj = {
//   firstName: "mohamed",
//   lastName: "Elsayed",
//   DOB: 2007,
// };
// let {firstName, DOB} = opj;
// console.log(firstName);
// // console.log({firstName});
// console.log({DOB,firstName});

// ===================================================================
//              4-named vs positional  arguments.mp4
// ===================================================================

// //====================  step 1  =====================
// function difference1(in1, in2 = 100, in3) {
//   return in2 - in1 + in3;
// }

// console.log("1 = " + difference1(10, 1, 100));

// //====================  step 2  =====================
// function difference2(data) {
//   let { in1, in2 = 1, in3 } = data;
//   return in2 - in1 + in3;
// }

// console.log("2 = " + difference2({ in1: 10, in3: 100 }));
// // console.log("2 = " + difference2({ in1: 10, in2: 1, in3: 100 }));

// //====================  step 3  =====================
// function difference3({ in1, in2 = 1, in3 }) {
//   return in2 - in1 + in3;
// }

// // console.log("3 = " + difference3({ in1: 10, in2: 1, in3: 100 }));
// console.log("3 = " + difference3({ in3: 100, in1: 10 }));

// //============ step 4 error handeling  ==============
// function difference4({ in1, in2 = 1, in3 }={}) {
//   return in2 - in1 + in3;
// }
// console.log( difference4());

// ===================================================================
//                              5-spread
// ===================================================================

// let data = [10, 20]; // or obj
// // let copyData = data; // chang data if i chang it   == not useful ==
// // let copyData = [data]; // copy as array
// let copyData = [...data]; // or obj

// copyData.push(30, 65, 7);
// console.log(data);
// console.log(copyData);

// ===================================================================
//                              6-rest patrn
// ===================================================================

// const { age, ...others } = { name: "medo elsayed", age: 19, binary: 100110010 };
// console.log(age);
// console.log(others.binary);
// console.log(others);
// // ================   array    ==================
// const [x, ,y, ...all] = [1, 2, 3, 4, 5, 6];
// console.log(all);

// ===================================================================
//                 7-Short Circuiting (&& and ) & Nulish
// ===================================================================

// let result = null ?? 10
// // result = undefined ?? 10
// // // result = 2 ?? 10
// // // // result = true ?? 10
// // // // // result = false ?? 10

// console.log(result);

// ===================================================================
//                    8-Primitive  vs non-primitive
// ===================================================================

// ======== TypeErrors : Assignment to constant variable.========

// const x = 5;
// x = 10; // error
// console.log(x);

// const y = [5, 6];
// y = [10, 11];
// console.log(y);

// ======================== Not have Error ======================

// const z = [5, 6];
// console.log(z);

// z [0]= 10
// z [1]= 11

// console.log(z);

// ===================================================================
//                             10-hosting & TDZ
// ===================================================================

// -------------------    var , func   ----------------
// // var x = undefined; // By defult

// console.log(x);

// var x = 5;
// console.log(x);

// // ------------------  let ,  const  ----------------

// console.log(z); // Error not access

//    ||
//    ||
//    ||      templed ميت zone  (TDZ)
//    ||
//    \/
// let z = 5;
// console.log(z);

// ===================================================================
//                     11- pass function as paramter
// ===================================================================
//
//  all of this not use we used Callback
//

// function one(fun2) {
//   setTimeout(() => {
//     console.log("one");
//     fun2(three);
//   }, 3000);
// }

// function two(fun3) {
//   setTimeout(() => {
//     console.log("two");
//     fun3();
//   }, 2000);
// }

// function three() {
//   setTimeout(() => {
//     console.log("three");
//   }, 1000);
// }

// one(two);

// ===================================================================
//                             12-callback
// ===================================================================
// ###################### callback Hill ###########################
// function one(callback) { // you can rename callback to any thing
//   setTimeout(() => {
//     console.log("one");
//     callback();
//   }, 3000);
// }

// function two(callback) {
//   setTimeout(() => {
//     console.log("two");
//     callback();// tiger fun
//   }, 2000);
// }

// function three() {
//   setTimeout(() => {
//     console.log("three");
//   }, 1000);
// }

// one(() => {
//   two(() => {
//     three();
//   });
// });
// () => { }  it is a arrow function

// ====================================================================================
//                   13-return promise and async await
// ====================================================================================

// function one() {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       console.log("one");
//       let age = 71;
//       if (age >= 18) {
//         resolve("resolve one");
//       } else {
//         reject("fall one 111");
//       }
//     }, 3000);
//   });
// }

// function two() {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       console.log("two");
//       let two = 2;
//       if (two == 2) {
//         resolve("resolve two");
//       } else {
//         reject("Ops!! 222");
//       }
//     }, 2000);
//   });
// }

// function three() {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       console.log("three");
//     }, 1000);
//     resolve();
//   });
// }

// // one()
// //   .then((dataOfOne) => {
// //     console.log({ dataOfOne });
// //     two()
// //       .then((dataOfTwo) => {
// //         console.log({ dataOfTwo });
// //         three();
// //       })
// //       .catch((err) => {
// //         console.log({ err });
// //       });
// //   })
// //   .catch((err) => {
// //     console.log({ err });
// //   });

// //----------------- async & await ------------
// async function run() {
//   // const data = await one();
//   // console.log({ data });
//   // await two().catch((err) => {console.log(err);});
//   // await three();

//   // ------------ to handel errors -----------
//   try {
//     const data = await one();
//     console.log({ data });
//     await two();
//     await three();
//   } catch (error) {
//     console.log(error);
//   }
// }
// run();

// ===================================================================
//                    14-allsatlled vs all vs any
// ===================================================================

// function categories() {
//   return new Promise((resolve, reject) => {
//     console.log("categories");
//     resolve("categories");
//   });
// }
// function users() {
//   return new Promise((resolve, reject) => {
//     console.log("users");
//     // reject("reject users");
//     resolve("users");
//   });
// }
// function products() {
//   return new Promise((resolve, reject) => {
//     console.log("products");
//     resolve("products");
//   });
// }

// async function dahsBoard() {
//   // const categories = await categories();
//   // const users = await users();
//   // const products = await products();
//   //
//   // ---- when i wont run and data of all in this time we will useing allSatlled -----
//   // ~~~~~~~~~~ ex: use it when you want all tasks to finish , even if some fail ~~~~~
//   //
//   let result = await Promise.allSettled([categories(), users(), products()]);
//   //
//   // ---------- when i wont data of all if are resolved  we will useing all --------
//   // ~~~~~~~~~~~~  ex: load user data + posts + comments together  ~~~~~~~~~~~~
//   //
//   result = await Promise.all([categories(), users(), products()]);
//   //
//   //
//   // -------------- when i wont data of first thing we will useing any -------------
//   // ~~~~~~~~~ ex: request from 3 servers, use fastest successful one ~~~~~~~~~~
//   //
//   result = await Promise.any([categories(), users(), products()]);
//   //
//   //
//   console.log({ result });
// }
// // dahsBoard();
