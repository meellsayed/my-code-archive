import connectDB from "./DB/connection.js";
import userRouter from "./modules/user/user.controller.js";
import authRouter from "./modules/auth/auth.controller.js";
import { globalErrorHandling } from "./utils/response/error.response.js";
import morgan from "morgan";

const bootstrap = (app, express) => {
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/", (req, res) => {
    res.json("Hello, World!");
  });
 
  app.use("/user", userRouter);
  app.use("/auth", authRouter);

  
  //! Error handle
  app.use(globalErrorHandling)
  //* DB connection
  connectDB();
};

export default bootstrap;
