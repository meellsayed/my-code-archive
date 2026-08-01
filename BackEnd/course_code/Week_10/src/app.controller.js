import connectDB from "./DB/connection.js";
import * as errors from "./middlewares/errorHandeling.js";
import userRouter from "./modules/user/user.controller.js";
import authRouter from "./modules/auth/auth.controller.js";
import morgan from "morgan";

// @ts-ignore
const bootstrap = (app, express) => {
  app.use(express.json());
  //   app.use((req, res, next) => {
  //     console.log(
  //       `[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`,
  //     );
  //     next();
  //   });
  app.use(morgan("dev"));
  // @ts-ignore
  app.get("/", (req, res) => {
    res.json("Hello, World!");
  });

  app.use("/user", userRouter);
  app.use("/auth", authRouter);

  app.use(errors.notFound);
  app.use(errors.errorHandler);
  //DB connection
  connectDB();
};

export default bootstrap;
