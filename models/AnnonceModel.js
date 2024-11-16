const mongoose = require('mongoose');

const annonceSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: String,
  prix: Number,
  statutPublication: String,
  dateDisponibilite: Date,
  typeBien: String,
  statutBien: String,
  photos: [String],
  questions: [
    {
      contenu: { type: String, required: true },
      datePosee: { type: Date, default: Date.now },
      reponses: [
        {
          contenu: { type: String },
          dateReponse: { type: Date, default: Date.now },
          reponduPar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
        }
      ]
    }
  ]
});

module.exports = mongoose.model('Annonce', annonceSchema);
