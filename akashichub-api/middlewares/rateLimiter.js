import rateLimit from 'express-rate-limit';

// 通用API速率限制
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 100, // 每個IP每15分鐘最多100個請求
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: '請求過於頻繁，請稍後再試'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  // 跳過成功的請求計數（可選）
  skipSuccessfulRequests: false,
  // 跳過失敗的請求計數（可選）
  skipFailedRequests: false
});

// 登入API嚴格速率限制
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 5, // 每個IP每15分鐘最多5次登入嘗試
  message: {
    success: false,
    error: {
      code: 'LOGIN_RATE_LIMIT_EXCEEDED',
      message: '登入嘗試次數過多，請15分鐘後再試'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  // 只對失敗的登入計數
  skipSuccessfulRequests: true
});

// 密碼解密API速率限制
export const passwordDecryptLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5分鐘
  max: 10, // 每個IP每5分鐘最多10次密碼解密請求
  message: {
    success: false,
    error: {
      code: 'DECRYPT_RATE_LIMIT_EXCEEDED',
      message: '密碼解密請求過於頻繁，請稍後再試'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 管理員操作速率限制
export const adminLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分鐘
  max: 30, // 每個IP每分鐘最多30個管理員操作
  message: {
    success: false,
    error: {
      code: 'ADMIN_RATE_LIMIT_EXCEEDED',
      message: '管理員操作過於頻繁，請稍後再試'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 創建自訂速率限制器
export function createRateLimiter(windowMs, max, message) {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: message || '請求過於頻繁，請稍後再試'
      }
    },
    standardHeaders: true,
    legacyHeaders: false
  });
}