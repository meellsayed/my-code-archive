import mongoose, { model, Schema, Types } from "mongoose";

export const customerTypes = {
  online: "online",
  branch: "branch",
  onlineAndBranch: "onlineAndBranch",
};
const customerSchema = new Schema(
  {
    username: {
      type: String,
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
    isDeleted: { type: Boolean, default: false },
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
  mongoose.models.Customer || model("Customer", customerSchema);
