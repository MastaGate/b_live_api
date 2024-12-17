const VOD = require('../../models/vod.model');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const vod = await VOD.findOneAndUpdate(
      { _id: id, creator: req.user._id },
      updates,
      { new: true }
    );

    if (!vod) {
      return res.status(404).json({ message: 'VOD non trouvée' });
    }

    res.json(vod);
  } catch (error) {
    res.status(400).json({
      message: 'Erreur lors de la mise à jour de la VOD',
      error: error.message
    });
  }
};