import mongoose, { model, Schema, Types } from "mongoose";

const stockMovementSchema = new Schema(
  {
    book: { type: Types.ObjectId, ref: "Book" },
    seller: { type: Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["in", "out"] },
    customerType: {
      type: String,
      enum: ["User", "Customer", "Fast"],
    },
    customer: {
      type: Types.ObjectId,
      refPath: "customerType",
    },
    quantity: Number,
    price: Number,
    note: String,
  },
  { timestamps: true },
);

export const stockMovementModel =
  mongoose.models.StockMovement || model("StockMovement", stockMovementSchema);
