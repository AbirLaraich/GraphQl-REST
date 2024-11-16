const request = require("supertest");
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const fs = require("fs");
const path = require("path");
const verifyToken = require("../middleware/verifyToken");
const jwt = require("jsonwebtoken");
const typeDefs = fs.readFileSync(
  path.join(__dirname, "../graphQl", "schema.graphql"),
  "utf-8"
);
const resolvers = require("../graphQl/resolvers");

const userService = require("../service/UsersService");

const mockAgent = {
  id: "67377b320a88c40a626a5cb3",
  email: "laraich.abir2002@gmail.com",
  name: "Abir LARAICH",
  role: "agent",
};

jest.mock("../service/UsersService");
jest.mock("jsonwebtoken");

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const app = express();
app.use(express.json());
app.use(
  "/graphql",
  verifyToken,
  graphqlHTTP((req) => ({
    schema,
    graphiql: false,
    context: { user: req.user },
  }))
);

describe("User GraphQL Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  describe("Public Mutations", () => {
    it("should create a new user successfully", async () => {
      const newUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        role: "client",
      };

      userService.createUser.mockResolvedValue(newUser);

      const response = await request(app)
        .post("/graphql")
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
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createUser).toEqual({
        success: true,
        message: "Utilisateur créé avec succès",
        user: newUser,
      });
      expect(userService.createUser).toHaveBeenCalledWith({
        email: "test@example.com",
        name: "Test User",
        password: "password123",
        role: "client",
      });
    });

    it("should handle user creation errors", async () => {
      userService.createUser.mockRejectedValue(
        new Error("L'email existe déjà")
      );

      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
              mutation {
                createUser(
                  email: "existing@example.com"
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
            `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.createUser).toEqual({
        success: false,
        message: "L'email existe déjà",
        user: null,
      });
    });
  });
  describe("Protected Queries", () => {
    describe("With Valid Authentication", () => {
      beforeEach(() => {
        jwt.verify.mockImplementation(() => ({ email: mockAgent.email }));
        userService.getUserByEmail.mockResolvedValue(mockAgent);
      });

      it("should fetch user by email", async () => {
        const targetUser = {
          id: "2",
          email: "target@example.com",
          name: "Target User",
          role: "client",
        };

        userService.getUserByEmail.mockImplementation((email) => {
          if (email === targetUser.email) return targetUser;
          if (email === mockAgent.email) return mockAgent;
          return null;
        });

        const response = await request(app)
          .post("/graphql")
          .set("Authorization", "Bearer valid-token")
          .send({
            query: `
              query {
                user(email: "target@example.com") {
                  id
                  email
                  name
                  role
                }
              }
            `,
          });

        expect(response.status).toBe(200);
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.user).toEqual(targetUser);
      });
    });
    it("should return null for non-existent user", async () => {
      userService.getUserByEmail.mockImplementation((email) => {
        if (email === mockAgent.email) return mockAgent;
        return null;
      });

      const response = await request(app)
        .post("/graphql")
        .set("Authorization", "Bearer valid-token")
        .send({
          query: `
              query {
                user(email: "nonexistent@example.com") {
                  id
                  email
                  name
                  role
                }
              }
            `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.user).toBeNull();
    });
  });
});
