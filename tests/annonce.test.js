const request = require('supertest');
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');

const typeDefs = fs.readFileSync(path.join(__dirname, '../graphQl', 'schema.graphql'), 'utf-8');
const resolvers = require('../graphQl/resolvers');

const AnnonceService = require('../service/AnnoncesService');
const userService = require('../service/UsersService');

const mockUser = {
  id: '67377b320a88c40a626a5cb3',
  email: 'laraich.abir2002@gmail.com',
  role: 'agent'
};
jest.mock("../service/AnnoncesService");
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

describe("GraphQL Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  describe("Public Queries", () => {
    it("should fetch all annonces without authentication", async () => {
      const mockAnnonces = [
        { id: "1", titre: "Annonce 1", prix: 1200, typeBien: "vente" },
        { id: "2", titre: "Annonce 2", prix: 1500, typeBien: "location" },
      ];

      AnnonceService.getAllAnnonces.mockResolvedValue(mockAnnonces);

      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            query {
              annonces {
                id
                titre
                prix
                typeBien
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.annonces).toEqual(mockAnnonces);
    });
    it("should fetch a single annonce by ID without authentication", async () => {
      const mockAnnonce = {
        id: "1",
        titre: "Annonce 1",
        prix: 1200,
        typeBien: "vente",
      };

      AnnonceService.getAnnonceById.mockResolvedValue(mockAnnonce);

      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            query {
              annonce(id: "1") {
                id
                titre
                prix
                typeBien
              }
            }
          `,
        });
      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.annonce).toEqual(mockAnnonce);
    });
  });
  describe('Protected Mutations', () => {
    describe('With Agent Role', () => {
      beforeEach(() => {
        jwt.verify.mockImplementation(() => ({ email: mockUser.email }));
        userService.getUserByEmail.mockResolvedValue(mockUser);
      });

      it('should create a new annonce successfully', async () => {
        const mockNewAnnonce = {
          id: '1',
          titre: 'Nouvelle annonce',
          description: 'Une belle annonce',
          prix: 1200,
          statutPublication: 'publiee',
          typeBien: 'vente',
          statutBien: 'disponible',
          photos: ['photo1.jpg', 'photo2.jpg']
        };

        AnnonceService.createAnnonce.mockResolvedValue(mockNewAnnonce);

        const response = await request(app)
          .post('/graphql')
          .set('Authorization', 'Bearer valid-token')
          .send({
            query: `
              mutation {
                createAnnonce(input: {
                  titre: "Nouvelle annonce"
                  description: "Une belle annonce"
                  prix: 1200
                  statutPublication: publiee
                  dateDisponibilite: "2024-12-01"
                  typeBien: vente
                  statutBien: disponible
                  photos: ["photo1.jpg", "photo2.jpg"]
                }) {
                  success
                  message
                  annonce {
                    id
                    titre
                    prix
                    description
                    statutPublication
                    typeBien
                    statutBien
                    photos
                  }
                }
              }
            `
          });

        expect(response.status).toBe(200);
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.createAnnonce).toEqual({
          success: true,
          message: "Annonce créée avec succès",
          annonce: mockNewAnnonce
        });
      });
    });                
  });
});