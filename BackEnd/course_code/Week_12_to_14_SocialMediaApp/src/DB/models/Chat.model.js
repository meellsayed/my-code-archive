import mongoose, { model, Schema, Types } from "mongoose";

const chatSchema = new Schema(
  {
    mainUser: { type: Types.ObjectId, ref: "User", required: true },
    subParticipant: { type: Types.ObjectId, ref: "User", required: true },
    messages: [
      {
        message: { type: String, required: true },
        senderId: { type: Types.ObjectId, ref: "User", required: true },
      },
    ],
  },
  { timestamps: true },
);

export const chatModel = model.Chat || model("Chat",chatSchema);
