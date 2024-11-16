'use strict';
const Annonce = require('../models/AnnonceModel');


/**
 * Créer une nouvelle annonce
 * Permet à un agent immobilier de créer une annonce. Nécessite authentification.
 *
 * body Annonce Objet annonce créée
 * returns Annonce
 **/

exports.createAnnonce = function (body) {
  return new Promise(async (resolve, reject) => {
    try {
      const annonce = new Annonce(body);
      const savedAnnonce = await annonce.save();
      resolve(savedAnnonce);  
    } catch (error) {
      reject({ message: "Erreur lors de la création de l'annonce", error: error });
    }
  });
};


/**
 * Supprimer une annonce
 * Permet à un agent de supprimer une annonce. Nécessite authentification.
 *
 * id String ID de l'annonce à supprimer
 * no response value expected for this operation
 **/

exports.deleteAnnonce = function(id) {
  return new Promise(async (resolve, reject) => {
    try {
      const deletedAnnonce = await Annonce.findByIdAndDelete(id);

      if (!deletedAnnonce) {
        reject({ message: 'Annonce non trouvée' });
      } else {
        resolve({ message: 'Annonce supprimée avec succès' });
      }
    } catch (error) {
      reject({ message: 'Erreur lors de la suppression de l\'annonce', error: error });
    }
  });
};


/**
 * Récupérer toutes les annonces
 * Récupère la liste de toutes les annonces disponibles.
 *
 * returns List
 **/
exports.getAllAnnonces = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const annonces = await Annonce.find();
      resolve(annonces);
    } catch (error) {
      reject(error);
    }
  });
};


/**
 * Récupérer une annonce par ID
 * Récupère les détails d'une annonce spécifique.
 *
 * id String ID de l'annonce à récupérer
 * returns Annonce
 **/
exports.getAnnonceById = function(id) {
  return new Promise(async (resolve, reject) => {
    try {
      const annonce = await Annonce.findById(id);

      if (annonce) {
        resolve(annonce);
      } else {
        reject({ message: 'Annonce non trouvée' });
      }
    } catch (error) {
      reject({ message: 'Erreur lors de la récupération de l\'annonce', error: error });
    }
  });
};


/**
 * Modifier une annonce
 * Permet à un agent de modifier une annonce existante. Nécessite authentification.
 *
 * body Annonce Objet annonce modifié
 * id String ID de l'annonce à modifier
 * no response value expected for this operation
 **/
exports.updateAnnonce = function(body, id) {
  return new Promise(async (resolve, reject) => {
    try {
      const updatedAnnonce = await Annonce.findByIdAndUpdate(id, body, { new: true });
      if (!updatedAnnonce) {
        reject({ message: 'Annonce non trouvée' });
      } else {
        resolve(updatedAnnonce);
      }
    } catch (error) {
      reject({ message: 'Erreur lors de la mise à jour de l\'annonce', error: error });
    }
  });
};

// Ajouter une question à une annonce
exports.addQuestion = async (annonceId, contenu) => {
  try {
    const annonce = await Annonce.findById(annonceId);

    if (!annonce) {
      throw new Error('Annonce non trouvée');
    }

    const newQuestion = {
      contenu: contenu,
      datePosee: new Date(),
      reponses: []  
    };

    annonce.questions.push(newQuestion);

    await annonce.save();
    return newQuestion; 
  } catch (error) {
    throw new Error(error.message);
  }
};

// Ajouter une réponse à une question d'une annonce
exports.addReponse = async (annonceId, questionId, contenu, reponduPar) => {
  try {
    const annonce = await Annonce.findById(annonceId);

    if (!annonce) {
      throw new Error('Annonce non trouvée');
    }

    const question = annonce.questions.id(questionId);
    if (!question) {
      throw new Error('Question non trouvée');
    }

    const newReponse = {
      contenu: contenu,
      dateReponse: new Date(),
      reponduPar: reponduPar 
    };

    question.reponses.push(newReponse);

    await annonce.save();
    return newReponse; 
  } catch (error) {
    throw new Error(error.message);
  }
};

// Récupérer toutes les questions d'une annonce
exports.getQuestionsByAnnonceId = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      const annonce = await Annonce.findById(id).populate('questions.reponses');
      if (!annonce) {
        reject({ message: 'Annonce non trouvée' });
        return;
      }

      resolve(annonce.questions);
    } catch (error) {
      reject({ message: 'Erreur lors de la récupération des questions', error });
    }
  });
};
