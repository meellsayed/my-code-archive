import { model, Schema, Types } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: String,
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const categoryModel =
  model.Category || model("Category", categorySchema);
