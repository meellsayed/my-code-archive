import morgan from "morgan";
import connectedDB from "./DB/connection.js";
import auth from "./module/auth/auth.controller.js";
import user from "./module/user/user.controller.js";
import { globalErrorHandling } from "./util/error/error.js";

const bootstrap = (app, express) => {
  app.use(express.json());
  app.use(morgan("dev"));

  app.use("/auth", auth);
  app.use("/user", user);

  app.use((req, res, next) => {
    res.status(404).json({ message: "Page not find 404" });
    next();
  });
  
  app.use(globalErrorHandling);
  // DB
  connectedDB();
};

export default bootstrap;
