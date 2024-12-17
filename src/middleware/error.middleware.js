exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Erreur de validation',
      errors: Object.values(err.errors).map(error => error.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'ID invalide'
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      message: 'Doublon détecté'
    });
  }

  res.status(500).json({
    message: 'Erreur serveur interne'
  });
};