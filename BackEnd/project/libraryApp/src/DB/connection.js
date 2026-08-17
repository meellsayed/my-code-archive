import mongoose from "mongoose";

const connectDB = async () => {
  const dbUrl =
    process.env.DB_URL ||
    `mongodb://localhost:27017/${process.env.APP_NAME}?replicaSet=rs0`;
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
