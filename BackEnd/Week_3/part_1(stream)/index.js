const { log } = require("node:console");
const fs = require("node:fs");
const path = require("node:path");
const filePath = path.join(__dirname, "./data.txt");
const destPath = path.join(__dirname, "./dest.txt");

const readFileStream = fs.createReadStream(filePath, {
  encoding: "utf-8",
  highWaterMark: 3,
  // start:3,
  // end:7
  // autoClose: true,
  // emitClose:false
});

const writeFileStream = fs.createWriteStream(destPath, { encoding: "utf-8" });

// readFileStream.on("data", (chunk) => {
//   log("========================================");
//   log(chunk);
//   writeFileStream.write(chunk);
//   log("========================================");
// });

readFileStream.pipe(writeFileStream);

readFileStream.on("close", () => {
  log("**************************  stream closed  **********************");
});

readFileStream.on("end", () => {
  log("**************************  stream ended  **********************");
});

readFileStream.on("ready", () => {
  log("**************************  stream ready  **********************");
});

readFileStream.on("pause", () => {
  log("**************************  stream pause  **********************");
});
readFileStream.on("resume", () => {
  log("**************************  stream resume  **********************");
});

// setTimeout(() => {
//   readFileStream.pause();
// }, 20);

// setTimeout(() => {
//   readFileStream.resume();
// }, 300);

readFileStream.on("error", (e) => {
  log("**************************  stream error  **********************", e);
});

// readFileStream.on("readable", () => {
//   log("**************************  stream readable  **********************");
//   readFileStream.read(23)
// });
