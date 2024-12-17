const Livestream = require('../../models/livestream.model');

module.exports = async (req, res) => {
  try {
    const { contentId, title, description, startTime, endTime } = req.body;
    console.log(`** data sent: ${contentId} - ${title} - ${description}`);

    // Validation de req.user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Utilisateur non authentifié.' });
    }

    // Vérification des champs obligatoires
    if (!contentId || !title || !startTime || !endTime) {
      return res.status(400).json({
        message: "Veuillez remplir tous les champs obligatoires : contentId, title, startTime, endTime."
      });
    }

    // Création de l'objet livestream avec validation des champs requis
    const livestreamData = {
      contentId,
      title,
      description: description || "", // Champ facultatif
      startTime,
      endTime,
      creatorId: req.user.id
    };

    // Appel à la méthode de création dans le modèle
    const livestream = await Livestream.create(livestreamData);

    res.status(201).json(livestream);
  } catch (error) {
    res.status(400).json({
      message: 'Erreur lors de la création du livestream',
      error: error.message
    });
  }
};