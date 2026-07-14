const { log } = require("node:console");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const PORT = 3000;

const server = http.createServer((req, res) => {
  log({ method: req.method, url: req.url });
});

/*
1. Path Module (2 Grades): 
Write an HTTP server that handles file paths. Implement the following: 
• Task 1.1: Respond with a breakdown of a given file path (e.g., extract root, 
directory, file name, and extension) and return the full path in a formatted string. 
o URL: POST /path-info (Get the file path from the body) 
*/
const parsePath = (filePath) => {
  const parsedPath = path.parse(filePath);
  return `Root: ${parsedPath.root}, Directory: ${parsedPath.dir}, File Name: ${parsedPath.name}, Extension: ${parsedPath.ext}, Full Path: ${parsedPath.base}`;
};

server.on("request", (req, res) => {
  /*  */ if (req.method === "POST" && req.url === "/1") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const filePath = JSON.parse(body).filePath;
      const pathInfo = parsePath(filePath);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ pathInfo }));
    });
  } else if (req.method === "GET" && req.url === "/3") {
    /*
  3. OS Module (1 Grades) (Search Point) 
  Gather system information and return it in the response. 
  • Task: Respond with the system’s architecture, platform, free memory, and total  memory. 
  o URL: GET /system-info 
 */
    const os = require("node:os");
    const systemInfo = {
      architecture: os.arch(),
      platform: os.platform(),
      freeMemory: os.freemem() / 1024 / 1024,
      totalMemory: os.totalmem() / 1024 / 1024,
    };
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(systemInfo));
  } else if (req.method === "POST" && req.url === "/4/create") {
    /* 4.File System Module (2 Grades) 
Perform file-based CRUD operations using a file to store data. 
o  Task 3.1: Create and delete a file. 
• URLs: 
o POST /create-file (Get the file name from the body) 
o DELETE /delete-file (Get the file name from the body) 
•  Input Example for File Creation: 
 
• Expected Output: The file is created, read, or deleted, and the relevant content 
or confirmation message is sent back. 
• Example (After creating the file): 
 
o  Task 3.2: Asynchronously read from and append to a file. Use path.join() to create 
the file path and path.resolve() to get the absolute path before performing the read 
and write operations. 
• URLs: 
o POST /append-async (Get the file name from the body) 
o POST /read-async (Get the file name from the body) 
• Input Example for Asynchronous File Write: 
 
• Expected Output: The file is written or read asynchronously, with a 
confirmation message */
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const fileName = JSON.parse(body).fileName;
      const filePath = path.join(__dirname, fileName);

      if (fs.existsSync(filePath)) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("File already exists");
        return;
      }
      fs.writeFile(filePath, "New File", (err) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Error creating file");
        } else {
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end(`File ${fileName} created successfully`);
        }
      });
    });
  } else if (req.method === "DELETE" && req.url === "/4/delete") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const fileName = JSON.parse(body).fileName;
      const filePath = path.join(__dirname, fileName);

      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("File Not Found");
        return;
      } else {
        fs.unlink(filePath, (err) => {
          if (err) {
            res.writeHead(400, { "Content-Type": "text/plain" });
            res.end("file not deleted");
            return;
          } else {
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end(`${fileName} deleted`);
            return;
          }
        });
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Error Not Found");
  }
});

server.listen(PORT, () => {
  log(`server running on http://localhost:${PORT}`);
});
