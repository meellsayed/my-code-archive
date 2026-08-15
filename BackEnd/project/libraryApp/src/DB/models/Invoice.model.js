import mongoose, { model, Schema, Types } from "mongoose";

const invoiceSchema = new Schema(
  {
    customer: { type: Types.ObjectId, ref: "Customer" },
    seller: { type: Types.ObjectId, ref: "User" },
    items: { type: Types.ObjectId, ref: "Cart" },

    note: { type: String },
    discount: { type: Number, min: 0 },
    tax: { type: Number, min: 0 },
    address: String,
    total: { type: Number },
    paymentMethod: { type: String },
    status: { type: String, enum: ["new", "canceled", "delivered", "done"] },

    createdBy: { type: Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const invoiceModel =
  mongoose.models.Invoice || model("Invoice", invoiceSchema);
