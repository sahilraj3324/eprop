const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUser,
  deleteUser,
  deleteAllUsers,
} = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', getAllUsers);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single user
 */
router.get('/:id', getUserById);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - password
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+919876543210"
 *               password:
 *                 type: string
 *                 example: "mypassword123"
 *     responses:
 *       200:
 *         description: Login successful - JWT token set in cookie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     address:
 *                       type: string
 *                     status:
 *                       type: string
 *                     profilePic:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', logoutUser);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 */
router.put('/:id', updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
 */
router.delete('/:id', deleteUser);

/**
 * @swagger
 * /api/users:
 *   delete:
 *     summary: Delete all users
 *     tags: [Users]
 */
router.delete('/', deleteAllUsers);

module.exports = router; 