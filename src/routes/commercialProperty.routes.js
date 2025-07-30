const express = require('express');
const router = express.Router();
const {
  createCommercialProperty,
  getAllCommercialProperties,
  getCommercialPropertyById,
  getCommercialPropertiesByUserId,
  updateCommercialPropertyByUserAndId,
  deleteCommercialPropertyById,
  deleteCommercialPropertyByUserAndId,
  deleteAllCommercialProperties,
  deleteAllCommercialPropertiesByUserId,
} = require('../controllers/commercialProperty.controller');

/**
 * @swagger
 * tags:
 *   name: Commercial Properties
 *   description: Commercial property management
 */

/**
 * @swagger
 * /api/commercial-properties:
 *   post:
 *     summary: Create a new commercial property
 *     tags: [Commercial Properties]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommercialProperty'
 *     responses:
 *       201:
 *         description: Commercial property created successfully
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
 *                   $ref: '#/components/schemas/CommercialProperty'
 *       400:
 *         description: Bad request - validation error
 */
router.post('/', createCommercialProperty);

/**
 * @swagger
 * /api/commercial-properties:
 *   get:
 *     summary: Get all commercial properties with filtering and pagination
 *     tags: [Commercial Properties]
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
 *         description: Filter by property type
 *       - in: query
 *         name: looking_to
 *         schema:
 *           type: string
 *           enum: [rent, sale, lease]
 *         description: Filter by looking to
 *       - in: query
 *         name: possession_status
 *         schema:
 *           type: string
 *           enum: [ready_to_move, under_construction, new_launch]
 *         description: Filter by possession status
 *       - in: query
 *         name: ownership
 *         schema:
 *           type: string
 *           enum: [freehold, leasehold, co_operative_society, power_of_attorney]
 *         description: Filter by ownership type
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
 *         name: min_area
 *         schema:
 *           type: number
 *         description: Minimum build up area filter
 *       - in: query
 *         name: max_area
 *         schema:
 *           type: number
 *         description: Maximum build up area filter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, rented, sold]
 *           default: active
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of commercial properties with pagination
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
 *                     $ref: '#/components/schemas/CommercialProperty'
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
router.get('/', getAllCommercialProperties);

/**
 * @swagger
 * /api/commercial-properties/user/{userId}:
 *   get:
 *     summary: Get commercial properties by user ID
 *     tags: [Commercial Properties]
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
 *         description: List of user's commercial properties
 */
router.get('/user/:userId', getCommercialPropertiesByUserId);

/**
 * @swagger
 * /api/commercial-properties/{id}:
 *   get:
 *     summary: Get commercial property by ID
 *     tags: [Commercial Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: A single commercial property
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CommercialProperty'
 *       404:
 *         description: Property not found
 */
router.get('/:id', getCommercialPropertyById);

/**
 * @swagger
 * /api/commercial-properties/{id}/user/{userId}:
 *   put:
 *     summary: Update commercial property by ID and user ID
 *     tags: [Commercial Properties]
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
 *             $ref: '#/components/schemas/CommercialProperty'
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       404:
 *         description: Property not found or unauthorized
 *       400:
 *         description: Validation error
 */
router.put('/:id/user/:userId', updateCommercialPropertyByUserAndId);

/**
 * @swagger
 * /api/commercial-properties/{id}:
 *   delete:
 *     summary: Delete commercial property by ID (Admin only)
 *     tags: [Commercial Properties]
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
router.delete('/:id', deleteCommercialPropertyById);

/**
 * @swagger
 * /api/commercial-properties/{id}/user/{userId}:
 *   delete:
 *     summary: Delete commercial property by ID and user ID
 *     tags: [Commercial Properties]
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
router.delete('/:id/user/:userId', deleteCommercialPropertyByUserAndId);

/**
 * @swagger
 * /api/commercial-properties/user/{userId}/all:
 *   delete:
 *     summary: Delete all commercial properties by user ID
 *     tags: [Commercial Properties]
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
router.delete('/user/:userId/all', deleteAllCommercialPropertiesByUserId);

/**
 * @swagger
 * /api/commercial-properties/all:
 *   delete:
 *     summary: Delete all commercial properties (Admin only)
 *     tags: [Commercial Properties]
 *     responses:
 *       200:
 *         description: All properties deleted successfully
 */
router.delete('/all', deleteAllCommercialProperties);

module.exports = router; 