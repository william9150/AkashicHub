import logger from "../utils/logger.js";

/**
 * 異步錯誤捕獲包裝器
 * 將異步函數包裝，自動捕獲錯誤並傳遞給錯誤處理中間件
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 統一錯誤處理中間件
 */
export function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  logger.error("Error caught by error handler", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id
  });

  // Sequelize 唯一約束錯誤
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    return res.status(409).json({
      success: false,
      error: {
        code: "DUPLICATE_ERROR",
        message: `${field} 已存在`
      }
    });
  }

  // Sequelize 驗證錯誤
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(e => e.message);
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: messages.join(', ')
      }
    });
  }

  // Sequelize 外鍵約束錯誤
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      error: {
        code: "FOREIGN_KEY_ERROR",
        message: "引用的資源不存在"
      }
    });
  }

  // JWT 錯誤
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "無效的授權令牌"
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: "TOKEN_EXPIRED",
        message: "授權令牌已過期"
      }
    });
  }

  // 默認錯誤
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "內部伺服器錯誤"
    }
  });
}