const { log } = require("node:console");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const port = 3000;

const server = http.createServer((req, res) => {
  const { url, method } = req;
  log({ url, method });
  /*  */ if (url == "/" && method == "GET") {
    res.writeHead(200, { "content-type": "text/html" });
    res.end("Home Page");
  } else if (url == "/about" && method == "GET") {
    res.writeHead(200, { "content-type": "text/plain" });
    res.write("About Page plain text");
    res.end();
  } else if (url == "/users" && method == "GET") {
    const jsonPath = path.join(__dirname, "./users.json");
    const dataJson = fs.createReadStream(jsonPath, { encoding: "utf-8" });
    res.writeHead(200, { "content-type": "application/json" });
    dataJson.pipe(res);
    // res.end();
  } else if (url == "/html/i" && method == "GET") {
    const filePath = path.join(__dirname, "./index.html");
    // const readFile1 = fs.readFileSync(filePath,{encoding:"utf-8"})
    const readFile2 = fs.createReadStream(filePath, { encoding: "utf-8" });
    // readFile2.on("data", (chunk) => {
    //   res.end(chunk);
    // });
    readFile2.pipe(res); // لو مش هغير
  } else if (url == "/signup" && method == "POST") {
    let bodyData = "";
    req.on("data", (chunk) => {
      // log(chunk); // Buffer
      bodyData += chunk;
    });

    req.on("end", () => {
      bodyData = JSON.parse(bodyData); // Buffer to json
      // log({bodyData});

      // read user file
      const filePath = path.join(__dirname, "./users.json");
      const readFile = fs.readFileSync(filePath, { encoding: "utf-8" });
      const allUsers = JSON.parse(readFile);
      // log({ allUsers });

      const checkUserExist = allUsers.find(
        (user) => user.email == bodyData.email,
      );
      if (checkUserExist) {
        res.writeHead(409, { "content-type": "application/json" });
        res.end(JSON.stringify({ message: "Email Exist", checkUserExist }));
      } else {
        bodyData.id = Date.now();
        allUsers.push(bodyData);
        log(allUsers);
        fs.writeFileSync(filePath, JSON.stringify(allUsers));
        res.end();
      }
    });
  } else if (url == "/user" && method == "POST") {
    
    let bodyData = "";
    req.on("data", (chunk) => {
      bodyData += chunk;
    });
    req.on("end", () => {
      // bodyData = JSON.parse(bodyData);
      // log(bodyData)
      // or data destruct
      const { email } = JSON.parse(bodyData); // Destruct
      log("sent by front-end : ", { email });

      // read file users
      const filePath = path.join(__dirname, "./users.json");
      const readFile = fs.readFileSync(filePath, { encoding: "utf-8" });
      const allUsers = JSON.parse(readFile);
      // log(allUsers);
      
      // to find user
      const user = allUsers.find((user) => user.email == email);
      res.writeHead(user ? 200 : 400, { "content-type": "applictaion/json" });
      user
      ? res.end(JSON.stringify({ message: "Done", user }))
      : res.end(JSON.stringify({ message: "user not exist" }));
    });
  } else {
    res.writeHead(404, { "content-type": "text/html" });
    res.end("404 error page notttt found");
  }
});

server.listen(port, () => {
  log(`Server run in http://localhost:${port}`);
});
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    log(`address already in use :::${port}`);
    server.listen(port + 1, () => {
      log(`Server run in http://localhost:${port + 1}`);
    });
  } else {
    log(err);
  }
});
