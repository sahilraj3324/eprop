const express = require('express');
const router = express.Router();
const {
  createResidentialProperty,
  getAllResidentialProperties,
  getResidentialPropertyById,
  getResidentialPropertiesByUserId,
  updateResidentialPropertyByUserAndId,
  deleteResidentialPropertyById,
  deleteResidentialPropertyByUserAndId,
  deleteAllResidentialProperties,
  deleteAllResidentialPropertiesByUserId,
} = require('../controllers/residentialProperty.controller');

/**
 * @swagger
 * tags:
 *   name: Residential Properties
 *   description: Residential property management
 */

/**
 * @swagger
 * /api/residential-properties:
 *   post:
 *     summary: Create a new residential property
 *     tags: [Residential Properties]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResidentialProperty'
 *     responses:
 *       201:
 *         description: Residential property created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ResidentialProperty'
 *       400:
 *         description: Bad request - validation error
 */
router.post('/', createResidentialProperty);

/**
 * @swagger
 * /api/residential-properties:
 *   get:
 *     summary: Get all residential properties with filtering and pagination
 *     tags: [Residential Properties]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: property_type
 *         schema:
 *           type: string
 *           enum: [apartment, villa, independent_house, builder_floor, penthouse, studio_apartment]
 *         description: Filter by property type
 *       - in: query
 *         name: bhk_rk
 *         schema:
 *           type: string
 *           enum: [1RK, 1BHK, 2BHK, 3BHK, 4BHK, 5BHK, 5+BHK]
 *         description: Filter by BHK/RK
 *       - in: query
 *         name: looking_for
 *         schema:
 *           type: string
 *           enum: [rent, sale, lease]
 *         description: Filter by looking for
 *       - in: query
 *         name: min_cost
 *         schema:
 *           type: number
 *         description: Minimum cost filter
 *       - in: query
 *         name: max_cost
 *         schema:
 *           type: number
 *         description: Maximum cost filter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, rented, sold]
 *           default: active
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of residential properties with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ResidentialProperty'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current_page:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *                     total_items:
 *                       type: integer
 *                     items_per_page:
 *                       type: integer
 */
router.get('/', getAllResidentialProperties);

/**
 * @swagger
 * /api/residential-properties/user/{userId}:
 *   get:
 *     summary: Get residential properties by user ID
 *     tags: [Residential Properties]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, rented, sold]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of user's residential properties
 */
router.get('/user/:userId', getResidentialPropertiesByUserId);

/**
 * @swagger
 * /api/residential-properties/{id}:
 *   get:
 *     summary: Get residential property by ID
 *     tags: [Residential Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: A single residential property
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ResidentialProperty'
 *       404:
 *         description: Property not found
 */
router.get('/:id', getResidentialPropertyById);

/**
 * @swagger
 * /api/residential-properties/{id}/user/{userId}:
 *   put:
 *     summary: Update residential property by ID and user ID
 *     tags: [Residential Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResidentialProperty'
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       404:
 *         description: Property not found or unauthorized
 *       400:
 *         description: Validation error
 */
router.put('/:id/user/:userId', updateResidentialPropertyByUserAndId);

/**
 * @swagger
 * /api/residential-properties/{id}:
 *   delete:
 *     summary: Delete residential property by ID (Admin only)
 *     tags: [Residential Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       404:
 *         description: Property not found
 */
router.delete('/:id', deleteResidentialPropertyById);

/**
 * @swagger
 * /api/residential-properties/{id}/user/{userId}:
 *   delete:
 *     summary: Delete residential property by ID and user ID
 *     tags: [Residential Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       404:
 *         description: Property not found or unauthorized
 */
router.delete('/:id/user/:userId', deleteResidentialPropertyByUserAndId);

/**
 * @swagger
 * /api/residential-properties/user/{userId}/all:
 *   delete:
 *     summary: Delete all residential properties by user ID
 *     tags: [Residential Properties]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: All user properties deleted successfully
 */
router.delete('/user/:userId/all', deleteAllResidentialPropertiesByUserId);

/**
 * @swagger
 * /api/residential-properties/all:
 *   delete:
 *     summary: Delete all residential properties (Admin only)
 *     tags: [Residential Properties]
 *     responses:
 *       200:
 *         description: All properties deleted successfully
 */
router.delete('/all', deleteAllResidentialProperties);

module.exports = router; 