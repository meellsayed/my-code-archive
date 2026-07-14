import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose
    .connect(process.env.DB_URL, {
      serverSelectionTimeoutMS: 5000, // defult is 30 seconds
    })
    .then(() => {
      console.log("Connected to Mongoose");
    })
    .catch((err) => {
      console.error("Error connecting to DB", err);
    });
};

export default connectDB;
