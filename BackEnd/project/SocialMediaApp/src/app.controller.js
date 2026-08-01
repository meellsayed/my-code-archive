import connectDB from "./DB/connection.js";
import userRouter from "./modules/user/user.controller.js";
import authRouter from "./modules/auth/auth.controller.js";
import postRouter from "./modules/post/post.controller.js";
import chatRouter from "./modules/chat/chat.controller.js";

import { globalErrorHandling } from "./utils/response/error.response.js";
import morgan from "morgan";

import { createHandler } from "graphql-http/lib/use/express";
import playground from "graphql-playground-middleware-express";
import { schema } from "./modules/app.graph.js";
import { decodedToken, tokenTypes } from "./utils/security/token.js";

/**
 * @param {import('express').Application} app
 * @param {typeof import('express')} express
 */
const bootstrap = (app, express) => {
  connectDB();

  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/", (req, res) => {
    res.json("Hello, World!");
  });
  app.use(
    "/graphql",
    createHandler({
      schema,
      context: async (req) => {
        const authorization = req.headers.authorization;
        if (!authorization) return {};
        try {
          const user = await decodedToken({
            authorization,
            tokenType: tokenTypes.access,
          });
          return { user };
        } catch {
          return {};
        }
      },
    }),
  );
  app.get("/playground", playground.default({ endpoint: "/graphql" }));

  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/chat", chatRouter);
  app.use("/post", postRouter);

  app.use(globalErrorHandling);
};

export default bootstrap;
