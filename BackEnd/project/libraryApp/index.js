import { MongoClient } from "mongodb";
import express from "express";
import bootstrap from "./src/app.controller.js";
const app = express();
const PORT = 3000;

bootstrap(app, express);
app.use(req,res)
app.listen(PORT, (err) => {
  if (err) {
    console.error(err);
  }
  console.log(`Server is running on http://localhost:${PORT}`);
});
