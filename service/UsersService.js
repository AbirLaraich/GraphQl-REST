'use strict';

const mongoose = require('mongoose');
const User = require('../models/UserModel');  
/**
 * Créer un nouvel utilisateur
 * Permet à tout utilisateur, même non connecté, de créer un compte.
 *
 * body User Objet utilisateur créé
 * returns User
 **/
exports.createUser = function (body) {
  return new Promise(async function (resolve, reject) {
    try {
      const newUser = new User({
        email: body.email,
        password: body.password,  
        name: body.name,
        role: body.role || 'client', 
      });

      const savedUser = await newUser.save();

      resolve(savedUser);
    } catch (error) {
      reject({ message: 'Erreur lors de la création de l\'utilisateur', error });
    }
  });
}

/**
 * Récupérer les informations d'un utilisateur par e-mail
 * Récupère les détails d'un utilisateur en fonction de son adresse e-mail.
 *
 * email String Adresse e-mail de l'utilisateur à récupérer
 * returns User
 **/
exports.getUserByEmail = function (email) {
  return new Promise(async function (resolve, reject) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        reject({ message: 'Utilisateur non trouvé' });
      } else {
        resolve(user);
      }
    } catch (error) {
      reject({ message: 'Erreur lors de la récupération de l\'utilisateur', error });
    }
  });
}
