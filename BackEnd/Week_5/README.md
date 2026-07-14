to make project

1. make new folder
2. creat new index.js
3. npm init -y ===> package.json
4. npm i express
5. .listen
6. npm run dev "node --watch index.js"


app.get("/", (req, res, next) => {
  // req from front end to   back end
  // res to   front end from back end
  // ================================
  //   res.send(new Buffer("wahoo"));
  //   res.send({ some: "json" });
  //   res.send("<p>some html</p>"); // as defult
  //   res.status(404).send("Sorry, cant find that");
  // res.setHeader("Content-type", "text/html");
  
  return res.send("home page");
});