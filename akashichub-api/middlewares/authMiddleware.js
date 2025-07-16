import jwt from "jsonwebtoken";

/**
 * 驗證 JWT Token，將解碼後的 user 資訊掛載至 req.user
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "缺少授權標頭" },
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Token 不存在" },
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        success: false,
        error: { code: "INVALID_TOKEN", message: "無效或過期的 Token" },
      });
    }
    req.user = user;
    next();
  });
}

/**
 * 僅允許 SuperAdmin 角色存取
 */
export function authorizeSuperAdmin(req, res, next) {
  if (req.user?.role !== "SuperAdmin") {
    return res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message: "需要超級管理員權限" },
    });
  }
  next();
}

/**
 * 允許可以編輯IT資料的角色存取 (SuperAdmin, ITManager)
 */
export function authorizeITEdit(req, res, next) {
  const allowedRoles = ["SuperAdmin", "ITManager"];
  if (!allowedRoles.includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message: "需要IT編輯權限" },
    });
  }
  next();
}

/**
 * 檢查資源擁有者權限或超級管理員權限
 */
export function authorizeResourceOwner(req, res, next) {
  // SuperAdmin 可以存取所有資源
  if (req.user?.role === "SuperAdmin") {
    return next();
  }
  
  // ITManager 只能存取自己創建的資源
  // 這個檢查需要在 controller 中實現，因為需要查詢資料庫
  req.checkOwnership = true;
  next();
}

/**
 * 向下兼容的 Admin 授權 (映射到 SuperAdmin)
 */
export function authorizeAdmin(req, res, next) {
  return authorizeSuperAdmin(req, res, next);
}
