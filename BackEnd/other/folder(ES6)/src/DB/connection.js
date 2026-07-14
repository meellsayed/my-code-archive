import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose
    .connect("mongodb://localhost:27017/saraha", {
      serverSelectionTimeoutMS: 5000, // defult is 30 seconds
      
    })
    .then(() => {
      console.log("Connected to Mongoose");
    })
    .catch((err) => {
      console.error("Error connecting to Mongoose", err);
    });
};

export default connectDB;
