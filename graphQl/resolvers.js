const AnnonceService = require("../service/AnnoncesService");
const UserService = require("../service/UsersService");

const resolvers = {
    Query: {
      annonces: async (_, args) => {
        const { typeBien, statutBien, statutPublication, prixMin, prixMax } = args;
        let annonces = await AnnonceService.getAllAnnonces();
        
        if (prixMin !== undefined) {
          annonces = annonces.filter((a) => a.prix >= prixMin);
        }
        if (prixMax !== undefined) {
          annonces = annonces.filter((a) => a.prix <= prixMax);
        }
        return annonces;
      },
  
      annonce: async (_, { id }) => {
        return await AnnonceService.getAnnonceById(id);
      },
  
      questions: async (_, { annonceId }) => {
        return await AnnonceService.getQuestionsByAnnonceId(annonceId);
      },
  
      user: async (_, { email }) => {
        return await UserService.getUserByEmail(email);
      },
    },
    Mutation: {
      createAnnonce: async (_, { input }, context) => {
        if (!context.user || context.user.role !== "AGENT") {
          throw new Error("Seuls les agents peuvent créer des annonces");
        }
        return await AnnonceService.createAnnonce(input);
      },
  
      updateAnnonce: async (_, { id, input }, context) => {
        if (!context.user || context.user.role !== "AGENT") {
          throw new Error("Seuls les agents peuvent modifier des annonces");
        }
        return await AnnonceService.updateAnnonce(input, id);
      },
  
      deleteAnnonce: async (_, { id }, context) => {
        if (!context.user || context.user.role !== "AGENT") {
          throw new Error("Seuls les agents peuvent supprimer des annonces");
        }
        await AnnonceService.deleteAnnonce(id);
        return true;
      },
  
      addQuestion: async (_, { annonceId, input }, context) => {
        if (!context.user) {
          throw new Error("Vous devez être connecté pour poser une question");
        }
        return await AnnonceService.addQuestion(annonceId, input.contenu);
      },
  
      addReponse: async (_, { annonceId, questionId, input }, context) => {
        if (!context.user || context.user.role !== "AGENT") {
          throw new Error("Seuls les agents peuvent répondre aux questions");
        }
        return await AnnonceService.addReponse(
          annonceId,
          questionId,
          input.contenu,
          context.user.id
        );
      },
  
      createUser: async (_, { email, name, password, role }) => {
        return await UserService.createUser({ email, name, password, role });
      },
    },
  };
  
  module.exports = resolvers;