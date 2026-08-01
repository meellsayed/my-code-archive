import mongoose from "mongoose";
const connectedDB = async () => {
  await mongoose
    .connect(process.env.DB_URL)
    .then(() => {
      console.log("Connected to DB");
    })
    .catch((err) => {
      console.error("Connected to DB is have ERROR", err);
    });
};

export default connectedDB