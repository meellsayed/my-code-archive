const { log } = require("node:console");

// 4. Explain the difference between `forEach` and `for...of` loops in JavaScript.
// `forEach` is a method that executes a provided function once for each array element.
// It does not support breaking out of the loop or using `continue` statements.
// It is typically used for iterating over arrays and performing side effects.

// `for...of` is a loop that iterates over iterable objects (like arrays, strings, maps, etc.).
//  It allows you to use `break` and `continue` statements, making it more flexible than `forEach`.
//  It is often used when you need to iterate over a collection and perform operations that may require breaking out of the loop.

const array = [1, 2, 3, 4, 5];

function _4(arr) {
  // Using forEach
  arr.forEach((element) => {
    log(element);
    if (element === 3) {
      // Cannot break out of forEach
      log("Cannot break out of forEach");
    }
  });
  log("Finished forEach loop");

  // Using for...of
  for (const element of arr) {
    log(element);
    if (element === 3) {
      log("Breaking out of for...of");
      break; // This will break out of the loop
    }
  }
  log("Finished for...of loop");
}
// _4(array);

// 6. Use the spread operator to merge two arrays, then return the merged array.
function _6(arr1, arr2) {
  return [...arr1, ...arr2];
}
// log(_6([1, 2, 3], [4, 5, 6]));

// 7. Write a function that accepts multiple parameters (two or more) and returns their sum.
function _7(...numbers) {
  let result = 0;
  for (const num of numbers) {
    result += num; // Accumulate the sum of all numbers in the array
  }
  return result;
  // or used reduce(arrow func)
  // return numbers.reduce((sum, num) => sum + num, 0); // reduce is used to accumulate the sum of all numbers in the array
}
// log(_7(1, 2, 3, 4, 5));

// 8. Compare primitive and non-primitive data types in JavaScript with examples.
// Primitive data types include `string`, `number`, `boolean`, `null`, `undefined`, and `symbol`.
// They are immutable, meaning their values cannot be changed after they are created.
// When you assign a primitive value to a variable, it holds the actual value.
// symbol : A unique and immutable primitive value that can be used as a key for object properties.
// non-primitive data types include 'object', 'array', 'function', etc.
// They are mutable, meaning their values can be changed after they are created.
// When you assign a non-primitive value to a variable, it holds a reference to the value in memory.

//9. Explain how hoisting works in JavaScript and describe the Temporal Dead Zone (TDZ).
// Hoisting is a JavaScript mechanism where variable and function declarations are moved to the top of their containing scope during the compilation phase.
// This means that you can use variables and functions before they are declared in the code.
// However, only the declarations are hoisted, not the initializations.
// The Temporal Dead Zone (TDZ) is a behavior in JavaScript where variables
// declared with `let` and `const` are not accessible before their declaration.
// If you try to access a variable in the TDZ, it will throw a ReferenceError.
// This is because `let` and `const` declarations are hoisted but not initialized
// until their declaration is evaluated, creating a "dead zone" where the variable cannot be accessed.
// hoisted : i

//10. Write a function that demonstrates closure by creating a counter function that returns
// the number of times it has been called.

function _10() {
  let count = 0; // This variable is enclosed in the closure
  return function () {
    count++; // Increment the count each time the inner function is called
    return count; // Return the current count
  };
}
// log(_10()()); // Output: 1
// log(_10()()); // Output: 1 (because a new counter function is created each time _10 is called)

// // let count = 0; // This variable is enclosed in the closure
// // const counter = function () {
// //   count++; // Increment the count each time the inner function is called
// //   return count; // Return the current count
// // };

// const counter = _10();
// log(counter()); // Output: 1
// log(counter()); // Output: 2
// log(counter()); // Output: 3

// 11. Create a function that returns a promise which resolves after 3 seconds with a 'Success' message
function _11() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Success");
    }, 3000);
    // resolve("Promise is pending..."); // This will resolve immediately, but the setTimeout will still execute after 3 seconds
  });
}
// _11().then((message)=>{log (message)}) // Output after 3 seconds: "Success"

// 12. Convert the previous promise-based function to use `async` and `await`.

async function _12() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Success");
    }, 3000);
    log ("hi")
  });
}

async function run(){
  const message = await _12();
  log(message); // Output after 3 seconds: "Success"
}
// run()  