/**
 * @param {string} s
 * @return {boolean}
 */

//let map = new Map();
var isValid = function (s) {
  const length = s.length;
  if (length % 2 != 0) {
    return false;
  }

  for (let i = 0; i < length; i++) {
    const element = s[i];
    switch (element) {
      case "(":
        if (!s.includes(")")) {
          return false;
        }
        for (let c = i + 1; c < length; c++) {
          const val = s[c];
          if (val == ")") {
            if ((c - i - 1) % 2 == 0) {
              s = s.slice(0, i) + s.slice(i + 1, c) + s.slice(c + 1);
              i = -2;
              break;
            }
          }
        }
        break;
      case "{":
        if (!s.includes("}")) {
          return false;
        }
        for (let c = i + 1; c < length; c++) {
          const val = s[c];
          if (val == "}") {
            if ((c - i - 1) % 2 == 0) {
              s = s.slice(0, i) + s.slice(i + 1, c) + s.slice(c + 1);
              i = -2;
              break;
            }
          }
        }
        break;
      case "[":
        if (!s.includes("]")) {
          return false;
        }
        for (let c = i + 1; c < length; c++) {
          const val = s[c];
          if (val == "]") {
            if ((c - i - 1) % 2 == 0) {
              s = s.slice(0, i) + s.slice(i + 1, c) + s.slice(c + 1);
              i = -2;
              break;
            }
          }
        }
        break;
      default:
        break;
    }
  }
  console.log(s);
  return s.length == 0 ? true : false;
};

console.log(isValid("{({})}"));
