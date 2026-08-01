import { bootstrap } from "./src/app.controller.js";
import express from "express";
const app = express();
const PORT = 3000;

bootstrap(app, express);

app.listen(PORT, () =>
  console.log(`Server runing at http://localhost:${PORT}`),
);
