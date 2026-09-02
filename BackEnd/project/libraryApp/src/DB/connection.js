import mongoose from "mongoose";

const connectDB = async () => {
  const dbUrl =
    process.env.DB_URI || `mongodb://localhost:27017/${process.env.APP_NAME}`;
  await mongoose
    .connect(dbUrl, {
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
