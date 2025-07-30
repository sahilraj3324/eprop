const express = require('express');
const router = express.Router();
const {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  voteQuestion,
  updateQuestion,
  deleteQuestion,
  createAnswer,
  voteAnswer,
  markBestAnswer,
  addComment,
  voteComment,
  getCommunityStats,
  getUserActivity,
} = require('../controllers/community.controller');
const { authenticate, authenticateAdmin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Community Q&A
 *   description: Community question and answer system
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CommunityQuestion:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         title:
 *           type: string
 *           description: Question title
 *         content:
 *           type: string
 *           description: Question content
 *         author:
 *           type: string
 *           description: ID of the user who asked the question
 *         category:
 *           type: string
 *           enum: [property-buying, property-selling, rental, investment, legal, financing, maintenance, technology, general, market-trends]
 *           default: general
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         voteScore:
 *           type: number
 *           description: Net vote score (upvotes - downvotes)
 *         views:
 *           type: object
 *           properties:
 *             count:
 *               type: number
 *         answers:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of answer IDs
 *         bestAnswer:
 *           type: string
 *           description: ID of the best answer
 *         status:
 *           type: string
 *           enum: [active, closed, deleted, pending-review]
 *           default: active
 *         isPinned:
 *           type: boolean
 *           default: false
 *         isAnswered:
 *           type: boolean
 *           default: false
 *         lastActivity:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CommunityAnswer:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         content:
 *           type: string
 *           description: Answer content
 *         author:
 *           type: string
 *           description: ID of the user who provided the answer
 *         question:
 *           type: string
 *           description: ID of the question this answers
 *         voteScore:
 *           type: number
 *           description: Net vote score
 *         isBestAnswer:
 *           type: boolean
 *           default: false
 *         isAcceptedByAuthor:
 *           type: boolean
 *           default: false
 *         comments:
 *           type: array
 *           items:
 *             type: object
 *         status:
 *           type: string
 *           enum: [active, deleted, pending-review, hidden]
 *           default: active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// ===== QUESTION ROUTES =====

/**
 * @swagger
 * /api/community/questions:
 *   get:
 *     summary: Get all questions with filtering and pagination
 *     tags: [Community Q&A]
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
 *         name: category
 *         schema:
 *           type: string
 *           enum: [all, property-buying, property-selling, rental, investment, legal, financing, maintenance, technology, general, market-trends]
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *           description: Comma-separated list of tags
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [recent, popular, mostAnswered]
 *           default: recent
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, closed, deleted, pending-review]
 *           default: active
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/questions', getAllQuestions);

/**
 * @swagger
 * /api/community/questions:
 *   post:
 *     summary: Create a new question
 *     tags: [Community Q&A]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 300
 *               content:
 *                 type: string
 *                 maxLength: 5000
 *               category:
 *                 type: string
 *                 enum: [property-buying, property-selling, rental, investment, legal, financing, maintenance, technology, general, market-trends]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Question created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/questions', authenticate, createQuestion);

/**
 * @swagger
 * /api/community/questions/{id}:
 *   get:
 *     summary: Get question by ID with answers
 *     tags: [Community Q&A]
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
 *         description: Question retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
router.get('/questions/:id', authenticate, getQuestionById);

/**
 * @swagger
 * /api/community/questions/{id}:
 *   put:
 *     summary: Update question (author only)
 *     tags: [Community Q&A]
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
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to update this question
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
router.put('/questions/:id', authenticate, updateQuestion);

/**
 * @swagger
 * /api/community/questions/{id}:
 *   delete:
 *     summary: Delete question (author or admin only)
 *     tags: [Community Q&A]
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
 *         description: Question deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to delete this question
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
router.delete('/questions/:id', authenticate, deleteQuestion);

/**
 * @swagger
 * /api/community/questions/{id}/vote:
 *   post:
 *     summary: Vote on a question
 *     tags: [Community Q&A]
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
 *               - voteType
 *             properties:
 *               voteType:
 *                 type: string
 *                 enum: [upvote, downvote]
 *     responses:
 *       200:
 *         description: Vote updated successfully
 *       400:
 *         description: Cannot vote on your own question
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
router.post('/questions/:id/vote', authenticate, voteQuestion);

// ===== ANSWER ROUTES =====

/**
 * @swagger
 * /api/community/questions/{questionId}/answers:
 *   post:
 *     summary: Create an answer for a question
 *     tags: [Community Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 10000
 *     responses:
 *       201:
 *         description: Answer created successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Question not found or not active
 *       500:
 *         description: Server error
 */
router.post('/questions/:questionId/answers', authenticate, createAnswer);

/**
 * @swagger
 * /api/community/answers/{id}/vote:
 *   post:
 *     summary: Vote on an answer
 *     tags: [Community Q&A]
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
 *               - voteType
 *             properties:
 *               voteType:
 *                 type: string
 *                 enum: [upvote, downvote]
 *     responses:
 *       200:
 *         description: Vote updated successfully
 *       400:
 *         description: Cannot vote on your own answer
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Answer not found
 *       500:
 *         description: Server error
 */
router.post('/answers/:id/vote', authenticate, voteAnswer);

/**
 * @swagger
 * /api/community/answers/{id}/mark-best:
 *   post:
 *     summary: Mark answer as best answer (question author only)
 *     tags: [Community Q&A]
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
 *         description: Answer marked as best answer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only question author can mark best answer
 *       404:
 *         description: Answer not found
 *       500:
 *         description: Server error
 */
router.post('/answers/:id/mark-best', authenticate, markBestAnswer);

// ===== COMMENT ROUTES =====

/**
 * @swagger
 * /api/community/answers/{id}/comments:
 *   post:
 *     summary: Add comment to an answer
 *     tags: [Community Q&A]
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Answer not found
 *       500:
 *         description: Server error
 */
router.post('/answers/:id/comments', authenticate, addComment);

/**
 * @swagger
 * /api/community/answers/{answerId}/comments/{commentId}/vote:
 *   post:
 *     summary: Vote on a comment
 *     tags: [Community Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment vote updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Answer or comment not found
 *       500:
 *         description: Server error
 */
router.post('/answers/:answerId/comments/:commentId/vote', authenticate, voteComment);

// ===== STATISTICS AND USER ACTIVITY =====

/**
 * @swagger
 * /api/community/stats:
 *   get:
 *     summary: Get community statistics (admin only)
 *     tags: [Community Q&A]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/stats', authenticateAdmin, getCommunityStats);

/**
 * @swagger
 * /api/community/users/{userId}/activity:
 *   get:
 *     summary: Get user's questions and answers
 *     tags: [Community Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, questions, answers]
 *           default: all
 *     responses:
 *       200:
 *         description: User activity retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/users/:userId/activity', authenticate, getUserActivity);

/**
 * @swagger
 * /api/community/my-activity:
 *   get:
 *     summary: Get current user's questions and answers
 *     tags: [Community Q&A]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, questions, answers]
 *           default: all
 *     responses:
 *       200:
 *         description: User activity retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/my-activity', authenticate, getUserActivity);

module.exports = router; 