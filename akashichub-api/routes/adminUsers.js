import express from "express";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/userController.js";
import { authenticateToken, authorizeAdmin } from "../middlewares/authMiddleware.js";
import { validateRequired, validateIdParam, validateRole } from "../middlewares/validation.js";
import { adminLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: 取得所有用戶
 *     description: 取得系統中所有用戶列表（僅管理員可用）
 *     tags: [Admin - Users]
 *     responses:
 *       200:
 *         description: 成功取得用戶列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 權限不足（需要管理員權限）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", authenticateToken, adminLimiter, authorizeAdmin, getUsers);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: 新增用戶
 *     description: 新增系統用戶（僅管理員可用）
 *     tags: [Admin - Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - loginAccount
 *               - displayName
 *               - password
 *             properties:
 *               loginAccount:
 *                 type: string
 *                 description: 登入帳號（唯一）
 *                 example: "john_doe"
 *               displayName:
 *                 type: string
 *                 description: 顯示名稱
 *                 example: "John Doe"
 *               password:
 *                 type: string
 *                 description: 登入密碼
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: ["Admin", "User"]
 *                 default: "User"
 *                 description: 用戶角色
 *                 example: "User"
 *     responses:
 *       201:
 *         description: 用戶建立成功
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
 *       400:
 *         description: 請求參數錯誤或帳號已存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 權限不足（需要管理員權限）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", 
  authenticateToken, 
  adminLimiter,
  authorizeAdmin, 
  validateRequired(["loginAccount", "displayName", "password"]),
  validateRole,
  createUser
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: 更新用戶
 *     description: 更新指定用戶的資訊（僅管理員可用）
 *     tags: [Admin - Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用戶ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               loginAccount:
 *                 type: string
 *                 description: 登入帳號（唯一）
 *                 example: "john_doe"
 *               displayName:
 *                 type: string
 *                 description: 顯示名稱
 *                 example: "John Doe"
 *               password:
 *                 type: string
 *                 description: 新密碼（如果要更改）
 *                 example: "newpassword123"
 *               role:
 *                 type: string
 *                 enum: ["Admin", "User"]
 *                 description: 用戶角色
 *                 example: "User"
 *     responses:
 *       200:
 *         description: 用戶更新成功
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
 *       404:
 *         description: 用戶不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: 請求參數錯誤或帳號已存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 權限不足（需要管理員權限）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", 
  validateIdParam,
  authenticateToken, 
  adminLimiter,
  authorizeAdmin, 
  validateRole,
  updateUser
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: 刪除用戶
 *     description: 刪除指定用戶（僅管理員可用）
 *     tags: [Admin - Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用戶ID
 *     responses:
 *       200:
 *         description: 用戶刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: 用戶不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: 權限不足（需要管理員權限）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", validateIdParam, authenticateToken, adminLimiter, authorizeAdmin, deleteUser);

export default router;
