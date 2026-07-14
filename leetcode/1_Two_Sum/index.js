/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
// var twoSum = function (nums, target) {
//   for (i = 0; i < nums.length; i++) {
//     for (n = i++; n < nums.length; n++) {
//       if (nums[i] + nums[n] == target) {
//         return [i,n];
//       }
//     }
//   }
// };

var twoSum = function (nums, target) {
  const map = new Map();

  for (let num2 = 0; num2 < nums.length; num2++) {
    const num1 = target - nums[num2];
    if (map.has(num1)) {
      return [map.get(num1), num2];
    }
    map.set(nums[num2], num2);
  }
};

console.log(twoSum([2, 7, 11, 15], 9));
