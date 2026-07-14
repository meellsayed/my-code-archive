import connectDB from "./DB/connection.js";
import * as errors from "./middlewares/errorHandeling.js";
import userRouter from "./modules/user/user.controller.js";
import authRouter from "./modules/auth/auth.controller.js";

const bootstrap = (app, express) => {
  app.use(express.json());

  app.get("/", (req, res) => {
    res.json("Hello, World!");
  });
 
  app.use("/api/users", userRouter);
  app.use("/api/auth", authRouter);

  app.use(errors.notFound);
  app.use(errors.errorHandler);
  //DB connection
  connectDB();
};

export default bootstrap;
