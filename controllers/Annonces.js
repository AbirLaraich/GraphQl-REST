'use strict';

var utils = require('../utils/writer.js');
var Annonces = require('../service/AnnoncesService');

module.exports.createAnnonce = function createAnnonce (req, res, next) {
  const body = req.body;  
  Annonces.createAnnonce(body)
    .then(function (response) {
      res.status(201).json(response);  
    })
    .catch(function (error) {
      res.status(500).json({ message: "Erreur lors de la création de l'annonce", error: error });
    });
};

module.exports.deleteAnnonce = function deleteAnnonce (req, res, next, id) {
  Annonces.deleteAnnonce(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getAllAnnonces = function getAllAnnonces (req, res, next) {
  Annonces.getAllAnnonces()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getAnnonceById = function getAnnonceById (req, res, next, id) {
  Annonces.getAnnonceById(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.updateAnnonce = function updateAnnonce (req, res, next, body, id) {
  Annonces.updateAnnonce(body, id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
