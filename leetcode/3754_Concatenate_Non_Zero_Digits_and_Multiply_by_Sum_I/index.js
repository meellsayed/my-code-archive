/**
 * @param {number} n
 * @return {number}
 */

var sumAndMultiply = function (n) {
   n = n.toString()
  let nonZeroDigits = [];
  let sum = null;

for (const digit of n) {
        if (digit != 0){
            nonZeroDigits.push(digit)
            sum += Number(digit)
        }
    }

//  console.log({ n, nonZeroDigits, sum });
  return sum * Number(nonZeroDigits.join(''));
};

// console.log(sumAndMultiply(1000));