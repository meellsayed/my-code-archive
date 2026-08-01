import { authentication } from "../../../middlewares/Socket/auth.middleware.js";
import * as dbService from "../../../DB/db.service.js";
import { chatModel } from "../../../DB/models/Chat.model.js";
import { socketConnections } from "../socket.controller.js";

export const sendMessage = async (socket) => {
  return socket.on("sendMessage", async (messageData) => {
    console.log({ messageData });

    const user = await authentication({ socket });
    const userId = user._id;
    const { destId, message } = messageData;

    let chat = await dbService.findOneAndUpdate({
      model: chatModel,
      filter: {
        $or: [
          {
            mainUser: userId,
            subParticipant: destId,
          },
          {
            mainUser: userId,
            subParticipant: destId,
          },
        ],
      },
      data: {
        $push: { messages: { message, senderId: userId } },
      },

      populate: [
        {
          path: "mainUser",
          select: "userName image",
        },
        {
          path: "subParticipant",
          select: "userName image",
        },
        {
          path: "messages.senderId",
          select: "userName image",
        },
      ],
    });
    if (!chat) {
      await dbService.create({
        model: chatModel,
        data: {
          mainUser: userId,
          subParticipant: destId,
          $push: { messages: { message, senderId: userId } },
        },
      });
    }
    socket.emit("successMessage", { chat, message });
    socket.to(socketConnections.get(destId)).emit("receiveMessage", { chat, message });

    return "Done";
  });
};
