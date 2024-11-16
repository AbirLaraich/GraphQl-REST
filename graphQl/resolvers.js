const { GraphQLScalarType, Kind } = require('graphql');
const AnnonceService = require("../service/AnnoncesService");
const UserService = require("../service/UsersService");

const resolvers = {
  Date: new GraphQLScalarType({
    name: "Date",
    description: "A custom scalar type for Date",
    serialize(value) {
      return value.toISOString();
    },
    parseValue(value) {
      return new Date(value);
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return new Date(ast.value);
      }
      return null;
    }
  }),

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
      if (typeBien !== undefined) {
        annonces = annonces.filter((a) => a.typeBien === typeBien);
      }
      if (statutBien !== undefined) {
        annonces = annonces.filter((a) => a.statutBien === statutBien);
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
    }
  },

  MutationResponse: {
    __resolveType(obj, context, info) {
      if (obj.annonce) return 'AnnonceResponse';
      if (obj.question) return 'QuestionResponse';
      if (obj.reponse) return 'ReponseResponse';
      if (obj.user) return 'UserResponse';
      if (!obj.annonce && !obj.question && !obj.reponse && !obj.user) return 'DeleteAnnonceResponse';
      return null;
    }
  },

  Mutation: {
    createAnnonce: async (_, { input }, context) => {
      try {
        if (!context.user || context.user.role !== "agent") {
          throw new Error("Seuls les agents peuvent créer des annonces");
        }
        
        const annonce = await AnnonceService.createAnnonce({
          ...input,
          dateDisponibilite: new Date(input.dateDisponibilite)
        });

        return {
          success: true,
          message: "Annonce créée avec succès",
          annonce
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
          annonce: null
        };
      }
    },

    updateAnnonce: async (_, { id, input }, context) => {
      try {
        if (!context.user || context.user.role !== "agent") {
          throw new Error("Seuls les agents peuvent modifier des annonces");
        }

        const annonce = await AnnonceService.updateAnnonce({
          ...input,
          dateDisponibilite: new Date(input.dateDisponibilite)
        }, id);

        return {
          success: true,
          message: "Annonce mise à jour avec succès",
          annonce
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
          annonce: null
        };
      }
    },

    deleteAnnonce: async (_, { id }, context) => {
      try {
        if (!context.user || context.user.role !== "agent") {
          throw new Error("Seuls les agents peuvent supprimer des annonces");
        }

        await AnnonceService.deleteAnnonce(id);
        return {
          success: true,
          message: "Annonce supprimée avec succès"
        };
      } catch (error) {
        return {
          success: false,
          message: error.message
        };
      }
    },

    addQuestion: async (_, { annonceId, input }, context) => {
      try {
        if (!context.user) {
          throw new Error("Vous devez être connecté pour poser une question");
        }

        const question = await AnnonceService.addQuestion(annonceId, input.contenu);
        console.log(question)
        return {
          success: true,
          message: "Question ajoutée avec succès",
          question
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
          question: null
        };
      }
    },

    addReponse: async (_, { annonceId, questionId, input }, context) => {
      try {
        if (!context.user || context.user.role !== "agent") {
          throw new Error("Seuls les agents peuvent répondre aux questions");
        }

        const reponse = await AnnonceService.addReponse(
          annonceId,
          questionId,
          input.contenu,
          context.user.id
        );

        return {
          success: true,
          message: "Réponse ajoutée avec succès",
          reponse
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
          reponse: null
        };
      }
    },

    createUser: async (_, { email, name, password, role }) => {
      try {
        const user = await UserService.createUser({ email, name, password, role });
        return {
          success: true,
          message: "Utilisateur créé avec succès",
          user
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
          user: null
        };
      }
    }
  },

  Annonce: {
    questions: async (parent) => {
      return await AnnonceService.getQuestionsByAnnonceId(parent.id);
    }
  },

  Question: {
    reponses: async (parent) => {
      return await AnnonceService.getReponsesByQuestionId(parent.id);
    }
  },

  SearchResult: {
    __resolveType(obj) {
      if (obj.titre) {
        return 'Annonce';
      }
      if (obj.email) {
        return 'User';
      }
      return null;
    }
  }
};

module.exports = resolvers;