let users = [
  {
    id: 1,
    name: "mohamed elsayed ali",
    email: "medoel@gmail.com",
  },
  {
    id: 1,
    name: "mohamed elsayed ali",
    email: "mhamedelsayed@gmail.com",
    age: 19,
  },
  {
    name: "medo",
    email: "mhamedelsayed@gmail.com",
    id: 2,
  },
  {
    name: "medooo",
    email: "mhamedelsayed00@gmail.com",
    id: 3,
  },
];
const path = require("node:path");
const fs = require("node:fs");
const { log } = require("node:console");
const express = require("express");
const app = express();
const port = 3000;

//=====================================================
//                      middleware
//  app.use(express.json()); // bilt in middleware we use it in any code in first
//=====================================================
app.use(express.json()); // bilt in middleware
let isLoggin = true;
let Auth = (req, res, next) => {
  if (isLoggin) {
    return next();
  } else {
    return res.status(401).send("not auth");
  }
};
app.use(Auth); // middleware for all under it

// middleware \/
app.get("/", Auth, (req, res, next) => {
  return res.send("home page");
});

app.get("/test", (req, res, next) => {
  res.setHeader("Content-type", "application/json");
  // return res.send(JSON.stringify({message:"hello <script> XSS </script> world"}));
  return res.json(
    JSON.stringify({ message: "hello <script> XSS </script> world" }),
  );
});
app.get("/file", (req, res, next) => {
  const filePath = path.join(__dirname, "./data.html");
  // res.status(200).sendFile(filePath); // not stream
  const readFileStream = fs.createReadStream(filePath, {
    highWaterMark: 15,
    encoding: "utf-8",
  });

  res.setHeader("content-type", "text/html ");

  // readFileStream.pipe(res) // if not modfiy
  readFileStream.on("data", (chunk) => {
    res.write(chunk + `hi`);
  });
  readFileStream.on("end", () => {
    res.end();
  });
});

app.post("/signup", (req, res, next) => {
  log("data send by front end : ", req.body);
  const { name, email, id } = req.body;
  // log({ name, email, id });

  const userFound = users.find((user) => user.email == email);

  if (userFound) {
    return res.status(200).json(userFound);
  } else {
    users.push({ name, email, id });
    return res.status(201).json({ message: "Done", users });
  }

  return res.json({ message: "Sign up" });
});

app.get("/user/search", (req, res, next) => {
  // console.log(req.query);
  const { searchKay } = req.query;
  log({ searchKay });
  const result = users.filter((user) => user.name.includes(searchKay));
  return res.status(200).json({ message: "Search  Done", result });
});

//=====================================================
//                       params
// if you used it make it at last code
// optional params have :name?
//=====================================================

//       params \/ دائما return string
app.get("/user/:id", (req, res, next) => {
  log(req.params); // log(req.params.id);
  const { id } = req.params;

  const userIsFind = users.find((user) => user.id == Number(id));
  log({ userIsFind });

  return userIsFind
    ? res.status(200).json({ message: "Done", userIsFind })
    : res.status(400).json({ message: "Not found" });
});

// app.all("*",(req,res,next)=>{
//     // error at *
//     return res.status(404).json({message :"page not found"})
// })

const server = app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error("port in use");
    app.listen(port + 1, () => {
      console.log(`server is running on http://localhost:${port + 1}`);
    });
  }
});
