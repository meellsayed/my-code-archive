import mongoose, { model, Schema, Types } from "mongoose";
import { generateHash } from "../../utils/security/hash.js";
export const roleTypes = {
  admin: "admin",
  staff: "staff",
  customer: "customer",
};
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      trim: true,
    },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    address: { type: String },
    image: String,
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },
    password: { type: String, required: true },
    otp: String,
    confirmEmail: { type: Boolean, default: false },
    changeCredentialsTime: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
    role: {
      type: String,
      enum: Object.values(roleTypes),
      default: roleTypes.customer,
    },
  },
  { timestamps: true },
);
export const userSelect =
  "username email phone address image gender isDeleted role";

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await generateHash({ plainText: this.password, salt: 10 });
});

export const userModel = mongoose.models.User || model("User", userSchema);
