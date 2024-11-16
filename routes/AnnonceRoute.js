const express = require("express");
const router = express.Router();
const AnnonceService = require("../service/AnnoncesService");
const verifyToken = require("../middleware/verifyToken");

// Route pour récupérer toutes les annonces
router.get("/annonces", verifyToken, async (req, res) => {
  try {
    const annonces = await AnnonceService.getAllAnnonces();
    res.json(annonces);
  } catch (err) {
    res.status(500).json({ message: "Erreur de récupération des annonces", error: err });
  }
});

// Route pour créer une nouvelle annonce
router.post("/annonce", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "agent") {
      return res.status(403).json({
        message: "Accès interdit : seul un agent peut créer une annonce.",
      });
    }
    const {
      prix,
      titre,
      description,
      dateDisponibilite,
      typeBien,
      statutBien,
      photos,
      statutPublication,
    } = req.body;

    if (!prix || !titre || !description) {
      return res.status(400).json({
        message: "Les champs prix, titre et description sont obligatoires.",
      });
    }

    const nouvelleAnnonce = await AnnonceService.createAnnonce({
      prix,
      titre,
      description,
      dateDisponibilite,
      typeBien,
      statutBien,
      photos,
      statutPublication,
    });

    res.status(201).json(nouvelleAnnonce);
  } catch (err) {
    console.error("Erreur lors de la création de l'annonce:", err);
    res.status(500).json({ message: "Erreur de création de l'annonce", error: err });
  }
});

// Route pour récupérer une annonce par son ID
router.get("/annonces/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const annonce = await AnnonceService.getAnnonceById(id);

    if (annonce) {
      res.status(200).json(annonce);
    } else {
      res.status(404).json({ message: "Annonce non trouvée" });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de l'annonce", error });
  }
});

// Route pour mettre à jour une annonce
router.put("/annonces/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    if (req.user.role !== "agent") {
      return res.status(403).json({
        message: "Accès interdit : seul un agent peut modifier une annonce.",
      });
    }

    const updatedAnnonce = await AnnonceService.updateAnnonce(body, id);

    res.status(200).json(updatedAnnonce);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Erreur lors de la mise à jour de l'annonce",
      error,
    });
  }
});

// Route pour supprimer une annonce
router.delete("/annonces/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "agent") {
      return res.status(403).json({
        message: "Accès interdit : seul un agent peut modifier une annonce.",
      });
    }

    await AnnonceService.deleteAnnonce(id);

    res.status(200).json({ message: "Annonce supprimée avec succès" });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Erreur lors de la suppression de l'annonce",
      error,
    });
  }
});

// Route pour ajouter une question à une annonce
router.post('/annonces/:id/questions', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { contenu } = req.body;
  
    try {
      if (!contenu) {
        return res.status(400).json({ message: 'Le texte de la question est requis.' });
      }
  
      const question = await AnnonceService.addQuestion(id, contenu);
  
      res.status(201).json(question); 
    } catch (error) {
      res.status(500).json({ message: error.message || 'Erreur lors de l\'ajout de la question' });
    }
  });

// Route pour ajouter une réponse à une question d'une annonce
router.post('/annonces/:annonceId/questions/:questionId/reponses', verifyToken, async (req, res) => {
    const { annonceId, questionId } = req.params;
    const { contenu } = req.body;
    const { user } = req; 
  
    try {
      if (!contenu) {
        return res.status(400).json({ message: 'Le texte de la réponse est requis.' });
      }
  
      const reponse = await AnnonceService.addReponse(annonceId, questionId, contenu, user.id);
  
      res.status(201).json(reponse); 
    } catch (error) {
      res.status(500).json({ message: error.message || 'Erreur lors de l\'ajout de la réponse' });
    }
  });
  

// Route pour récupérer toutes les questions d'une annonce
router.get("/annonces/:id/questions", async (req, res) => {
  try {
    const { id } = req.params;

    const questions = await AnnonceService.getQuestionsByAnnonceId(id);

    if (questions && questions.length > 0) {
      res.status(200).json(questions);
    } else {
      res.status(404).json({ message: "Aucune question trouvée pour cette annonce" });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des questions", error });
  }
});

module.exports = router;
