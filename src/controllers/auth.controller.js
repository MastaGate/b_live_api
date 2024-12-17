const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Création de l'utilisateur via la méthode statique `create` du modèle
    const user = await User.create({
      username,
      email,
      password,
      role
    });

    const token = jwt.sign(
      { userId: user.id }, // Utilisez `user.id` au lieu de `user._id`
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token
    });
  } catch (error) {
    res.status(400).json({
      message: 'Erreur lors de la création de l\'utilisateur',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Recherche de l'utilisateur par email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Comparaison des mots de passe
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        message: 'Email ou mot de passe incorrect'
      });
    }

    const token = jwt.sign(
      { userId: user.id }, // Utilisation de `user.id` pour l'ID
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(400).json({
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};