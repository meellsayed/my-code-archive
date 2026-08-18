import morgan from "morgan";
import cors from "cors";
import connectDB from "./DB/connection.js";
import { globalErrorHandling } from "./utils/response/error.response.js";
import userRouter from "./modules/user/user.controller.js";
import authRouter from "./modules/auth/auth.controller.js";
import bookRouter from "./modules/book/book.controller.js";
import authorRouter from "./modules/author/author.controller.js";
import categoryRouter from "./modules/category/category.controller.js";
import orderRouter from "./modules/order/order.controller.js";
import customerRouter from "./modules/customer/customer.controller.js";
import cartRouter from "./modules/cart/cart.controller.js";
/**
 * @param {import('express').Application} app
 * @param {typeof import('express')} express
 */
const bootstrap = (app, express) => {
  //DB connection
  connectDB();
  app.use(cors());
  app.use(express.json());
  app.use(morgan(process.env.MOOD == "DEV" ? "dev" : "tiny"));
  app.get("/", (req, res, next) => {
    return res.json({ message: "Server is running" });
  });

  // app.use("/user", userRouter);
  app.use("/auth", authRouter);
  app.use("/book", bookRouter);
  app.use("/author", authorRouter);
  app.use("/category", categoryRouter);

  app.use("/order", orderRouter);
  app.use("/customer", customerRouter);
  app.use("/cart", cartRouter);

  app.use(globalErrorHandling);
};

export default bootstrap;
