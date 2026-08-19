import mongoose, { model, Schema, Types } from "mongoose";

const orderSchema = new Schema(
  {
    customerType: {
      type: String,
      enum: ["User", "Customer"],
      required: true,
    },
    customer: {
      type: Types.ObjectId,
      refPath: "customerType",
      required: true,
    },
    seller: { type: Types.ObjectId, ref: "User" },
    cart: { type: Types.ObjectId, ref: "Cart" },

    note: { type: String },
    discount: { type: Number, min: 0 },
    tax: { type: Number, min: 0 },
    address: String,
    total: { type: Number },
    paymentMethod: { type: String },
    status: {
      type: String,
      enum: [
        "new",
        "in_processing",
        "ready_to_ship",
        "shipped",
        "delivered",
        "canceled",
      ],
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const orderModel = mongoose.models.Order || model("Order", orderSchema);
