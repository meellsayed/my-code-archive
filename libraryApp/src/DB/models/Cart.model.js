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
    done: { type: Boolean, default: false }, // will be status
  },
  { timestamps: true },
);

export const cartModel = mongoose.models.Cart || model("Cart", cartSchema);
