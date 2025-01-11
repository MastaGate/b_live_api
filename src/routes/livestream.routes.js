const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const createLivestream = require('../controllers/livestream/create.controller');
const updateLivestream = require('../controllers/livestream/update.controller');
const deleteLivestream = require('../controllers/livestream/delete.controller');
const { getById, getAll } = require('../controllers/livestream/get.controller');

/**
 * @swagger
 * /api/livestreams:
 *   post:
 *     tags: [Livestreams]
 *     summary: Créer un nouveau livestream
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: photo
 *         type: file
 *         required: true
 *         description: Image du livestream (max 5MB, format image uniquement)
 *       - in: formData
 *         name: contentId
 *         type: string
 *         required: true
 *       - in: formData
 *         name: title
 *         type: string
 *         required: true
 *       - in: formData
 *         name: description
 *         type: string
 *       - in: formData
 *         name: startTime
 *         type: string
 *         format: date-time
 *         required: true
 *       - in: formData
 *         name: endTime
 *         type: string
 *         format: date-time
 *         required: true
 *     responses:
 *       201:
 *         description: Livestream créé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 */
router.post('/', authenticate, authorize('admin'), createLivestream);

/**
 * @swagger
 * /api/livestreams/{id}:
 *   put:
 *     tags: [Livestreams]
 *     summary: Mettre à jour un livestream
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         required: true
 *       - in: formData
 *         name: photo
 *         type: file
 *         description: Image du livestream (max 5MB, format image uniquement)
 *       - in: formData
 *         name: contentId
 *         type: string
 *       - in: formData
 *         name: title
 *         type: string
 *       - in: formData
 *         name: description
 *         type: string
 *       - in: formData
 *         name: startTime
 *         type: string
 *         format: date-time
 *       - in: formData
 *         name: endTime
 *         type: string
 *         format: date-time
 *     responses:
 *       200:
 *         description: Livestream mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 */
router.put('/:id', authenticate, authorize('admin'), updateLivestream);

/**
 * @swagger
 * /api/livestreams/{id}:
 *   delete:
 *     tags: [Livestreams]
 *     summary: Supprimer un livestream
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, authorize('admin'), deleteLivestream);

/**
 * @swagger
 * /api/livestreams/{id}:
 *   get:
 *     tags: [Livestreams]
 *     summary: Récupérer un livestream par ID
 */
router.get('/:id', getById);

/**
 * @swagger
 * /api/livestreams:
 *   get:
 *     tags: [Livestreams]
 *     summary: Récupérer tous les livestreams
 */
router.get('/', getAll);

module.exports = router;