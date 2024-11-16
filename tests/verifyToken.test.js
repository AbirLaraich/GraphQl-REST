const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/verifyToken");
const userService = require("../service/UsersService");

jest.mock("jsonwebtoken");
jest.mock("../service/UsersService");

const mockUser = {
  id: "67377b320a88c40a626a5cb3",
  email: "laraich.abir2002@gmail.com",
  role: "agent",
};

const app = express();
app.use(express.json());

app.post("/graphql", verifyToken, (req, res) => {
  const query = `
    mutation {
      updateAnnonce(id: "123", input: {
        titre: "Test"
      }) {
        success
        message
      }
    }
  `;
  if (req.user) {
    res.json({
      data: {
        user: req.user,
        message: "Accès autorisé",
      },
    });
  } else {
    res.status(req.statusCode || 200).json({
      errors: [{ message: req.errorMessage }],
    });
  }
});

describe("verifyToken middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";

    jwt.verify.mockImplementation((token, secret) => {
      if (token === "valid-token") {
        return { email: mockUser.email };
      }
      throw new jwt.JsonWebTokenError("Token invalide");
    });

    userService.getUserByEmail.mockImplementation((email) => {
      if (email === mockUser.email) {
        return Promise.resolve(mockUser);
      }
      return Promise.reject(new Error("Utilisateur non trouvé"));
    });
  });

  it("should allow access to protected mutation with valid token", async () => {
    const response = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer valid-token`)
      .send({
        query: `
          mutation {
            updateAnnonce(id: "123", input: { titre: "Test" }) {
              success
              message
            }
          }
        `,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.user).toEqual(mockUser);
    expect(response.body.data.message).toBe("Accès autorisé");
    expect(jwt.verify).toHaveBeenCalled();
    expect(userService.getUserByEmail).toHaveBeenCalledWith(mockUser.email);
  });

  it("should handle invalid token", async () => {
    const response = await request(app)
      .post("/graphql")
      .set("Authorization", "Bearer invalid-token")
      .send({
        query: `
          mutation {
            updateAnnonce(id: "123", input: { titre: "Test" }) {
              success
              message
            }
          }
        `,
      });

    expect(response.status).toBe(401);
    expect(response.body.errors[0].message).toBe("Token invalide");
  });

  it("should require authentication for protected operations", async () => {
    const response = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            updateAnnonce(id: "123", input: { titre: "Test" }) {
              success
              message
            }
          }
        `,
      });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors[0].message).toBe(
      "Cette opération nécessite une authentification"
    );
  });

  it("should handle database errors", async () => {
    jwt.verify.mockReturnValue({ email: mockUser.email });
    userService.getUserByEmail.mockRejectedValue(
      new Error("Erreur base de données")
    );

    const response = await request(app)
      .post("/graphql")
      .set("Authorization", "Bearer valid-token")
      .send({
        query: `
          mutation {
            updateAnnonce(id: "123", input: { titre: "Test" }) {
              success
              message
            }
          }
        `,
      });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors[0].message).toBe(
      "Erreur lors de la récupération de l'utilisateur"
    );
  });

  it("should allow public queries without token", async () => {
    const response = await request(app)
      .post("/graphql")
      .send({
        query: `
          query {
            annonces {
              id
              titre
            }
          }
        `,
      });

    expect(response.status).toBe(200);
  });
});
