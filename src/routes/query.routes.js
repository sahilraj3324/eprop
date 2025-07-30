const express = require('express');
const router = express.Router();
const {
  submitQuery,
  getAllQueries,
  getUserQueries,
  getQueryById,
  updateQueryStatus,
  respondToQuery,
  deleteQuery,
  getQueryStats,
  submitSatisfactionRating,
} = require('../controllers/query.controller');
const { authenticate, authenticateAdmin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Queries
 *   description: User query management system
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Query:
 *       type: object
 *       required:
 *         - subject
 *         - message
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         userId:
 *           type: string
 *           description: ID of the user who submitted the query
 *         name:
 *           type: string
 *           description: User's name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email
 *         phone:
 *           type: string
 *           description: User's phone number
 *         subject:
 *           type: string
 *           description: Query subject
 *         message:
 *           type: string
 *           description: Query message content
 *         category:
 *           type: string
 *           enum: [general, property, item, technical, billing, complaint, suggestion]
 *           default: general
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           default: medium
 *         status:
 *           type: string
 *           enum: [pending, in-progress, resolved, closed]
 *           default: pending
 *         adminResponse:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *             respondedBy:
 *               type: string
 *             respondedAt:
 *               type: string
 *               format: date-time
 *         assignedTo:
 *           type: string
 *           description: ID of assigned admin
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         resolvedAt:
 *           type: string
 *           format: date-time
 *         userSatisfaction:
 *           type: object
 *           properties:
 *             rating:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             feedback:
 *               type: string
 *             ratedAt:
 *               type: string
 *               format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/queries/submit:
 *   post:
 *     summary: Submit a new query (User only)
 *     tags: [Queries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [general, property, item, technical, billing, complaint, suggestion]
 *     responses:
 *       201:
 *         description: Query submitted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/submit', authenticate, submitQuery);

/**
 * @swagger
 * /api/queries/my-queries:
 *   get:
 *     summary: Get queries for current user
 *     tags: [Queries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, resolved, closed]
 *     responses:
 *       200:
 *         description: User queries retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/my-queries', authenticate, getUserQueries);

/**
 * @swagger
 * /api/queries/{id}/rate:
 *   post:
 *     summary: Submit satisfaction rating for resolved query
 *     tags: [Queries]
 *     security:
 *       - bearerAuth: []
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
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               feedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rating submitted successfully
 *       400:
 *         description: Can only rate resolved queries
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to rate this query
 *       404:
 *         description: Query not found
 *       500:
 *         description: Server error
 */
router.post('/:id/rate', authenticate, submitSatisfactionRating);

// Admin routes
/**
 * @swagger
 * /api/queries/admin/all:
 *   get:
 *     summary: Get all queries (Admin only)
 *     tags: [Queries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, resolved, closed]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [general, property, item, technical, billing, complaint, suggestion]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All queries retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/admin/all', authenticateAdmin, getAllQueries);

/**
 * @swagger
 * /api/queries/admin/stats:
 *   get:
 *     summary: Get query statistics (Admin only)
 *     tags: [Queries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Query statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/admin/stats', authenticateAdmin, getQueryStats);

/**
 * @swagger
 * /api/queries/{id}:
 *   get:
 *     summary: Get query by ID
 *     tags: [Queries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Query retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to view this query
 *       404:
 *         description: Query not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticate, getQueryById);

/**
 * @swagger
 * /api/queries/{id}/status:
 *   put:
 *     summary: Update query status (Admin only)
 *     tags: [Queries]
 *     security:
 *       - bearerAuth: []
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
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, resolved, closed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               assignedTo:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Query status updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Query not found
 *       500:
 *         description: Server error
 */
router.put('/:id/status', authenticateAdmin, updateQueryStatus);

/**
 * @swagger
 * /api/queries/{id}/respond:
 *   post:
 *     summary: Add admin response to query (Admin only)
 *     tags: [Queries]
 *     security:
 *       - bearerAuth: []
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
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Response added successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Query not found
 *       500:
 *         description: Server error
 */
router.post('/:id/respond', authenticateAdmin, respondToQuery);

/**
 * @swagger
 * /api/queries/{id}:
 *   delete:
 *     summary: Delete query (Admin only)
 *     tags: [Queries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Query deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Query not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateAdmin, deleteQuery);

module.exports = router; 