// これらをいれても良い。
// import { type DocumentNode } from "graphql";
// import { gql } from "graphql-tag";

// どんなデータがあり、どんな関係性かschema.prismaに書くmodelに合わせて。
// フロント側で使う@apollo/clientでは
// import { gql } from "@apollo/client";
// const typeDefs = gql``;と書くが@apollo/clientはreactで使うモジュールなのでバック側では使えない。
// よってgql``ではなく`#graphql`と書く。
const typeDefs: string = `#graphql
  type Todo {
    id: Int!,
    title: String!,
    completed: Boolean!
  }

  type Query {
    getTodos: [Todo!]!
  }

  type Mutation {
    addTodo(title: String!): Todo!
    updateTodo(id: Int!, completed: Boolean!): Todo!
    deleteTodo(id: Int!): Todo!
  }
`;
export { typeDefs };