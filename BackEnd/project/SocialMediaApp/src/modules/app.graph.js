import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import { userQueries } from "./graphql/user.graph.js";
import { postQueries, postMutations } from "./graphql/post.graph.js";
import { authMutations } from "./graphql/auth.graph.js";

const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    welcome: {
      type: GraphQLString,
      resolve: () => "Hello from GraphQL",
    },
    ...userQueries,
    ...postQueries,
  },
});

const RootMutation = new GraphQLObjectType({
  name: "RootMutation",
  fields: {
    ...authMutations,
    ...postMutations,
  },
});

export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});
