const Livestream = require('../../models/livestream.model');

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const livestream = await Livestream.findById(id)
      .populate('creator', 'username email');

    if (!livestream) {
      return res.status(404).json({ message: 'Livestream non trouvé' });
    }

    res.json(livestream);
  } catch (error) {
    res.status(400).json({
      message: 'Erreur lors de la récupération du livestream',
      error: error.message
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const livestreams = await Livestream.findAll()
      // .populate('creator', 'username email')
      // .sort({ createdAt: -1 });

    res.json(livestreams);
  } catch (error) {
    res.status(400).json({
      message: 'Erreur lors de la récupération des livestreams',
      error: error.message
    });
  }
};