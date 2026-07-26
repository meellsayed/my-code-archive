 import {
  graphql,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";

export const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: "mainQuery",
      fields: {
        welcome: {
          type: GraphQLString,
          resolve: (parent, args) => {
            return "Hello from graphql";
          },
        },
      },
    }),
  });

  