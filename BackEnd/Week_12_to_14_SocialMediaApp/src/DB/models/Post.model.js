import { Schema, Types, model } from "mongoose";

const postSchema = new Schema(
  {
    title: {
      type: String,
      minlength: 2,
      maxlength: 5000,
      trim: true,
      required: true,
    },
    content: {
      type: String,
      minlength: 2,
      maxlength: 500000,
      trim: true,
      required: function () {
        return this.attachments?.length ? false : true;
      },
    },
    attachments: [{ secure_url: String, public_id: String }],
    likes: [{ type: Types.ObjectId, ref: "User" }],
    tags: [{ type: String }],
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    deletedBy: { type: Types.ObjectId, ref: "User" },
    viewers: [{ type: Types.ObjectId, ref: "User" }],
    isDeleted: Date,
  },
  { timestamps: true },
);

export const postModel = model.Post || model("Post", postSchema);
