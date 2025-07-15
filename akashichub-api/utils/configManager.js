import redisClient from '../config/redis.js';
import logger from './logger.js';

/**
 * 配置管理器
 * 提供系統配置的查看和管理功能
 */

export class ConfigManager {
  
  /**
   * 獲取系統完整配置資訊
   */
  static getSystemConfig() {
    return {
      environment: process.env.NODE_ENV || 'development',
      server: {
        port: process.env.PORT || 3000,
        host: '0.0.0.0'
      },
      database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        // 不返回密碼資訊
        hasPassword: !!process.env.DB_PASSWORD
      },
      redis: this.getRedisConfig(),
      jwt: {
        hasSecret: !!process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      },
      logging: {
        seqUrl: process.env.SEQ_URL,
        hasSeqApiKey: !!process.env.SEQ_API_KEY
      },
      security: {
        hasEncryptionKey: !!process.env.ENCRYPTION_KEY,
        encryptionKeyLength: process.env.ENCRYPTION_KEY?.length || 0
      }
    };
  }

  /**
   * 獲取Redis配置和狀態
   */
  static getRedisConfig() {
    const connectionInfo = redisClient.getConnectionInfo();
    
    return {
      enabled: connectionInfo.enabled,
      host: connectionInfo.host,
      port: connectionInfo.port,
      db: connectionInfo.db,
      status: {
        isConnected: connectionInfo.isConnected,
        connectionStatus: connectionInfo.status
      }
    };
  }

  /**
   * 獲取Redis統計資訊
   */
  static async getRedisStats() {
    if (!redisClient.isRedisEnabled()) {
      return {
        enabled: false,
        message: 'Redis未啟用'
      };
    }

    try {
      const client = redisClient.getClient();
      
      // 獲取Redis資訊
      const info = await client.info();
      const keyCount = await client.dbsize();
      
      // 解析info資訊
      const infoLines = info.split('\r\n');
      const infoObj = {};
      
      for (const line of infoLines) {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          infoObj[key] = value;
        }
      }

      return {
        enabled: true,
        connected: redisClient.isReady(),
        keyCount,
        memory: {
          used: infoObj.used_memory_human,
          peak: infoObj.used_memory_peak_human,
          rss: infoObj.used_memory_rss_human
        },
        stats: {
          totalConnectionsReceived: infoObj.total_connections_received,
          totalCommandsProcessed: infoObj.total_commands_processed,
          keyspaceHits: infoObj.keyspace_hits,
          keyspaceMisses: infoObj.keyspace_misses
        },
        server: {
          version: infoObj.redis_version,
          uptime: infoObj.uptime_in_seconds
        }
      };

    } catch (error) {
      logger.error('獲取Redis統計失敗', { error: error.message });
      return {
        enabled: true,
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * 檢查系統健康狀態
   */
  static async checkSystemHealth() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {}
    };

    // 檢查環境變數
    health.checks.environment = {
      status: 'ok',
      hasRequiredVars: !!(
        process.env.JWT_SECRET &&
        process.env.DB_HOST &&
        process.env.DB_USER &&
        process.env.DB_PASSWORD &&
        process.env.ENCRYPTION_KEY
      )
    };

    // 檢查Redis（如果啟用）
    if (redisClient.isRedisEnabled()) {
      try {
        await redisClient.getClient().ping();
        health.checks.redis = {
          status: 'ok',
          connected: true
        };
      } catch (error) {
        health.checks.redis = {
          status: 'warning',
          connected: false,
          error: error.message
        };
        health.status = 'degraded';
      }
    } else {
      health.checks.redis = {
        status: 'disabled',
        message: 'Redis未啟用'
      };
    }

    // 檢查加密金鑰
    const encryptionKeyLength = process.env.ENCRYPTION_KEY?.length || 0;
    health.checks.encryption = {
      status: encryptionKeyLength === 32 ? 'ok' : 'error',
      keyLength: encryptionKeyLength,
      valid: encryptionKeyLength === 32
    };

    if (health.checks.encryption.status === 'error') {
      health.status = 'unhealthy';
    }

    return health;
  }

  /**
   * 獲取功能配置狀態
   */
  static getFeatureConfig() {
    return {
      cache: {
        enabled: redisClient.isRedisEnabled(),
        type: redisClient.isRedisEnabled() ? 'redis' : 'memory',
        description: redisClient.isRedisEnabled() 
          ? 'Redis快取已啟用' 
          : '使用內存快取（無持久化）'
      },
      rateLimit: {
        enabled: true,
        description: '請求速率限制已啟用'
      },
      cors: {
        enabled: true,
        description: 'CORS跨域請求已配置'
      },
      logging: {
        enabled: true,
        targets: ['console', process.env.SEQ_URL ? 'seq' : null].filter(Boolean),
        description: `日誌輸出到: ${['控制台', process.env.SEQ_URL ? 'Seq' : null].filter(Boolean).join(', ')}`
      },
      swagger: {
        enabled: true,
        url: '/api-docs',
        description: 'API文檔已啟用'
      }
    };
  }

  /**
   * 驗證配置完整性
   */
  static validateConfig() {
    const issues = [];
    const warnings = [];

    // 檢查必要的環境變數
    const requiredVars = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'ENCRYPTION_KEY'];
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        issues.push(`缺少必要的環境變數: ${varName}`);
      }
    }

    // 檢查加密金鑰長度
    if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length !== 32) {
      issues.push(`ENCRYPTION_KEY長度必須為32位元組，當前為${process.env.ENCRYPTION_KEY.length}位元組`);
    }

    // 檢查Redis配置（如果啟用）
    if (process.env.REDIS_ENABLED === 'true') {
      if (!process.env.REDIS_HOST) {
        warnings.push('Redis已啟用但未設定REDIS_HOST，將使用預設值localhost');
      }
      if (!process.env.REDIS_PORT) {
        warnings.push('Redis已啟用但未設定REDIS_PORT，將使用預設值6379');
      }
    }

    // 檢查資料庫連接埠
    if (process.env.DB_PORT && isNaN(parseInt(process.env.DB_PORT))) {
      issues.push('DB_PORT必須為數字');
    }

    // 檢查JWT過期時間格式
    if (process.env.JWT_EXPIRES_IN && !/^(\d+[smhdwy]|\d+)$/.test(process.env.JWT_EXPIRES_IN)) {
      warnings.push('JWT_EXPIRES_IN格式可能不正確，建議使用如"7d"、"24h"等格式');
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings,
      summary: `${issues.length}個錯誤，${warnings.length}個警告`
    };
  }
}

export default ConfigManager;