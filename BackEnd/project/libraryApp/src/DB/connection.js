import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose
    .connect(`mongodb://localhost:27017/${process.env.APP_NAME}`, {
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => {
      console.log("Connected to DataBase");
    })
    .catch((err) => {
      console.error("Error connecting to DataBase", err);
    });
};

export default connectDB;
