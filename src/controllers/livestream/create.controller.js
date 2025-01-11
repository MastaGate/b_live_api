const Livestream = require('../../models/livestream.model');

module.exports = async (req, res) => {
  try {
    const { contentId, title, description, startTime, endTime, photoBlob } = req.body;
    console.log(`** data sent: ${contentId} - ${title} - ${description}`);

    // Validation de req.user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Utilisateur non authentifié.' });
    }

    // Vérification des champs obligatoires
    if (!contentId || !title || !startTime || !endTime || !photoBlob) {
      return res.status(400).json({
        message: "Veuillez remplir tous les champs obligatoires : contentId, title, startTime, endTime, photoBlob."
      });
    }

    // Création du livestream avec la photo si fournie
    const livestreamData = {
      contentId,
      title,
      description: description || "",
      startTime,
      endTime,
      creatorId: req.user.id,
      photoBlob: photoBlob || null
    };

    const livestream = await Livestream.create(livestreamData);
    res.status(201).json(livestream);
  } catch (error) {
    console.error('Erreur lors de la création du livestream:', error);
    res.status(500).json({
      message: 'Erreur lors de la création du livestream',
      error: error.message
    });
  }
};