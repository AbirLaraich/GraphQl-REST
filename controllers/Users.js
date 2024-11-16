'use strict';

var utils = require('../utils/writer.js');
var Users = require('../service/UsersService');

module.exports.createUser = function createUser(req, res, next, body) {
  Users.createUser(body)
    .then(function (response) {
      res.status(201).json(response);
    })
    .catch(function (response) {
      res.status(response.status || 500).json({ message: response.message, error: response.error });
    });
};

module.exports.getUserByEmail = function getUserByEmail(req, res, next, email) {
  Users.getUserByEmail(email)
    .then(function (response) {
      res.status(200).json(response);
    })
    .catch(function (response) {
      res.status(response.status || 500).json({ message: response.message, error: response.error });
    });
};

module.exports.getUserByEmail = function getUserByEmail (req, res, next, email) {
  Users.getUserByEmail(email)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
