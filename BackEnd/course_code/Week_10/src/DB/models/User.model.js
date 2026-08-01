import mongoose, { Schema, Types, model } from "mongoose";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: [true, "userName is required"],
      minLength: [2, "${VALUE} < minimum length (2)."],
      maxLength: [50, "${VALUE} > maximum length (50)."],
      trim: true,
      validate: {
        validator: function (value) {
          if (value == "admin") {
            return false;
          }else if (value == "user")
          {
            throw new Error("userName can not be user")
          }
          return true
        },
        message: (props) => `userName can not be ${props.value} `,
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },
    phone: String,
    DOB: Date,
    salary: {
      type: Number,
      min: 1000,
      max: 50000,
      default: 2000,
    },
  },
  { timestamps: true },
);

const userModel =mongoose.models.User || model("User", userSchema);
// mongoose.models.User to not re defined it's make errors in database

export default userModel;
