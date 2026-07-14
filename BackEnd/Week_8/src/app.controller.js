import authController from "./modules/auth/auth.controller.js";
import userController from "./modules/user/user.controller.js";
import * as DB from "./DB/connection.js";

const bootstrap = (app, express) => {
  // const app = express() // it's running but Thatcher not use it
  app.use(express.json()); // Buffer to json

  app.get("/", (req, res, next) => {
    res.json({ message: "Welcome to the Home page" });
  });

  // sub routeing
  app.use("/auth", authController);
  app.use("/user", userController);
  DB.checkConnection();
  DB.syncConnection();
};

export default bootstrap;
