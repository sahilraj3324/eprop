const express = require('express');
const router = express.Router();
const {
  getAllItems,
  getItemById,
  getItemsByUserId,
  getItemsByCategory,
  createItem,
  updateItem,
  deleteItem,
  deleteAllItems,
} = require('../controllers/item.controller');

/**
 * @swagger
 * tags:
 *   name: Items
 *   description: Item management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       required:
 *         - title
 *         - price
 *         - location
 *         - user
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         title:
 *           type: string
 *           description: Item title
 *         description:
 *           type: string
 *           description: Item description
 *         price:
 *           type: number
 *           description: Item price
 *         category:
 *           type: string
 *           enum: [electronics, furniture, clothing, books, vehicles, appliances, sports, toys, other]
 *           description: Item category
 *         condition:
 *           type: string
 *           enum: [new, like-new, good, fair, poor]
 *           description: Item condition
 *         brand:
 *           type: string
 *           description: Item brand
 *         location:
 *           type: string
 *           description: Item location
 *         city:
 *           type: string
 *           description: City
 *         state:
 *           type: string
 *           description: State
 *         country:
 *           type: string
 *           description: Country
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *         isAvailable:
 *           type: boolean
 *           description: Item availability status
 *         user:
 *           type: string
 *           description: User ID who owns the item
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Get all items
 *     tags: [Items]
 *     responses:
 *       200:
 *         description: List of all items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 */
router.get('/', getAllItems);

/**
 * @swagger
 * /api/items/user/{userId}:
 *   get:
 *     summary: Get items by user ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of items for the user
 */
router.get('/user/:userId', getItemsByUserId);

/**
 * @swagger
 * /api/items/category/{category}:
 *   get:
 *     summary: Get items by category
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [electronics, furniture, clothing, books, vehicles, appliances, sports, toys, other]
 *         description: Item category
 *     responses:
 *       200:
 *         description: List of items in the category
 */
router.get('/category/:category', getItemsByCategory);

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Get item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: A single item
 *       404:
 *         description: Item not found
 */
router.get('/:id', getItemById);

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Create item
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       201:
 *         description: Item created successfully
 *       500:
 *         description: Server error
 */
router.post('/', createItem);

/**
 * @swagger
 * /api/items/{id}:
 *   put:
 *     summary: Update item
 *     tags: [Items]
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
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       404:
 *         description: Item not found
 */
router.put('/:id', updateItem);

/**
 * @swagger
 * /api/items/{id}:
 *   delete:
 *     summary: Delete item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *       404:
 *         description: Item not found
 */
router.delete('/:id', deleteItem);

/**
 * @swagger
 * /api/items:
 *   delete:
 *     summary: Delete all items
 *     tags: [Items]
 *     responses:
 *       200:
 *         description: All items deleted successfully
 */
router.delete('/', deleteAllItems);

module.exports = router; 