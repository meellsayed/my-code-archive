import path from "node:path";
import * as dotenv from "dotenv";
import express from "express";
import bootstrap from "./src/app.controller.js";
import { Server } from "socket.io";
dotenv.config({ path: path.resolve("./src/config/.env.dev") });

const app = express();
const PORT = process.env.PORT || 5000;
bootstrap(app, express);

const httpServer = app.listen(PORT, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is running on http://localhost:${PORT}`);
});

const io = new Server(httpServer, { cors: "*" });

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
});
