const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const createVOD = require('../controllers/vod/create.controller');
const updateVOD = require('../controllers/vod/update.controller');
const deleteVOD = require('../controllers/vod/delete.controller');
const { getById, getAll } = require('../controllers/vod/get.controller');

/**
 * @swagger
 * /api/vods:
 *   post:
 *     tags: [VODs]
 *     summary: Créer une nouvelle VOD
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
 *               - url
 *             properties:
 *               contentId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               url:
 *                 type: string
 *               duration:
 *                 type: number
 */
router.post('/', authenticate, authorize('admin'), createVOD);

/**
 * @swagger
 * /api/vods/{id}:
 *   put:
 *     tags: [VODs]
 *     summary: Mettre à jour une VOD
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, authorize('admin'), updateVOD);

/**
 * @swagger
 * /api/vods/{id}:
 *   delete:
 *     tags: [VODs]
 *     summary: Supprimer une VOD
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, authorize('admin'), deleteVOD);

/**
 * @swagger
 * /api/vods/{id}:
 *   get:
 *     tags: [VODs]
 *     summary: Récupérer une VOD par ID
 */
router.get('/:id', getById);

/**
 * @swagger
 * /api/vods:
 *   get:
 *     tags: [VODs]
 *     summary: Récupérer toutes les VODs
 */
router.get('/', getAll);

module.exports = router;