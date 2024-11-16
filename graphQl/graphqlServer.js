const { ApolloServer } = require('apollo-server-express');
const fs = require('fs');
const path = require('path');
const resolvers = require('./resolvers'); 

const configureGraphQLServer = (app) => {
  const typeDefs = fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf-8');

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || '';
      return { token };
    },
  });

  server.start().then(() => {
    server.applyMiddleware({ app, path: '/graphql' });
    console.log(`GraphQL server ready at http://localhost:${process.env.PORT || 8080}/graphql`);
  });
};

module.exports = configureGraphQLServer;
