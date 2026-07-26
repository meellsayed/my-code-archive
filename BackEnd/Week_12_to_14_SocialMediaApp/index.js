import path from "node:path";
import * as dotenv from "dotenv";
import express from "express";
import bootstrap from "./src/app.controller.js";
import { Server } from "socket.io";
import { generateHash } from "./src/utils/security/hash.js";
import { authentication } from "./src/middlewares/Socket/auth.middleware.js";
dotenv.config({ path: path.resolve("./src/config/.env.dev") });

const app = express();
const PORT = process.env.PORT || 5000;
const socketConnections = new Map()
bootstrap(app, express);

const httpServer = app.listen(PORT, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Server is running on http://localhost:${PORT}`);
});

const io = new Server(httpServer, { cors: "*" });

const registerSocket = async (socket) => {
  const user = await authentication({ socket: socket });
  console.log(user);
};
io.on("connection", (socket) => {
  console.log(socket.id);
  console.log(socket.handshake.auth.authorization);
  registerSocket(socket);
});
