const express = require('express');
const router = express.Router();
const {
  getAllProperties,
  getPropertyById,
  getPropertiesByUserId,
  createProperty,
  updateProperty,
  deleteProperty,
  deleteAllProperties,
} = require('../controllers/property.controller');

/**
 * @swagger
 * tags:
 *   name: Properties
 *   description: Property management
 */

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get all properties
 *     tags: [Properties]
 *     responses:
 *       200:
 *         description: List of all properties
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Property'
 */
router.get('/', getAllProperties);

/**
 * @swagger
 * /api/properties/user/{userId}:
 *   get:
 *     summary: Get properties by user ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of properties for the user
 */
router.get('/user/:userId', getPropertiesByUserId);

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: A single property
 *       404:
 *         description: Property not found
 */
router.get('/:id', getPropertyById);

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Create property
 *     tags: [Properties]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Property'
 *     responses:
 *       201:
 *         description: Property created successfully
 *       500:
 *         description: Server error
 */
router.post('/', createProperty);

/**
 * @swagger
 * /api/properties/{id}:
 *   put:
 *     summary: Update property
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Property'
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       404:
 *         description: Property not found
 */
router.put('/:id', updateProperty);

/**
 * @swagger
 * /api/properties/{id}:
 *   delete:
 *     summary: Delete property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       404:
 *         description: Property not found
 */
router.delete('/:id', deleteProperty);

/**
 * @swagger
 * /api/properties:
 *   delete:
 *     summary: Delete all properties
 *     tags: [Properties]
 *     responses:
 *       200:
 *         description: All properties deleted successfully
 */
router.delete('/', deleteAllProperties);

module.exports = router; 