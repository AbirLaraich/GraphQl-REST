const jwt = require('jsonwebtoken');
require('dotenv').config();
const userService = require('../service/UsersService');

// Middleware pour vérifier le token d'authentification
async function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]; 
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email; 

    const user = await userService.getUserByEmail(email);

    req.user = user;

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalide' });
    }
    return res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error: err });
  }
}

module.exports = verifyToken;
