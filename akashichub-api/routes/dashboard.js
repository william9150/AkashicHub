import express from 'express';
import { getDashboardStats, getSystemStatus } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 獲取儀表板統計資料
router.get('/stats', authenticateToken, getDashboardStats);

// 獲取系統狀態
router.get('/system-status', authenticateToken, getSystemStatus);

export default router;