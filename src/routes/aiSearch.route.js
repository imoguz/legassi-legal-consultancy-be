"use strict";

const router = require("express").Router();
const jwtVerification = require("../middlewares/jwt.verification");
const requireAuth = require("../middlewares/requireAuth");
const {
  search,
  getUserQueries,
} = require("../controllers/aiSearch.controller");

/**
 * @swagger
 * /ai-search:
 *   post:
 *     summary: Send a legal question to the AI service.
 *     tags:
 *       - AI Search
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 example: How is alimony calculated in a divorce case?
 *     responses:
 *       200:
 *         description: AI response to the query
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: object
 *                   properties:
 *                     answer:
 *                       type: string
 *                       example: Alimony is typically calculated based on several factors...
 *                     confidence:
 *                       type: number
 *                       example: 0.95
 *                     source:
 *                       type: string
 *                       example: mock
 *       400:
 *         description: Bad request – query is missing
 *       401:
 *         description: Unauthorized – missing or invalid token
 */
router.post("/", jwtVerification, requireAuth(), search);

/**
 * @swagger
 * /ai-search:
 *   get:
 *     summary: Retrieve past AI search queries of the authenticated user.
 *     tags:
 *       - AI Search
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of previous queries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   query:
 *                     type: string
 *                   response:
 *                     type: object
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get("/user-queries", jwtVerification, requireAuth(), getUserQueries);

module.exports = router;
