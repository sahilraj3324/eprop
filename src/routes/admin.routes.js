const express = require('express');
const router = express.Router();
const {
  signupAdmin,
  loginAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  deleteAllAdmins,
  logoutAdmin,
  getCurrentAdmin,
} = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Admins
 *   description: Admin management and authentication
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Admin:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - phoneNumber
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Admin's full name
 *         email:
 *           type: string
 *           format: email
 *           description: Admin's email address
 *         phoneNumber:
 *           type: string
 *           description: Admin's phone number
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Admin's password
 *         role:
 *           type: string
 *           default: admin
 *           description: Admin role
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           default: active
 *           description: Admin account status
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     AdminLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Admin's email address
 *         password:
 *           type: string
 *           description: Admin's password
 *     AdminSignup:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - phoneNumber
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: Admin's full name
 *         email:
 *           type: string
 *           format: email
 *           description: Admin's email address
 *         phoneNumber:
 *           type: string
 *           description: Admin's phone number
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Admin's password
 */

/**
 * @swagger
 * /api/admin/signup:
 *   post:
 *     summary: Register a new admin
 *     tags: [Admins]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminSignup'
 *     responses:
 *       201:
 *         description: Admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 admin:
 *                   type: object
 *       400:
 *         description: Admin already exists or validation error
 *       500:
 *         description: Server error
 */
router.post('/signup', signupAdmin);

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admins]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminLogin'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 admin:
 *                   type: object
 *       401:
 *         description: Invalid credentials or inactive account
 *       400:
 *         description: Missing email or password
 *       500:
 *         description: Server error
 */
router.post('/login', loginAdmin);

/**
 * @swagger
 * /api/admin/logout:
 *   post:
 *     summary: Admin logout
 *     tags: [Admins]
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Server error
 */
router.post('/logout', logoutAdmin);

/**
 * @swagger
 * /api/admin/me:
 *   get:
 *     summary: Get current admin profile
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Server error
 */
router.get('/me', authenticate, getCurrentAdmin);

/**
 * @swagger
 * /api/admin:
 *   get:
 *     summary: Get all admins
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all admins
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 admins:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Admin'
 *       500:
 *         description: Server error
 */
router.get('/', getAllAdmins);

/**
 * @swagger
 * /api/admin/{id}:
 *   get:
 *     summary: Get admin by ID
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin found
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getAdminById);

/**
 * @swagger
 * /api/admin/{id}:
 *   put:
 *     summary: Update admin by ID (all fields)
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *       400:
 *         description: Email already taken or validation error
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Server error
 */
router.put('/:id', updateAdmin);

/**
 * @swagger
 * /api/admin/{id}:
 *   delete:
 *     summary: Delete admin by ID
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin deleted successfully
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteAdmin);

/**
 * @swagger
 * /api/admin:
 *   delete:
 *     summary: Delete all admins
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All admins deleted successfully
 *       500:
 *         description: Server error
 */
router.delete('/', deleteAllAdmins);

module.exports = router; 