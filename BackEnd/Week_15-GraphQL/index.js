import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import { createHandler } from "graphql-http/lib/use/express";
import playground from "graphql-playground-middleware-express";
import express from "express";

const app = express();
app.use(express.json());

const users = [
  { id: 1, username: "medo", email: "medo@gmail.com", password: "1234" },
  { id: 2, username: "ali", email: "ali@gmail.com", password: "1234" },
  { id: 3, username: "bya", email: "bya@gmail.com", password: "1234" },
];

const userType = new GraphQLObjectType({
  name: "oneUserResponse",
  fields: {
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
  },
});

// //? Construct a schema
// const schema = new GraphQLSchema({
//   query: new GraphQLObjectType({
//     name: "Query",
//     fields: {
//       hello: {
//         type: GraphQLString,
//         resolve: () => "Hello world!",
//       },
//     },
//   }),
// });

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "getOneUser",
    fields: {
      getOneUser: {
        type: new GraphQLObjectType({
          name: "returnVal",
          fields: {
            message: { type: GraphQLString },
            statusCode: { type: GraphQLInt },
            data: { type: userType },
          },
        }),
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: (parent, args) => {
          const { id } = args;
          console.log(id);
          const user = users.find((user) => user.id == id);
          return { message: "message 123", statusCode: 200, data: user };
        },
      },
      listAllUsers: {
        type: new GraphQLObjectType({
          name: "getAllUsers",
          fields: {
            message: { type: GraphQLString },
            statusCode: { type: GraphQLInt },
            data: { type: new GraphQLList(userType) },
          },
        }),
        resolve: (parent, args) => {
          return {
            message: "done",
            statusCode: 200,
            data: users,
          };
        },
      },
    },
  }),
  mutation:new GraphQLObjectType({
    name: "Query",
    fields: {
      hi: {
        type: GraphQLString,
        resolve: () => "Hello world!",
      },
    },
  }),

});

// Create and use the GraphQL handler.
app.get("/gui", playground.default({ endpoint: "/graphql" }));
app.use(
  "/graphql",
  createHandler({
    schema: schema,
  }),
);

// Start the server at port
app.listen(3000);
console.log("Running a GraphQL API server at http://localhost:3000/gui");
