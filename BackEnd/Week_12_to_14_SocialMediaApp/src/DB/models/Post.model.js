import mongoose, { Schema, Types, model } from "mongoose";

const postSchema = new Schema(
  {
    content: {
      type: String,
      minlength: 2,
      maxlength: 500000,
      trim: true,
      required: function () {
        console.log(this);
        return this.attachments?.length ? false : true;
      },
    },
    attachments: [{ secure_url: String, public_id: String }],
    likes: [{ type: Types.ObjectId, ref: "User" }],
    tags: [{ type: Types.ObjectId, ref: "User" }],
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    deletedBy: { type: Types.ObjectId, ref: "User" },
    isDeleted: Date,
  },
  { timestamps: true },
);

export const postModel = model.post || model("Post", postSchema);
