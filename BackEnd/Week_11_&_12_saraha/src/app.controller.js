import connectDB from "./DB/connection.js";
import userRouter from "./modules/user/user.controller.js";
import authRouter from "./modules/auth/auth.controller.js";
import morgan from "morgan";
import { globalErrorHandling } from "./utils/error/error.js";

const bootstrap = (app, express) => {
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/", (req, res) => {
    res.json("Hello, World!");
  });

  app.use("/user", userRouter);
  app.use("/auth", authRouter);

  app.use(globalErrorHandling);

  //DB connection
  connectDB();
};

export default bootstrap;
