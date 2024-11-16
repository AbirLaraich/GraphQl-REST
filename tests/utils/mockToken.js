const jwt = require('jsonwebtoken');
const user = { id: '67377b320a88c40a626a5cb3', email: 'laraich.abir2002@gmail.com', role: 'agent' };

module.exports = {
  generateToken: () => jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '6h' }),
  user,
};
