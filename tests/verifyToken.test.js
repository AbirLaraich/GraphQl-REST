const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');
const { generateToken } = require('./utils/mockToken');
const userService = require('../service/UsersService');

jest.mock('../service/UsersService');

const app = express();
app.use(express.json());

app.get('/protected', verifyToken, (req, res) => {
  res.status(200).json({ message: 'Accès autorisé', user: req.user });
});

describe('verifyToken middleware', () => {
  beforeAll(() => {
    jest.setTimeout(10000); 
  });

  it('should allow access to protected route with valid token', async () => {
    const token = generateToken();
    
    const mockUser = { id: '1', email: 'laraich.abir2002@gmail.com', role: 'agent' };
    userService.getUserByEmail.mockResolvedValue(mockUser);  

    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Accès autorisé');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user).toHaveProperty('email');
  });

  it('should return 401 if token is invalid', async () => {
    const invalidToken = 'invalidtoken';
    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${invalidToken}`)
      .send();

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token invalide');
  });

  it('should return 403 if no token is provided', async () => {
    const response = await request(app)
      .get('/protected')
      .send();

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Aucun token fourni');
  });
});
