import Redis from 'ioredis';
import logger from '../utils/logger.js';

// Redis配置選項
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || null,
  db: process.env.REDIS_DB || 0,
  
  // 連接選項
  connectTimeout: 10000,
  commandTimeout: 5000,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  
  // 連接池選項
  lazyConnect: true,
  keepAlive: 30000,
  
  // 重連選項
  retryDelayOnClusterDown: 300,
  retryDelayOnClusterState: 100,
  maxRetriesPerRequest: null,
  
  // 自定義重試策略
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  
  // 連接名稱（便於調試）
  connectionName: `akashichub-api-${process.env.NODE_ENV || 'development'}`
};

// 創建Redis客戶端實例
class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.isEnabled = process.env.REDIS_ENABLED === 'true';
    this.init();
  }

  // 初始化Redis連接
  async init() {
    // 檢查是否啟用Redis
    if (!this.isEnabled) {
      logger.info('Redis未啟用，使用模擬客戶端');
      this.createMockClient();
      return;
    }

    try {
      this.client = new Redis(redisConfig);
      
      // 監聽連接事件
      this.client.on('connect', () => {
        logger.info('Redis連接建立成功');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        logger.info('Redis客戶端準備就緒');
      });

      this.client.on('error', (error) => {
        logger.error('Redis連接錯誤', { error: error.message });
        this.isConnected = false;
      });

      this.client.on('close', () => {
        logger.warn('Redis連接已關閉');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        logger.info('Redis重新連接中...');
      });

      // 測試連接
      await this.client.ping();
      logger.info('Redis連接測試成功');
      
    } catch (error) {
      logger.error('Redis初始化失敗', { error: error.message });
      
      // 如果Redis連接失敗，創建一個模擬客戶端
      this.createMockClient();
    }
  }

  // 創建模擬客戶端（當Redis不可用或未啟用時）
  createMockClient() {
    const reason = !this.isEnabled ? 'Redis未啟用' : 'Redis服務不可用';
    logger.info(`使用Redis模擬客戶端（${reason}）`);
    
    this.client = {
      get: async () => null,
      set: async () => 'OK',
      del: async () => 1,
      exists: async () => 0,
      expire: async () => 1,
      ttl: async () => -1,
      keys: async () => [],
      flushdb: async () => 'OK',
      ping: async () => 'PONG',
      disconnect: async () => {}
    };
    
    this.isConnected = false;
  }

  // 檢查Redis是否啟用
  isRedisEnabled() {
    return this.isEnabled;
  }

  // 獲取客戶端實例
  getClient() {
    return this.client;
  }

  // 檢查連接狀態
  isReady() {
    if (!this.isEnabled) {
      return false;
    }
    return this.isConnected && this.client.status === 'ready';
  }

  // 安全的Redis操作包裝器
  async safeOperation(operation, fallback = null) {
    try {
      if (!this.isEnabled) {
        // Redis未啟用，直接返回fallback
        return fallback;
      }
      
      if (!this.isReady()) {
        logger.warn('Redis不可用，跳過快取操作');
        return fallback;
      }
      
      return await operation();
    } catch (error) {
      logger.error('Redis操作失敗', { error: error.message });
      return fallback;
    }
  }

  // 設置快取
  async set(key, value, ttl = 3600) {
    return this.safeOperation(async () => {
      const serializedValue = JSON.stringify(value);
      if (ttl > 0) {
        return await this.client.setex(key, ttl, serializedValue);
      } else {
        return await this.client.set(key, serializedValue);
      }
    });
  }

  // 獲取快取
  async get(key) {
    return this.safeOperation(async () => {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    });
  }

  // 刪除快取
  async del(key) {
    return this.safeOperation(async () => {
      return await this.client.del(key);
    });
  }

  // 檢查鍵是否存在
  async exists(key) {
    return this.safeOperation(async () => {
      return await this.client.exists(key);
    });
  }

  // 設置過期時間
  async expire(key, ttl) {
    return this.safeOperation(async () => {
      return await this.client.expire(key, ttl);
    });
  }

  // 獲取TTL
  async ttl(key) {
    return this.safeOperation(async () => {
      return await this.client.ttl(key);
    });
  }

  // 模糊查詢鍵
  async keys(pattern) {
    return this.safeOperation(async () => {
      return await this.client.keys(pattern);
    }, []);
  }

  // 清空資料庫
  async flushdb() {
    return this.safeOperation(async () => {
      return await this.client.flushdb();
    });
  }

  // 關閉連接
  async disconnect() {
    try {
      if (this.client && typeof this.client.disconnect === 'function') {
        await this.client.disconnect();
        logger.info('Redis連接已關閉');
      }
    } catch (error) {
      logger.error('關閉Redis連接失敗', { error: error.message });
    }
  }

  // 獲取連接資訊
  getConnectionInfo() {
    return {
      enabled: this.isEnabled,
      host: redisConfig.host,
      port: redisConfig.port,
      db: redisConfig.db,
      isConnected: this.isConnected,
      status: this.client?.status || 'unknown'
    };
  }
}

// 創建全域Redis客戶端實例
const redisClient = new RedisClient();

// 優雅關閉處理
process.on('SIGINT', async () => {
  await redisClient.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await redisClient.disconnect();
  process.exit(0);
});

export default redisClient;