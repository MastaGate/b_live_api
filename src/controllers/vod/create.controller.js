const VOD = require('../../models/vod.model');

module.exports = async (req, res) => {
  try {
    const { contentId, title, description, url, duration } = req.body;
    
    const vod = new VOD({
      contentId,
      title,
      description,
      url,
      duration,
      creator: req.user._id
    });

    await VOD.save(vod);
    res.status(201).json(vod);
  } catch (error) {
    res.status(400).json({
      message: 'Erreur lors de la création de la VOD',
      error: error.message
    });
  }
};