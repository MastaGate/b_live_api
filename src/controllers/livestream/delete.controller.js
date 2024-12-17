const Livestream = require('../../models/livestream.model');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    
    const livestream = await Livestream.findOneAndDelete({
      _id: id,
      creator: req.user._id
    });

    if (!livestream) {
      return res.status(404).json({ message: 'Livestream non trouvé' });
    }

    res.json({ message: 'Livestream supprimé avec succès' });
  } catch (error) {
    res.status(400).json({
      message: 'Erreur lors de la suppression du livestream',
      error: error.message
    });
  }
};