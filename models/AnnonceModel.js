const mongoose = require('mongoose');

const TypeBienEnum = ['vente', 'location'];
const StatutPublicationEnum = ['publiee', 'non_publiee'];
const StatutBienEnum = ['disponible', 'loue', 'vendu'];

const annonceSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: String,
  prix: Number,
  statutPublication: { 
    type: String, 
    enum: StatutPublicationEnum, 
    required: true 
  },
  dateDisponibilite: Date,
  typeBien: { 
    type: String, 
    enum: TypeBienEnum, 
    required: true 
  },
  statutBien: { 
    type: String, 
    enum: StatutBienEnum, 
    required: true 
  },
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
