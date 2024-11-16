const express = require('express');
const router = express.Router();
const userService = require('../service/UsersService'); 
const verifyToken = require('../middleware/verifyToken');

// Route pour créer un nouvel utilisateur
router.post('/user', verifyToken, async (req, res) => {
    try {
      const { email, password, name, role } = req.body;
  
      if (role !== 'client' && role !== 'agent') {
        return res.status(400).json({ message: "Le rôle doit être 'client' ou 'agent'." });
      }
  
      const newUser = await userService.createUser(req.body);
  
      res.status(201).json({ message: 'Utilisateur créé avec succès', user: newUser });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur', error });
    }
});

// Route pour récupérer un utilisateur par son email
router.get('/users/:email', verifyToken, async (req, res) => {
    try {
        console.log('req user : ', req.user);
      const { email } = req.params;
  
      const user = await userService.getUserByEmail(email);
        
      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error });
    }
});

module.exports = router;
