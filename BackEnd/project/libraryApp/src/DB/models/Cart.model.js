import mongoose, { model, Schema, Types } from "mongoose";

const orderSchema = new Schema({
  book: { type: Types.ObjectId, ref: "Book" },
  quantity: { type: Number, default: 1, min: 1 },
});

const cartSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User" },
    order: { type: [orderSchema], default: [] },
    createdBy: { type: Types.ObjectId, ref: "User" },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    isStaff: { type: Boolean, default: false },
    done: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const cartModel = mongoose.models.Cart || model("Cart", cartSchema);
