import express from "express";
import { getResources, createResource, getResource, updateResource, deleteResource, decryptPassword } from "../controllers/resourceController.js";
import { authenticateToken, authorizeAdmin } from "../middlewares/authMiddleware.js";
import { validateRequired, validateIdParam, validateResourceType, validatePagination } from "../middlewares/validation.js";
import { passwordDecryptLimiter, adminLimiter } from "../middlewares/rateLimiter.js";
import { resourceListCache, invalidateResourceCache } from "../middlewares/cache.js";

const router = express.Router();

// 所有請求需驗證
router.use(authenticateToken);

/**
 * @swagger
 * /api/resources:
 *   get:
 *     summary: 取得資源列表
 *     description: 分頁查詢資源，支援關鍵字搜尋和標籤篩選
 *     tags: [Resources]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 頁碼
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每頁項目數
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 關鍵字搜尋（資源名稱、IP位址、描述）
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: 標籤篩選（逗號分隔）
 *     responses:
 *       200:
 *         description: 成功取得資源列表
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
 *                     resources:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Resource'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", resourceListCache, validatePagination, getResources);

/**
 * @swagger
 * /api/resources:
 *   post:
 *     summary: 新增資源
 *     description: 新增IT資源（僅管理員可用）
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resourceType
 *               - name
 *             properties:
 *               resourceType:
 *                 type: string
 *                 description: 資源類型
 *                 example: "伺服器"
 *               name:
 *                 type: string
 *                 description: 資源名稱
 *                 example: "主要Web伺服器"
 *               ipAddress:
 *                 type: string
 *                 description: IP位址
 *                 example: "192.168.1.100"
 *               loginUser:
 *                 type: string
 *                 description: 登入用戶名
 *                 example: "admin"
 *               loginPassword:
 *                 type: string
 *                 description: 登入密碼（將被加密存儲）
 *                 example: "password123"
 *               description:
 *                 type: string
 *                 description: 資源描述
 *                 example: "主要的生產環境Web伺服器"
 *               port:
 *                 type: integer
 *                 description: 端口號
 *                 example: 80
 *               dbName:
 *                 type: string
 *                 description: 資料庫名稱
 *                 example: "production_db"
 *               dbVersion:
 *                 type: string
 *                 description: 資料庫版本
 *                 example: "8.0.32"
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 標籤ID陣列
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: 資源建立成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Resource'
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
  adminLimiter,
  authorizeAdmin, 
  validateRequired(["resourceType", "name"]),
  validateResourceType,
  invalidateResourceCache,
  createResource
);

/**
 * @swagger
 * /api/resources/{id}:
 *   get:
 *     summary: 取得單一資源詳情
 *     description: 根據資源ID取得詳細資訊，包含關聯標籤和關係
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 資源ID
 *     responses:
 *       200:
 *         description: 成功取得資源詳情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Resource'
 *       404:
 *         description: 資源不存在
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
 */
router.get("/:id", validateIdParam, getResource);

/**
 * @swagger
 * /api/resources/{id}:
 *   put:
 *     summary: 更新資源
 *     description: 更新資源資訊（僅管理員可用）
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 資源ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resourceType:
 *                 type: string
 *                 description: 資源類型
 *               name:
 *                 type: string
 *                 description: 資源名稱
 *               ipAddress:
 *                 type: string
 *                 description: IP位址
 *               loginUser:
 *                 type: string
 *                 description: 登入用戶名
 *               loginPassword:
 *                 type: string
 *                 description: 登入密碼（將被加密存儲）
 *               description:
 *                 type: string
 *                 description: 資源描述
 *               port:
 *                 type: integer
 *                 description: 端口號
 *               dbName:
 *                 type: string
 *                 description: 資料庫名稱
 *               dbVersion:
 *                 type: string
 *                 description: 資料庫版本
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 標籤ID陣列
 *     responses:
 *       200:
 *         description: 資源更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Resource'
 *       404:
 *         description: 資源不存在
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
  adminLimiter,
  authorizeAdmin, 
  validateResourceType,
  invalidateResourceCache,
  updateResource
);

/**
 * @swagger
 * /api/resources/{id}:
 *   delete:
 *     summary: 刪除資源
 *     description: 刪除指定資源（僅管理員可用）
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 資源ID
 *     responses:
 *       200:
 *         description: 資源刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: 資源不存在
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
router.delete("/:id", validateIdParam, adminLimiter, authorizeAdmin, invalidateResourceCache, deleteResource);

/**
 * @swagger
 * /api/resources/{id}/decrypt-password:
 *   post:
 *     summary: 解密並取得密碼
 *     description: 解密指定資源的登入密碼
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 資源ID
 *     responses:
 *       200:
 *         description: 成功取得解密密碼
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
 *                     password:
 *                       type: string
 *                       description: 解密後的密碼
 *       404:
 *         description: 資源不存在
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
 */
router.post("/:id/decrypt-password", validateIdParam, passwordDecryptLimiter, decryptPassword);

export default router;
