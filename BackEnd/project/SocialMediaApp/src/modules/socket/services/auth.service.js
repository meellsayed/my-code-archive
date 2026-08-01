import { authentication } from "../../../middlewares/Socket/auth.middleware.js";
import { socketConnections } from "../socket.controller.js";

export const registerSocket = async (socket) => {
  const user = await authentication({ socket: socket });
  // console.log(user);

  socketConnections.set(user._id.toString(), socket.id);
  console.log(socketConnections);

  return "Done";
};

export const logoutSocketId = async (socket) => {
  socket.on("disconnect", async () => {
    const user = await authentication({ socket: socket });

    socketConnections.delete(user._id.toString());
    console.log(socketConnections);
  });
  return "Done";
};
