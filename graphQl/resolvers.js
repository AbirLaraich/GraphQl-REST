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
  },
  Mutation: {
    createAnnonce: async (_, { input }) => await Annonce.create(input),
    updateAnnonce: async (_, { id, input }) => await Annonce.findByIdAndUpdate(id, input, { new: true }),
    deleteAnnonce: async (_, { id }) => {
      await Annonce.findByIdAndDelete(id);
      return true;
    },
    addQuestion: async (_, { annonceId, input }) => {
      const annonce = await Annonce.findById(annonceId);
      annonce.questions.push(input);
      await annonce.save();
      return annonce.questions[annonce.questions.length - 1];
    },
    addReponse: async (_, { annonceId, questionId, input }) => {
      const annonce = await Annonce.findById(annonceId);
      const question = annonce.questions.id(questionId);
      question.reponses.push(input);
      await annonce.save();
      return question.reponses[question.reponses.length - 1];
    },
    createUser: async (_, { email, name, password, role }) => {
      return await User.create({ email, name, password, role });
    },
  },
};

module.exports = resolvers;