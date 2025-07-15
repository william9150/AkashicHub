import redisClient from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * 會話管理快取中間件
 * 用於管理用戶會話狀態和登出功能
 */

// 會話快取鍵前綴
const SESSION_PREFIX = 'session';
const BLACKLIST_PREFIX = 'blacklist';

/**
 * 生成會話快取鍵
 */
function generateSessionKey(userId) {
  return `${SESSION_PREFIX}:${userId}`;
}

/**
 * 生成黑名單快取鍵
 */
function generateBlacklistKey(tokenId) {
  return `${BLACKLIST_PREFIX}:${tokenId}`;
}

/**
 * 儲存用戶會話
 */
export async function storeSession(userId, sessionData, ttl = 7 * 24 * 3600) {
  if (!redisClient.isRedisEnabled()) {
    logger.warn('Redis未啟用，會話狀態將不會持久化');
    return false;
  }

  try {
    const sessionKey = generateSessionKey(userId);
    
    // 存儲會話數據
    await redisClient.set(sessionKey, {
      userId,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      ...sessionData
    }, ttl);

    logger.info('會話已儲存', { userId, sessionKey });
    return true;
  } catch (error) {
    logger.error('儲存會話失敗', { error: error.message, userId });
    return false;
  }
}

/**
 * 取得用戶會話
 */
export async function getSession(userId) {
  if (!redisClient.isRedisEnabled()) {
    return null;
  }

  try {
    const sessionKey = generateSessionKey(userId);
    const sessionData = await redisClient.get(sessionKey);
    
    if (sessionData) {
      // 更新最後活動時間
      await redisClient.set(sessionKey, {
        ...sessionData,
        lastActivity: new Date().toISOString()
      }, await redisClient.ttl(sessionKey));
      
      logger.debug('會話已取得', { userId, sessionKey });
    }
    
    return sessionData;
  } catch (error) {
    logger.error('取得會話失敗', { error: error.message, userId });
    return null;
  }
}

/**
 * 刪除用戶會話
 */
export async function deleteSession(userId) {
  if (!redisClient.isRedisEnabled()) {
    return false;
  }

  try {
    const sessionKey = generateSessionKey(userId);
    await redisClient.del(sessionKey);
    
    logger.info('會話已刪除', { userId, sessionKey });
    return true;
  } catch (error) {
    logger.error('刪除會話失敗', { error: error.message, userId });
    return false;
  }
}

/**
 * 將Token加入黑名單
 */
export async function blacklistToken(tokenId, ttl = 7 * 24 * 3600) {
  if (!redisClient.isRedisEnabled()) {
    logger.warn('Redis未啟用，Token黑名單將不會生效');
    return false;
  }

  try {
    const blacklistKey = generateBlacklistKey(tokenId);
    await redisClient.set(blacklistKey, {
      tokenId,
      blacklistedAt: new Date().toISOString()
    }, ttl);

    logger.info('Token已加入黑名單', { tokenId, blacklistKey });
    return true;
  } catch (error) {
    logger.error('加入Token黑名單失敗', { error: error.message, tokenId });
    return false;
  }
}

/**
 * 檢查Token是否在黑名單中
 */
export async function isTokenBlacklisted(tokenId) {
  if (!redisClient.isRedisEnabled()) {
    return false;
  }

  try {
    const blacklistKey = generateBlacklistKey(tokenId);
    const blacklistData = await redisClient.get(blacklistKey);
    
    return blacklistData !== null;
  } catch (error) {
    logger.error('檢查Token黑名單失敗', { error: error.message, tokenId });
    return false;
  }
}

/**
 * 清理過期會話
 */
export async function cleanupExpiredSessions() {
  if (!redisClient.isRedisEnabled()) {
    return { cleaned: 0, message: 'Redis未啟用' };
  }

  try {
    const sessionKeys = await redisClient.keys(`${SESSION_PREFIX}:*`);
    let cleanedCount = 0;

    for (const key of sessionKeys) {
      const ttl = await redisClient.ttl(key);
      if (ttl === -1) { // 無過期時間的鍵
        await redisClient.del(key);
        cleanedCount++;
      }
    }

    logger.info('過期會話清理完成', { cleanedCount });
    return { cleaned: cleanedCount };
  } catch (error) {
    logger.error('清理過期會話失敗', { error: error.message });
    return { cleaned: 0, error: error.message };
  }
}

/**
 * 取得活躍會話統計
 */
export async function getSessionStats() {
  if (!redisClient.isRedisEnabled()) {
    return { enabled: false };
  }

  try {
    const sessionKeys = await redisClient.keys(`${SESSION_PREFIX}:*`);
    const blacklistKeys = await redisClient.keys(`${BLACKLIST_PREFIX}:*`);
    
    const stats = {
      enabled: true,
      activeSessions: sessionKeys.length,
      blacklistedTokens: blacklistKeys.length,
      sessionKeys: sessionKeys.slice(0, 10), // 只返回前10個作為示例
      lastUpdated: new Date().toISOString()
    };

    return stats;
  } catch (error) {
    logger.error('取得會話統計失敗', { error: error.message });
    return { enabled: true, error: error.message };
  }
}

/**
 * 會話驗證中間件
 */
export function sessionValidationMiddleware() {
  return async (req, res, next) => {
    // 如果沒有用戶資訊，跳過會話驗證
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const tokenId = req.user.tokenId; // 需要在JWT中包含tokenId

    try {
      // 檢查Token是否在黑名單中
      if (tokenId && await isTokenBlacklisted(tokenId)) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'TOKEN_BLACKLISTED',
            message: 'Token已被列入黑名單'
          }
        });
      }

      // 檢查會話是否存在
      const sessionData = await getSession(userId);
      if (sessionData) {
        // 將會話資料附加到請求中
        req.session = sessionData;
      }

      next();
    } catch (error) {
      logger.error('會話驗證失敗', { error: error.message, userId });
      next(); // 發生錯誤時繼續正常流程
    }
  };
}

export default {
  storeSession,
  getSession,
  deleteSession,
  blacklistToken,
  isTokenBlacklisted,
  cleanupExpiredSessions,
  getSessionStats,
  sessionValidationMiddleware
};