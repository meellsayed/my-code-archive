import express from "express";
import path from "path";
import bootstrap from "./src/app.controller.js";
import dotenv from "dotenv";
dotenv.config({ path: "./src/config/.env.dev" });
const app = express();
const PORT = process.env.PORT || 3000;

bootstrap(app, express);

app.use(express.static(path.resolve("frontend")));
app.use("/v2", express.static(path.resolve("frontendv2")));

app.listen(PORT, (err) => {
  if (err) {
    console.error(err);
  }
  console.log(`Server is running on http://localhost:${PORT}`);
});
