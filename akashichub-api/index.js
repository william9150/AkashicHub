import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/auth.js";
import tagRouter from "./routes/tags.js";
import resourceRouter from "./routes/resources.js";
import adminUsersRouter from "./routes/adminUsers.js";
import logger from "./utils/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { generalLimiter } from "./middlewares/rateLimiter.js";
import { corsMiddleware } from "./config/cors.js";
import { specs, swaggerUi } from "./config/swagger.js";
import redisClient from "./config/redis.js";
// 導入模型關聯
import "./models/index.js";

// 載入環境變數
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 配置
app.use(corsMiddleware);

// 速率限制
app.use(generalLimiter);

// 解析 JSON 請求
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 記錄每個請求
app.use((req, res, next) => {
  const userId = req.user?.id || null;
  logger.info("HTTP Request", { method: req.method, url: req.url, userId });
  next();
});

// Swagger API 文檔
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'AkashicHub API Documentation'
}));

// 健康檢查 API
app.get("/api/health", async (req, res) => {
  try {
    const { ConfigManager } = await import("./utils/configManager.js");
    const health = await ConfigManager.checkSystemHealth();
    
    res.status(health.status === 'healthy' ? 200 : 503).json({
      success: health.status === 'healthy',
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "HEALTH_CHECK_ERROR", message: "健康檢查失敗" }
    });
  }
});

// 系統配置資訊 API (僅開發環境)
if (process.env.NODE_ENV === 'development') {
  app.get("/api/system/config", async (req, res) => {
    try {
      const { ConfigManager } = await import("./utils/configManager.js");
      const config = ConfigManager.getSystemConfig();
      const features = ConfigManager.getFeatureConfig();
      const validation = ConfigManager.validateConfig();
      
      res.json({
        success: true,
        data: {
          config,
          features,
          validation
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { code: "CONFIG_ERROR", message: "無法獲取系統配置" }
      });
    }
  });

  // Redis狀態和統計 API (僅開發環境)
  app.get("/api/system/redis", async (req, res) => {
    try {
      const { ConfigManager } = await import("./utils/configManager.js");
      const redisStats = await ConfigManager.getRedisStats();
      const { cacheManager } = await import("./middlewares/cache.js");
      const cacheStats = await cacheManager.getStats();
      
      res.json({
        success: true,
        data: {
          redis: redisStats,
          cache: cacheStats
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { code: "REDIS_STATUS_ERROR", message: "無法獲取Redis狀態" }
      });
    }
  });
}

// 掛載 auth 路由
app.use("/api/auth", authRouter);

// 掛載 tags 路由
app.use("/api/tags", tagRouter);

/* 掛載 resources 路由 */
app.use("/api/resources", resourceRouter);

/* 掛載 admin users 路由 */
app.use("/api/admin/users", adminUsersRouter);

// 全域錯誤處理
app.use(errorHandler);

// TODO: 掛載 routes、JWT 驗證、日誌等中介軟體

// TODO: 掛載 routes、JWT 驗證、日誌等中介軟體

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AkashicHub API server running on port ${PORT}`);
    console.log(`Swagger UI available at: http://localhost:${PORT}/api-docs`);
    console.log(`WSL IP access: http://172.23.128.89:${PORT}/api-docs`);
  });
}

export default app;
