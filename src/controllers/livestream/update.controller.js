const Livestream = require('../../models/livestream.model');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const livestream = await Livestream.findOneAndUpdate(
      { _id: id, creator: req.user._id },
      updates,
      { new: true }
    );

    if (!livestream) {
      return res.status(404).json({ message: 'Livestream non trouvé' });
    }

    res.json(livestream);
  } catch (error) {
    res.status(400).json({
      message: 'Erreur lors de la mise à jour du livestream',
      error: error.message
    });
  }
};