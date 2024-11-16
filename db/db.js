const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/agenceImmobiliere';

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connecté');
  } catch (err) {
    console.error('Erreur de connexion à MongoDB :', err);
    process.exit(1);
  }
};


module.exports = connectDB;
