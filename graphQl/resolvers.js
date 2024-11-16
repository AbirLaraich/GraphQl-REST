const Annonce = require('../models/AnnonceModel'); 
const User = require('../models/UserModel'); 

const resolvers = {
  Query: {
    annonces: async (_, { typeBien, statutBien, prixMin, prixMax }) => {
      const filter = {};
      if (typeBien) filter.typeBien = typeBien;
      if (statutBien) filter.statutBien = statutBien;
      if (prixMin !== undefined || prixMax !== undefined) {
        filter.prix = {};
        if (prixMin !== undefined) filter.prix.$gte = prixMin;
        if (prixMax !== undefined) filter.prix.$lte = prixMax;
      }
      return await Annonce.find(filter);
    },
    annonce: async (_, { id }) => await Annonce.findById(id),
    questions: async (_, { annonceId }) => {
      const annonce = await Annonce.findById(annonceId);
      return annonce ? annonce.questions : [];
    },
    user: async (_, { email }) => await User.findOne({ email }),
  }
};

module.exports = resolvers;