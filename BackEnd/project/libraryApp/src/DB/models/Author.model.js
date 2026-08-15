import mongoose, { model, Schema, Types } from "mongoose";

const authorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    image: String,
    bio: String,
    birthDate: Date,
    deathDate: Date,
    createdBy: { type: Types.ObjectId, ref: "User" },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const authorModel =
  mongoose.models.Author || model("Author", authorSchema);
  