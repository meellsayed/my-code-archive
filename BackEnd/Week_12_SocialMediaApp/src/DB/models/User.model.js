import mongoose, { Schema, Types, model } from "mongoose";

export const genderTypes = { male: "male", female: "female" };
export const roleTypes = { user: "user", admin: "admin" };
const profileViewSchema = new Schema(
  {
    viewerId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    attempts: {
      type: [Date],
      default: [],
    },
  },
  { _id: false },
);
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: { type: String, require: true },
    phone: { type: String },
    DOB: Date,
    address: String,
    image: String,
    coverImages: [String],
    gender: {
      type: String,
      enum: Object.values(genderTypes),
      default: genderTypes.male,
    },
    role: {
      type: String,
      enum: Object.values(roleTypes),
      default: roleTypes.user,
    },
    isDeleted: { type: Boolean, default: false },
    changeCredentialsTime: Date,

    profileViewHistory: {
      type: [profileViewSchema],
      default: [],
    },

    isTwoStepVerification: Boolean,

    confirmEmail: { type: Boolean, default: false },
    confirmEmailOTP: String,
    loginConfirmationOTP: String,
    enable2faOTP: String,
    forgetPasswordOTP: String,
    OTPExpiresIn: Date,

    blockedUsers: {
      type: [
        {
          type: Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export const userModel = model.User || model("User", userSchema);
