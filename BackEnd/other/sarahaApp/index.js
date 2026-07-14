import express from "express";
import * as dotenv from "dotenv";
import bootstrap from "./src/app.controller.js";

dotenv.config({});
const app = express();
const PORT = process.env.PORT;

bootstrap(app, express);

app.listen(PORT, (err) => {
  console.log(`server running at http://localhost:${PORT}`);
  if (err) {
    console.error(err);
    process.exit(1);
  }
});
