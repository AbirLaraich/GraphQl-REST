const mongoose = require('mongoose');

const reponseSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  contenu: { type: String, required: true },
  dateReponse: { type: Date, default: Date.now },
  reponduPar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const questionSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  contenu: { type: String, required: true },
  datePosee: { type: Date, default: Date.now },
  reponses: [reponseSchema]
});

const annonceSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: String,
  prix: { type: Number, required: true },
  statutPublication: {
    type: String,
    enum: ['publiee', 'non_publiee'],
    required: true
  },
  dateDisponibilite: { type: Date, required: true },
  typeBien: {
    type: String,
    enum: ['vente', 'location'],
    required: true
  },
  statutBien: {
    type: String,
    enum: ['disponible', 'loue', 'vendu'],
    required: true
  },
  photos: [String],
  questions: [questionSchema]
});

module.exports = mongoose.model('Annonce', annonceSchema);