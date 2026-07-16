import path from "node:path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve("./src/config/.env.dev") });
import express from "express";
import bootstrap from "./src/app.controller.js";
import { generateHash } from "./src/utils/security/hash.js";
const app = express();
const PORT = process.env.PORT || 5000;

bootstrap(app, express);



app.listen(PORT, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Server is running on http://localhost:${PORT}`);
});
