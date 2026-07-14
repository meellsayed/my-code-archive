import authRouter from "../auth.controller.js";

export const login = (req, res, next) => {

  res.json({ message: "User login successful" });
};