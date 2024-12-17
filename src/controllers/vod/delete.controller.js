const VOD = require('../../models/vod.model');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vod = await VOD.findOneAndDelete({
      _id: id,
      creator: req.user._id
    });

    if (!vod) {
      return res.status(404).json({ message: 'VOD non trouvée' });
    }

    res.json({ message: 'VOD supprimée avec succès' });
  } catch (error) {
    res.status(400).json({
      message: 'Erreur lors de la suppression de la VOD',
      error: error.message
    });
  }
};