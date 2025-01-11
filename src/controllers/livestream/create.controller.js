const Livestream = require('../../models/livestream.model');
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limite à 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Le fichier doit être une image'));
    }
  }
});

// Middleware pour gérer l'upload de fichier unique
const uploadMiddleware = upload.single('photo');

module.exports = async (req, res) => {
  try {
    // Utiliser le middleware multer
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          message: err.message || 'Erreur lors du téléchargement de la photo'
        });
      }

      const { contentId, title, description, startTime, endTime } = req.body;
      console.log(`** data sent: ${contentId} - ${title} - ${description}`);

      // Validation de req.user
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Utilisateur non authentifié.' });
      }

      // Vérification des champs obligatoires
      if (!contentId || !title || !startTime || !endTime || !req.file) {
        return res.status(400).json({
          message: "Veuillez remplir tous les champs obligatoires : contentId, title, startTime, endTime, photo"
        });
      }

      // Création du livestream avec la photo
      const livestreamData = {
        contentId,
        title,
        description: description || "",
        startTime,
        endTime,
        creatorId: req.user.id,
        photo: req.file
      };

      const livestream = await Livestream.create(livestreamData);
      res.status(201).json(livestream);
    });
  } catch (error) {
    console.error('Erreur lors de la création du livestream:', error);
    res.status(500).json({
      message: 'Erreur lors de la création du livestream',
      error: error.message
    });
  }
};