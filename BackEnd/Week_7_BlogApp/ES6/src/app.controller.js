import * as authController from "./modules/auth/auth.controller.js";

export const bootstrap = (app,express)=>{
    app.use(express.json())
  app.get("/", (req, res, next) => res.json({ message: "done from app.controller.js" }));

    app.use("/auth",authController.router)
}
