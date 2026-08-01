import path from "node:path";
import * as dotenv from "dotenv";
import express from "express";
import bootstrap from "./src/app.controller.js";
import { Server } from "socket.io";
import { authentication } from "./src/middlewares/Socket/auth.middleware.js";
import cors from "cors"
import { runIo } from "./src/modules/socket/socket.controller.js";
dotenv.config({ path: path.resolve("./src/config/.env.dev") });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

bootstrap(app, express);

const httpServer = app.listen(PORT, (err) => {
  if (err) {
    console.error(err);
    process.exit(0);
  }
  console.log(`Server is running on http://localhost:${PORT}`);
});
runIo(httpServer)