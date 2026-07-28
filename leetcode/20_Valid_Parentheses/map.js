/**
 * @param {string} s
 * @return {boolean}
 */

var isValid = function (s) {
  const stack = [];
  const map = {
    ")": "(",
    "]": "[",
    "}": "{",
  };
  if (s.length % 2 != 0) {
    return false;
  }

  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push(ch);
    } else {
      if (stack.pop() !== map[ch]) {
        return false;
      }
    }
  }
  return stack.length === 0;
};

console.log(isValid("([])"));
