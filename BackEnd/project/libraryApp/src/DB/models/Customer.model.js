import { model, Schema, Types } from "mongoose";

export const customerTypes = {
  online: "online",
  branch: "branch",
  onlineAndBranch: "onlineAndBranch",
};
const customerSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      trim: true,
    },
    phone: { type: String, unique: true },
    address: { type: String },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },
    // user: { type: Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
    activeOrder: { type: Types.ObjectId, ref: "Cart" },
    type: {
      type: String,
      enum: Object.values(customerTypes),
      default: customerTypes.branch,
    },
    createdBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);


export const customerModel =
  model.Customer || model("Customer", customerSchema);
