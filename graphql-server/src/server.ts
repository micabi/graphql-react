import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
// import { startStandaloneServer } from "@apollo/server/standalone";
import express  from "express";
import { createServer } from "http";
import { expressMiddleware } from "@as-integrations/express5";
import cors from "cors";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { typeDefs, resolvers } from "./graphql/schema";


// const todos: typeTodo[] = [
//   {
//     id: "1",
//     title: "GraphQL",
//     completed: false
//   },
//   {
//     id: "2",
//     title: "React",
//     completed: false
//   }
// ];

const prismaInstance = new PrismaClient();

const app = express();
const httpServer = createServer(app);

app.get("/", (_req, res) => {
  res.json({
    data: "🚀 Server is working..."
  });
});

// サーバー(GraphQLに必要なtypeDefsとresolversを引数として渡す)
const apolloserver = new ApolloServer( {
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({httpServer})]
} );

async function listenServer(): Promise<void> {
  await apolloserver.start();
  app.use("/todos",
    cors<cors.CorsRequest>({
      origin: 'http://localhost:5173', // アクセスを許可するorigin
      credentials: true, // レスポンスヘッダーにAccess-Control-Allow-Credentials追加
      optionsSuccessStatus: 200
    }),
    express.json(),
    expressMiddleware(apolloserver, {
    context: async (): Promise<{prismaInstance: PrismaClient}> => ({prismaInstance})
  }));
  httpServer.listen({port: process.env.PORT});
  console.log(`🚀 Express listen at http://localhost:${process.env.PORT}`);
  console.log(`🚀🚀🚀 GraphQL Server listen at http://localhost:${process.env.PORT}/todos 😀😀😀`);
}

listenServer();


// async function listenServer (): Promise<void> {
//   const { url } = await startStandaloneServer( apolloserver, {
//     context: async (): Promise<{ prismaInstance: PrismaClient; }> => ( { prismaInstance } ),
//     listen: {
//       port: 4000,
//     },
//   } );
//   console.log( `Server ready at: ${ url }` );
// }


// const { url } = await startStandaloneServer( apolloserver, {
//   context: async (): Promise<{ prismaInstance: PrismaClient; }> => ( { prismaInstance } ),
//   listen: {port: 4000,},
// } );

// console.log( `Server ready at: ${ url }` );