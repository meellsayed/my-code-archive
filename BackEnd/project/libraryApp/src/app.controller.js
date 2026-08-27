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
import stockRouter from "./modules/stock/stock.controller.js";
import ReportRouter from "./modules/report/report.controller.js";
/**
 * @param {import('express').Application} app
 * @param {typeof import('express')} express
 */
const bootstrap = (app, express) => {
  //DB connection
  connectDB();
  app.use(cors());
  app.use(express.json());
  app.use(morgan(process.env.MOOD == "DEV" ? "dev" : "common"));

  // app.use("/user", userRouter);
  app.use("/api/v1/auth", authRouter); //* Done
  app.use("/api/v1/users", userRouter);

  // Book
  app.use("/api/v1/books", bookRouter); //* Done
  app.use("/api/v1/authors", authorRouter); //* Done
  app.use("/api/v1/categories", categoryRouter); //* Done

  // Order
  app.use("/api/v1/cart", cartRouter); //* Done
  app.use("/api/v1/orders", orderRouter);
  app.use("/api/v1/customer", customerRouter);

  app.use("/api/v1/stock", stockRouter); // I well not used it

  app.use("/api/v1/report", ReportRouter);
  // app.use("", (req, res, next) => {
  //   return next(new Error("Page not found", { cause: 404 }));
  // });
  app.use(globalErrorHandling);
};

export default bootstrap;
