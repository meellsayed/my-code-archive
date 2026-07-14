import { checkDBConnection } from "./DB/connection.js";
import auth from "./modules/auth/auth.controller.js";
import user from "./modules/user/user.controller.js";
const bootstrap = (app, express) => {
  app.use(express.json());
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });
  app.use("/auth", auth);
  app.use("/user", user);
  //   app.all("/*splat", (req, res) => {
  //     res.status(404).json({ message: "Route not found" });
  //   });
  app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  // DB
  checkDBConnection();
};

export default bootstrap;
