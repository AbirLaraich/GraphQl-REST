const jwt = require('jsonwebtoken');
require('dotenv').config();
const userService = require('../service/UsersService');
const { parse } = require('graphql');

const PUBLIC_OPERATIONS = {
  queries: ['annonces', 'annonce', 'questions'],
  mutations: ['createUser']
};

function getOperationName(query) {
  try {
    const document = parse(query);
    const operation = document.definitions[0];
    if (operation.selectionSet) {
      return operation.selectionSet.selections[0].name.value;
    }
    if (operation.name) {
      return operation.name.value;
    }
    return operation.selectionSet.selections[0].name.value;
  } catch (error) {
    console.error('Erreur lors de l\'analyse de la requête GraphQL:', error);
    return null;
  }
}

async function verifyToken(req, res, next) {
  if (!req.body || !req.body.query) {
    next();
    return;
  }

  const operationName = getOperationName(req.body.query);
  const operationType = req.body.query.includes('mutation') ? 'mutations' : 'queries';

  if (PUBLIC_OPERATIONS[operationType]?.includes(operationName)) {
    next();
    return;
  }

  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    res.status(403).json({
      errors: [{
        message: 'Cette opération nécessite une authentification'
      }]
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userService.getUserByEmail(decoded.email);
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        errors: [{
          message: 'Token invalide'
        }]
      });
    }
    
    res.status(500).json({
      errors: [{
        message: 'Erreur lors de la récupération de l\'utilisateur',
        error: err.message
      }]
    });
  }
}

module.exports = verifyToken;