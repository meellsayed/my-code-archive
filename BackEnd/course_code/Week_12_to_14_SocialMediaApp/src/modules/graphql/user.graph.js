import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
} from "graphql";
import { userModel } from "../../DB/models/User.model.js";
import { postModel } from "../../DB/models/Post.model.js";
import * as dbService from "../../DB/db.service.js";
import { PostType } from "./post.graph.js";

export const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    _id: { type: GraphQLID },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    DOB: { type: GraphQLString },
    address: { type: GraphQLString },
    image: { type: GraphQLString },
    coverImages: { type: new GraphQLList(GraphQLString) },
    gender: { type: GraphQLString },
    role: { type: GraphQLString },
    confirmEmail: { type: GraphQLBoolean },
    isTwoStepVerification: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (parent) => {
        return dbService.find({ model: postModel, filter: { createdBy: parent._id } });
      },
    },
  },
});

export const userQueries = {
  users: {
    type: new GraphQLList(UserType),
    args: {
      page: { type: GraphQLInt, defaultValue: 1 },
      limit: { type: GraphQLInt, defaultValue: 10 },
    },
    resolve: async (_, args) => {
      const { page, limit } = args;
      return dbService.find({
        model: userModel,
        filter: { isDeleted: false },
        limit,
        skip: (page - 1) * limit,
        select: "-password -confirmEmailOTP -loginConfirmationOTP -enable2faOTP -forgetPasswordOTP -OTPExpiresIn",
      });
    },
  },
  user: {
    type: UserType,
    args: {
      _id: { type: new GraphQLNonNull(GraphQLID) },
    },
    resolve: async (_, args) => {
      return dbService.findOne({
        model: userModel,
        filter: { _id: args._id, isDeleted: false },
        select: "-password -confirmEmailOTP -loginConfirmationOTP -enable2faOTP -forgetPasswordOTP -OTPExpiresIn",
      });
    },
  },
};
