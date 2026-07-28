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

app.use(cors({
    origin: [
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "file:///home/mohamed/Desktop/programing/BackEnd/Week_16_SocketIO/FE/login.html"
    ],
    credentials: true
}));
bootstrap(app, express);

const httpServer = app.listen(PORT, (err) => {
  if (err) {
    console.error(err);
    process.exit(0);
  }
  console.log(`Server is running on http://localhost:${PORT}`);
});
runIo(httpServer)