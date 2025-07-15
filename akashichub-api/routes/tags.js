import express from "express";
import { getAllTags, createTag, updateTag, deleteTag } from "../controllers/tagController.js";
import { authenticateToken, authorizeAdmin } from "../middlewares/authMiddleware.js";
import { validateRequired, validateIdParam } from "../middlewares/validation.js";
import { tagListCache, invalidateTagCache } from "../middlewares/cache.js";

const router = express.Router();

// 所有請求需驗證
router.use(authenticateToken);

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: 取得所有標籤
 *     description: 取得系統中所有標籤，按分類分組
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: 成功取得標籤列表
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
 *                     $ref: '#/components/schemas/Tag'
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", tagListCache, getAllTags);

/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: 新增標籤
 *     description: 新增標籤分類（僅管理員可用）
 *     tags: [Tags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 description: 標籤名稱
 *                 example: "生產環境"
 *               category:
 *                 type: string
 *                 description: 標籤分類
 *                 example: "環境"
 *     responses:
 *       201:
 *         description: 標籤建立成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 *       400:
 *         description: 請求參數錯誤
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
  authorizeAdmin, 
  validateRequired(["name", "category"]), 
  invalidateTagCache,
  createTag
);

/**
 * @swagger
 * /api/tags/{id}:
 *   put:
 *     summary: 更新標籤
 *     description: 更新指定標籤的資訊（僅管理員可用）
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 標籤ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 標籤名稱
 *                 example: "生產環境"
 *               category:
 *                 type: string
 *                 description: 標籤分類
 *                 example: "環境"
 *     responses:
 *       200:
 *         description: 標籤更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 *       404:
 *         description: 標籤不存在
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
router.put("/:id", validateIdParam, authorizeAdmin, invalidateTagCache, updateTag);

/**
 * @swagger
 * /api/tags/{id}:
 *   delete:
 *     summary: 刪除標籤
 *     description: 刪除指定標籤（僅管理員可用）
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 標籤ID
 *     responses:
 *       200:
 *         description: 標籤刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: 標籤不存在
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
router.delete("/:id", validateIdParam, authorizeAdmin, invalidateTagCache, deleteTag);

export default router;
