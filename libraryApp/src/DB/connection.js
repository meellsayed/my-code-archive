import mongoose from "mongoose";

const connectDB = async () => {
  const dbUrl =
    process.env.DB_URL || `mongodb+srv://mohamedeltt1_db_user:1234@cluster0.6ggwblo.mongodb.net/${process.env.APP_NAME}`;
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
