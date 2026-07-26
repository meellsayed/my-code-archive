import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
} from "graphql";
import { postModel } from "../../DB/models/Post.model.js";
import { userModel } from "../../DB/models/User.model.js";
import * as dbService from "../../DB/db.service.js";

const AttachmentType = new GraphQLObjectType({
  name: "Attachment",
  fields: {
    secure_url: { type: GraphQLString },
    public_id: { type: GraphQLString },
  },
});

export const PostType = new GraphQLObjectType({
  name: "Post",
  fields: {
    _id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    attachments: { type: new GraphQLList(AttachmentType) },
    likes: { type: new GraphQLList(GraphQLID) },
    tags: { type: new GraphQLList(GraphQLString) },
    isDeleted: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    createdBy: {
      type: new GraphQLObjectType({
        name: "PostAuthor",
        fields: {
          _id: { type: GraphQLID },
          username: { type: GraphQLString },
          image: { type: GraphQLString },
        },
      }),
      resolve: async (parent) => {
        if (!parent.createdBy) return null;
        return dbService.findOne({
          model: userModel,
          filter: { _id: parent.createdBy },
          select: "username image",
        });
      },
    },
  },
});

export const postQueries = {
  posts: {
    type: new GraphQLList(PostType),
    args: {
      page: { type: GraphQLInt, defaultValue: 1 },
      limit: { type: GraphQLInt, defaultValue: 10 },
    },
    resolve: async (_, args) => {
      const { page, limit } = args;
      return dbService.find({
        model: postModel,
        filter: { isDeleted: null },
        limit,
        skip: (page - 1) * limit,
      });
    },
  },
  post: {
    type: PostType,
    args: {
      _id: { type: new GraphQLNonNull(GraphQLID) },
    },
    resolve: async (_, args) => {
      return dbService.findOne({
        model: postModel,
        filter: { _id: args._id, isDeleted: null },
      });
    },
  },
};

export const postMutations = {
  createPost: {
    type: PostType,
    args: {
      title: { type: new GraphQLNonNull(GraphQLString) },
      content: { type: GraphQLString },
      tags: { type: GraphQLString },
    },
    resolve: async (_, args, context) => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }
      const { title, content, tags } = args;
      return dbService.create({
        model: postModel,
        data: {
          title,
          content,
          tags: tags ? tags.split(",") : [],
          createdBy: context.user._id,
        },
      });
    },
  },
};
