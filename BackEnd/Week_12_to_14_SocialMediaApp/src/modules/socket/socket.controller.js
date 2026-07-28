import { Server } from "socket.io";
import { authentication } from "../../middlewares/Socket/auth.middleware.js";
import { logoutSocketId, registerSocket } from "./services/auth.service.js";

export const socketConnections = new Map();
export const runIo = (httpServer) => {
  const io = new Server(httpServer, { cors: "*" });

  io.on("connection", async (socket) => {
    // console.log("Socket connected:", socket.id);
    // console.log("Socket connected:", socket.handshake.auth.authorization);

    await registerSocket(socket);
    await logoutSocketId(socket);
  });
};

