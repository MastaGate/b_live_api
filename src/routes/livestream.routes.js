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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contentId
 *               - title
 *             properties:
 *               contentId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
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