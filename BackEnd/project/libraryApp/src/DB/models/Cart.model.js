import mongoose, { model, Schema, Types } from "mongoose";

const orderSchema = new Schema({
  book: { type: Types.ObjectId, ref: "Book", required: true },
  price: { type: Number },
  quantity: { type: Number, default: 1, min: 1 },
});

const cartSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    items: { type: [orderSchema], default: [] },
    createdBy: { type: Types.ObjectId, ref: "User" },
    isStaff: { type: Boolean, default: false },
    done: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const cartModel = mongoose.models.Cart || model("Cart", cartSchema);
