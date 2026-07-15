/**
 * @param {string} s
 * @return {number}
 */

var romanToInt = function (s) {
  let result = 0;
  let arrayOfNum = [];
  s = s.toUpperCase();
  
  for (let index = 0; index < s.length; index++) {
    const element = s[index];
    switch (element) {
      case "I":
        if (s[index + 1] === "V" || s[index + 1] === "X") {
          arrayOfNum[index] = -1;
        } else {
          arrayOfNum[index] = 1;
        }
        break;
      case "V":
        arrayOfNum[index] = 5;
        break;
      case "X":
        if (s[index + 1] === "L" || s[index + 1] === "C") {
          arrayOfNum[index] = -10;
        } else {
          arrayOfNum[index] = 10;
        }
        break;
      case "L":
        arrayOfNum[index] = 50;
        break;
      case "C":
        if (s[index + 1] === "D" || s[index + 1] === "M") {
          arrayOfNum[index] = -100;
        } else {
          arrayOfNum[index] = 100;
        }
        break;
      case "D":
        arrayOfNum[index] = 500;
        break;
      case "M":
        arrayOfNum[index] = 1000;
        break;
      default:
        break; 
    }

    result += arrayOfNum[index];
  }
  return result;
};

