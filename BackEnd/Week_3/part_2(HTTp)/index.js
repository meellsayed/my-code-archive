const { log, error } = require("node:console");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const obj = [{ age: 23, name: "medo" }];

// const server = http.createServer((req, res) => {
// //   res.writeHead(200, "Done", { "content-type": "text/html" });
// // //   res.write("one ");
// // //   res.write("<h1>two</h1> ");
// // //   res.write(JSON.stringify(obj));
// //   res.end();
// //   // res.write("one "); // error
// });
//========================================================

const server = http.createServer((req, res) => {
  const { url, method } = req;
  log({ url, method });

  if (url == "/" && method == "GET") {
    res.write("home");
    res.end();
  } else if (url == "/blog" && method == "GET") {
    const filePath = path.join(__dirname, "./index.html");
    // const fileData = fs.readFileSync(filePath, { encoding: "utf-8" });
    // res.end(fileData);

    const readStream = fs.createReadStream(filePath, {
      encoding: "utf-8",
      highWaterMark: 1000,
    });

    readStream.pipe(res); // لو انا مش هغير الداتا وهنا افضلهم ال pipe
    // res.writeHead(200, { "content-type": "text/html" });
    // readStream.on("data", (chunk) => {
    //   res.write(
    //     chunk + "<h1>===============================================</h1>",
    //   );
    // });

    // readStream.on("end", () => {
    //   res.end(
    //     "<h1>=============================================== end ========================================================</h1>",
    //   );
    // });

    readStream.on("error", (err) => {
      if (err.code === "ENOENT") {
        log("not file found");
        res.end("not file found");
      }
    });
  } else {
    res.end("404 page not found");
  }

  res.on("error", (err) => {
    log(err);
  });
});

server.listen(3000, "localhost", 511, () => {
  log("run in 3000");
  log("http://localhost:3000");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    error("address already in use 3000");
  }
  if (err.code === "ENOENT") {
    error("not file found");
  }
});
