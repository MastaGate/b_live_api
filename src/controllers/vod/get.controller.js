const VOD = require('../../models/vod.model');

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vod = await VOD.findById(id)
      .populate('creator', 'username email');

    if (!vod) {
      return res.status(404).json({ message: 'VOD non trouvée' });
    }

    res.json(vod);
  } catch (error) {
    res.status(400).json({
      message: 'Erreur lors de la récupération de la VOD',
      error: error.message
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const vods = await VOD.find()
      .populate('creator', 'username email')
      .sort({ createdAt: -1 });

    res.json(vods);
  } catch (error) {
    res.status(400).json({
      message: 'Erreur lors de la récupération des VODs',
      error: error.message
    });
  }
};