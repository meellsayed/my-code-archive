const { log } = require("node:console");

/*3. Write a function to reverse a given string.
Input: "hello"
Output:"olleh"*/
function _3(string) {
  let result = "";
  for (let index = string.length - 1; index >= 0; index--) {
    result += string[index];
  }
  log(result);
}
// _3("hello");

/*15. Write a function that sorts an array of numbers in ascending order. 
Input: [5, 3, 8, 1, 2] 
Output: [1, 2, 3, 5, 8] 
 
 */
function _15(array) {
  //                  3
  for (let i = 0; i < array.length; i++) {
    for (let ii = 0; ii < array.length; ii++) {
      if (array[ii] > array[ii + 1]) {
        let temp = array[ii];
        array[ii] = array[ii + 1];
        array[ii + 1] = temp;
      }
    }
  }

  log(array);
}
// _15([ 2, 5, 1]);

/* 16. Write a function to check if a given string is an anagram of another string (i.e., contains 
the same characters in a different order). 
Input: "listen", "silent" 
Output: true */

function _16(string1, string2) {
  if (string1.length !== string2.length) {
    return log(false);
  }
  for (let index1 = 0; index1 < string1.length; index1++) {
    if (!string2.includes(string1[index1])) {
      return log(false);
    }
  }
  return log("true");
}
// _16("listen", "silent");


