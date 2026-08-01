import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
} from "graphql";
import { userModel } from "../../DB/models/User.model.js";
import * as dbService from "../../DB/db.service.js";
import { generateHash, compareHash } from "../../utils/security/hash.js";
import { generate_access_token, generate_refresh_token } from "../../utils/security/token.js";
import sendEmailEvent from "../../utils/event/send.email.event.js";
import { UserType } from "./user.graph.js";

const AuthPayload = new GraphQLObjectType({
  name: "AuthPayload",
  fields: {
    message: { type: GraphQLString },
    access_token: { type: GraphQLString },
    refresh_token: { type: GraphQLString },
    user: { type: UserType },
  },
});

export const authMutations = {
  signup: {
    type: AuthPayload,
    args: {
      username: { type: new GraphQLNonNull(GraphQLString) },
      email: { type: new GraphQLNonNull(GraphQLString) },
      password: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_, args) => {
      const { username, email, password } = args;

      const existing = await dbService.findOne({ model: userModel, filter: { email } });
      if (existing) {
        throw new Error("Email already exists");
      }

      const hashPassword = generateHash({ plainText: password });
      const code = Math.floor(10000 + Math.random() * 90000).toString();

      const user = await dbService.create({
        model: userModel,
        data: {
          username,
          email,
          password: hashPassword,
          confirmEmailOTP: generateHash({ plainText: code }),
        },
      });

      sendEmailEvent.emit("confirmEmail", { email, code });

      return {
        message: "User created. Please confirm your email.",
        user,
      };
    },
  },
  login: {
    type: AuthPayload,
    args: {
      email: { type: new GraphQLNonNull(GraphQLString) },
      password: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_, args) => {
      const { email, password } = args;

      const user = await dbService.findOne({ model: userModel, filter: { email } });
      if (!user) {
        throw new Error("Invalid email or password");
      }
      if (!compareHash({ plainText: password, hashValue: user.password })) {
        throw new Error("Invalid email or password");
      }
      if (!user.confirmEmail) {
        throw new Error("Please verify your account first");
      }

      const access_token = generate_access_token(user);
      const refresh_token = generate_refresh_token(user);

      return { message: "Done", access_token, refresh_token, user };
    },
  },
};
