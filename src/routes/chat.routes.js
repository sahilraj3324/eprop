const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  createOrGetConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  getUnreadCount
} = require('../controllers/chat.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Conversation:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         itemId:
 *           $ref: '#/components/schemas/Item'
 *         sellerId:
 *           $ref: '#/components/schemas/User'
 *         buyerId:
 *           $ref: '#/components/schemas/User'
 *         lastMessage:
 *           type: string
 *         lastMessageAt:
 *           type: string
 *           format: date-time
 *         isActive:
 *           type: boolean
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         conversationId:
 *           type: string
 *         senderId:
 *           $ref: '#/components/schemas/User'
 *         message:
 *           type: string
 *         messageType:
 *           type: string
 *           enum: [text, image, system]
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/chat/conversations:
 *   post:
 *     summary: Create or get existing conversation
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: ID of the item to start conversation about
 *     responses:
 *       200:
 *         description: Conversation created or retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 conversation:
 *                   $ref: '#/components/schemas/Conversation'
 */
router.post('/conversations', authenticate, createOrGetConversation);

/**
 * @swagger
 * /api/chat/conversations:
 *   get:
 *     summary: Get all conversations for authenticated user
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 conversations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Conversation'
 */
router.get('/conversations', authenticate, getUserConversations);

/**
 * @swagger
 * /api/chat/conversations/{conversationId}/messages:
 *   get:
 *     summary: Get messages for a specific conversation
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
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
 *           default: 50
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 */
router.get('/conversations/:conversationId/messages', authenticate, getConversationMessages);

/**
 * @swagger
 * /api/chat/messages:
 *   post:
 *     summary: Send a message in a conversation
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversationId:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   $ref: '#/components/schemas/Message'
 */
router.post('/messages', authenticate, sendMessage);

/**
 * @swagger
 * /api/chat/unread-count:
 *   get:
 *     summary: Get unread message count for authenticated user
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 unreadCount:
 *                   type: integer
 */
router.get('/unread-count', authenticate, getUnreadCount);

module.exports = router; 