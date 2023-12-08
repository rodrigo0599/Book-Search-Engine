import express from "express";
import path from "path";
import db from "./config/connection";
import { ApolloServer } from "@apollo/server";
import { typeDefs, resolvers } from "./schemas";
import { authMiddleware } from "./utils/auth";
import { expressMiddleware } from "@apollo/server/express4";

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

const startApolloServer = async () => {
  await server.start();

  app.use("/graphql", expressMiddleware(server, { context: authMiddleware }));

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")));

    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../client/dist/index.html"));
    });
  }

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};
startApolloServer();
