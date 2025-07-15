import express from "express";
import { login, me } from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { loginLimiter } from "../middlewares/rateLimiter.js";
import { userInfoCache } from "../middlewares/cache.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 用戶登入
 *     description: 驗證用戶帳號密碼並返回JWT Token
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - loginAccount
 *               - password
 *             properties:
 *               loginAccount:
 *                 type: string
 *                 description: 登入帳號
 *                 example: "akashic_user"
 *               password:
 *                 type: string
 *                 description: 登入密碼
 *                 example: "akashic_password"
 *     responses:
 *       200:
 *         description: 登入成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT Token
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: 帳號或密碼錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/login", loginLimiter, login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 取得當前用戶資訊
 *     description: 根據JWT Token返回當前登入用戶的資訊
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得用戶資訊
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 未授權或Token無效
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/me", authenticateToken, userInfoCache, me);

export default router;
