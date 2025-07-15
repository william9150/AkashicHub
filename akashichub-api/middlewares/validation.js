/**
 * 通用輸入驗證中間件
 */

/**
 * 驗證必填欄位
 * @param {Array} requiredFields - 必填欄位名稱陣列
 */
export function validateRequired(requiredFields) {
  return (req, res, next) => {
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === "") {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: `缺少必填欄位: ${missingFields.join(", ")}`
        }
      });
    }
    
    next();
  };
}

/**
 * 驗證整數 ID 參數
 */
export function validateIdParam(req, res, next) {
  const id = parseInt(req.params.id);
  
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "無效的 ID 參數"
      }
    });
  }
  
  req.params.id = id;
  next();
}

/**
 * 驗證角色欄位
 */
export function validateRole(req, res, next) {
  const { role } = req.body;
  
  if (role && !["Admin", "User"].includes(role)) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "角色必須是 Admin 或 User"
      }
    });
  }
  
  next();
}

/**
 * 驗證資源類型
 */
export function validateResourceType(req, res, next) {
  const { resourceType } = req.body;
  const validTypes = ["Database", "Website", "Server", "Application"];
  
  if (resourceType && !validTypes.includes(resourceType)) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: `資源類型必須是以下之一: ${validTypes.join(", ")}`
      }
    });
  }
  
  next();
}

/**
 * 驗證分頁參數
 */
export function validatePagination(req, res, next) {
  const { page, limit } = req.query;
  
  if (page) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "page 必須是大於 0 的整數"
        }
      });
    }
    req.query.page = pageNum;
  }
  
  if (limit) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "limit 必須是 1-100 之間的整數"
        }
      });
    }
    req.query.limit = limitNum;
  }
  
  next();
}