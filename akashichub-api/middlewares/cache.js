import redisClient from '../config/redis.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';

/**
 * 快取中間件
 * 僅在Redis啟用時生效，否則跳過快取
 */

// 生成快取鍵
function generateCacheKey(req, prefix = 'api') {
  const { method, originalUrl, user } = req;
  const userId = user?.id || 'anonymous';
  const queryParams = JSON.stringify(req.query);
  const bodyParams = method !== 'GET' ? JSON.stringify(req.body) : '';
  
  // 創建基於請求內容的唯一鍵
  const content = `${method}:${originalUrl}:${userId}:${queryParams}:${bodyParams}`;
  const hash = crypto.createHash('md5').update(content).digest('hex');
  
  return `${prefix}:${hash}`;
}

// 通用快取中間件
export function cacheMiddleware(options = {}) {
  const {
    ttl = 300, // 預設5分鐘
    prefix = 'api',
    skipCache = false,
    cacheCondition = null // 自定義快取條件函數
  } = options;

  return async (req, res, next) => {
    // 如果Redis未啟用或明確跳過快取，直接繼續
    if (!redisClient.isRedisEnabled() || skipCache) {
      return next();
    }

    // 只快取GET請求
    if (req.method !== 'GET') {
      return next();
    }

    // 檢查自定義快取條件
    if (cacheCondition && !cacheCondition(req)) {
      return next();
    }

    const cacheKey = generateCacheKey(req, prefix);

    try {
      // 嘗試從快取獲取資料
      const cachedData = await redisClient.get(cacheKey);
      
      if (cachedData) {
        logger.info('快取命中', { cacheKey, url: req.originalUrl });
        
        // 設置快取相關的回應頭
        res.set({
          'X-Cache': 'HIT',
          'X-Cache-Key': cacheKey,
          'X-Cache-TTL': await redisClient.ttl(cacheKey)
        });
        
        return res.json(cachedData);
      }

      // 快取未命中，包裝原始回應
      const originalJson = res.json;
      
      res.json = function(data) {
        // 只快取成功的回應
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 異步儲存到快取，不影響回應時間
          setImmediate(async () => {
            try {
              await redisClient.set(cacheKey, data, ttl);
              logger.info('資料已快取', { cacheKey, url: req.originalUrl, ttl });
            } catch (error) {
              logger.error('快取設置失敗', { error: error.message, cacheKey });
            }
          });
        }

        // 設置快取相關的回應頭
        res.set({
          'X-Cache': 'MISS',
          'X-Cache-Key': cacheKey
        });

        return originalJson.call(this, data);
      };

      next();

    } catch (error) {
      logger.error('快取中間件錯誤', { error: error.message, url: req.originalUrl });
      next(); // 發生錯誤時繼續正常流程
    }
  };
}

// 特定類型的快取中間件

// 資源列表快取
export const resourceListCache = cacheMiddleware({
  ttl: 600, // 10分鐘
  prefix: 'resources:list'
});

// 標籤列表快取
export const tagListCache = cacheMiddleware({
  ttl: 1800, // 30分鐘
  prefix: 'tags:list'
});

// 用戶資訊快取
export const userInfoCache = cacheMiddleware({
  ttl: 900, // 15分鐘
  prefix: 'user:info'
});

// 統計資料快取
export const statsCache = cacheMiddleware({
  ttl: 3600, // 1小時
  prefix: 'stats'
});

// 快取清理中間件
export function cacheInvalidateMiddleware(patterns = []) {
  return async (req, res, next) => {
    // 只在非GET請求後清理快取
    if (req.method === 'GET') {
      return next();
    }

    const originalJson = res.json;
    
    res.json = function(data) {
      // 只在成功回應後清理快取
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setImmediate(async () => {
          try {
            for (const pattern of patterns) {
              const keys = await redisClient.keys(pattern);
              if (keys.length > 0) {
                await redisClient.del(...keys);
                logger.info('快取已清理', { pattern, deletedKeys: keys.length });
              }
            }
          } catch (error) {
            logger.error('快取清理失敗', { error: error.message, patterns });
          }
        });
      }

      return originalJson.call(this, data);
    };

    next();
  };
}

// 特定資源的快取清理

// 資源相關快取清理
export const invalidateResourceCache = cacheInvalidateMiddleware([
  'resources:*',
  'stats:*'
]);

// 標籤相關快取清理
export const invalidateTagCache = cacheInvalidateMiddleware([
  'tags:*',
  'resources:*', // 標籤變更會影響資源列表
  'stats:*'
]);

// 用戶相關快取清理
export const invalidateUserCache = cacheInvalidateMiddleware([
  'user:*',
  'stats:*'
]);

// 手動快取管理工具
export const cacheManager = {
  // 清理所有快取
  async clearAll() {
    if (!redisClient.isRedisEnabled()) {
      logger.warn('Redis未啟用，無法清理快取');
      return false;
    }

    try {
      await redisClient.flushdb();
      logger.info('所有快取已清理');
      return true;
    } catch (error) {
      logger.error('清理所有快取失敗', { error: error.message });
      return false;
    }
  },

  // 根據模式清理快取
  async clearByPattern(pattern) {
    if (!redisClient.isRedisEnabled()) {
      logger.warn('Redis未啟用，無法清理快取');
      return false;
    }

    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
        logger.info('模式快取已清理', { pattern, deletedKeys: keys.length });
      }
      return true;
    } catch (error) {
      logger.error('清理模式快取失敗', { error: error.message, pattern });
      return false;
    }
  },

  // 獲取快取統計
  async getStats() {
    if (!redisClient.isRedisEnabled()) {
      return { enabled: false };
    }

    try {
      const allKeys = await redisClient.keys('*');
      const stats = {
        enabled: true,
        totalKeys: allKeys.length,
        keysByPrefix: {}
      };

      // 按前綴分組統計
      for (const key of allKeys) {
        const prefix = key.split(':')[0];
        stats.keysByPrefix[prefix] = (stats.keysByPrefix[prefix] || 0) + 1;
      }

      return stats;
    } catch (error) {
      logger.error('獲取快取統計失敗', { error: error.message });
      return { enabled: true, error: error.message };
    }
  }
};

export default {
  cacheMiddleware,
  resourceListCache,
  tagListCache,
  userInfoCache,
  statsCache,
  invalidateResourceCache,
  invalidateTagCache,
  invalidateUserCache,
  cacheManager
};