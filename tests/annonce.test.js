const request = require('supertest');
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const fs = require('fs');
const path = require('path');
const verifyToken = require('../middleware/verifyToken');

const typeDefs = fs.readFileSync(path.join(__dirname, '../graphQl', 'schema.graphql'), 'utf-8');
const resolvers = require('../graphQl/resolvers');

const AnnonceService = require('../service/AnnoncesService');

jest.mock('../service/AnnoncesService');
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

describe('GraphQL Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('Public Queries', () => {
    it('should fetch all annonces without authentication', async () => {
      const mockAnnonces = [
        { id: '1', titre: 'Annonce 1', prix: 1200, typeBien: 'vente' },
        { id: '2', titre: 'Annonce 2', prix: 1500, typeBien: 'location' }
      ];
      
      AnnonceService.getAllAnnonces.mockResolvedValue(mockAnnonces);

      const response = await request(app)
        .post('/graphql')
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
          `
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.annonces).toEqual(mockAnnonces);
    });
  });
});