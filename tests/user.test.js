const request = require('supertest');
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const fs = require('fs');
const path = require('path');
const verifyToken = require('../middleware/verifyToken');

const typeDefs = fs.readFileSync(path.join(__dirname, '../graphQl', 'schema.graphql'), 'utf-8');
const resolvers = require('../graphQl/resolvers');

const userService = require('../service/UsersService');

jest.mock('../service/UsersService');
jest.mock('jsonwebtoken');

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const app = express();
app.use(express.json());
app.use(
  '/graphql',
  verifyToken,
  graphqlHTTP((req) => ({
    schema,
    graphiql: false,
    context: { user: req.user }
  }))
);

describe('User GraphQL Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('Public Mutations', () => {
    it('should create a new user successfully', async () => {
      const newUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'client'  
      };

      userService.createUser.mockResolvedValue(newUser);

      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation {
              createUser(
                email: "test@example.com"
                name: "Test User"
                password: "password123"
                role: client
              ) {
                success
                message
                user {
                  id
                  email
                  name
                  role
                }
              }
            }
          `
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createUser).toEqual({
        success: true,
        message: "Utilisateur créé avec succès",
        user: newUser
      });
      expect(userService.createUser).toHaveBeenCalledWith({
        email: "test@example.com",
        name: "Test User",
        password: "password123",
        role: "client"
      });
    });       
  });
});