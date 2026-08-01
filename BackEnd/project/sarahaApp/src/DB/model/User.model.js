import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    minLength: 2,
    maxLength: 25,
    trim: true,
    required: [true, "userName is required"],
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    default: "male",
  },
  DOB: Date,
  address: String,
  phone: String,
  image: String,
  confirmEmail: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["User", "admin"],
    default: "User",
  },
});

const User = mongoose.models.User || model("User", userSchema);

export default User
