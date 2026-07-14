const { log } = require("node:console");
// const path = require("node:path");
// console.log(`__filename = ${__filename}`);
// console.log(`__dirname = ${__dirname}`);
// console.log(`path.basename(__filename) = ${path.basename(__filename)}`);
// console.log(`path.extname(__filename) = ${path.extname(__filename)}`);
// console.log(`path.parse(__filename) = `, path.parse(__filename));
// console.log(
//   `path.format(opj) = `,
//   path.format({
//     root: "/",
//     dir: "/home/mohamed/Desktop/programing/BackEnd_Node/Week_2/node",
//     base: "index.js",
//     ext: ".js",
//     name: "index",
//   }),
// );

// console.log(path.join("f1", "f2", "f3"));
// console.log(path.join("f1", "f2", "f3"));
// console.log(path.join("f1", "f2", "f3", "../"));
// console.log(path.join(__dirname, "./test.txt"));

// const EventEmitter = require("node:events")
// const event = new EventEmitter()
// event.on("send email",()=>{
//     console.log("sending email done")
// })
// event.emit("send email");

// // =======================================================================
// // =======================================================================
const fs = require("node:fs");
const path = require("node:path");
const filePath = path.join(__dirname, "./data.txt");
// =======================================================================
// // =======================================================================

// const readFileData = fs.readFileSync(filePath, {
//   encoding: "utf-8",
//   flag:'r' // r => read , r+ => read and writ , w =>writ
// });
// console.log(readFileData);
// console.log("test");

// fs.readFile(
//   filePath,
//   {
//     encoding: "utf-8",
//     flag: "r", // r => read , r+ => read and writ , w =>writ
//   },
//   (err, data) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(data);
//     }
//   },
// );
// console.log("test");

// ======================================================================
//                              write file
// ======================================================================
// fs.writeFileSync(filePath,"medo elsyed") // defult flag = w // over write
// fs.writeFileSync(filePath," medo elsyed ",{encoding:"utf-8",flag:'a'}) // a = append

// fs.writeFile(
//   filePath,
//   "medooo\n",
//   { encoding: "utf-8", flag: "r+" },
//   (err, data) => {
//     err ? console.log("invald file path") : console.log("done");
//   },
// );

// =======================================================================
// =======================================================================
console.log(fs.existsSync(filePath));
if (fs.existsSync(filePath)) {
  fs.unlinkSync(filePath); // to delete
} else {
  console.log("error");
}

// try {
//   fs.mkdirSync(path.join(__dirname, "f1","./23"));
// } catch (err) {
// }

// =======================================================================
// =======================================================================

// const fs = require("node:fs/promises"); // promises is an upgrad
// const path = require("node:path");
// const filePath = path.join(__dirname, "./data.txt");

// fs.readFile(filePath, { encoding: "utf-8", flag: "r" })
//   .then((data) => {
//     console.log(data);
//   })
//   .catch((err) => {
//     console.log(err);
//   });
// log("malihs D3wa")

// async function readData(filePath) {
//   const data = await fs
//     .readFile(filePath, { encoding: "utf-8", flag: "r" })
//     .catch((err) => {
//       log(err);
//     });
//   log(data);
//   log("malihs D3wa");
// }

// readData(filePath);
