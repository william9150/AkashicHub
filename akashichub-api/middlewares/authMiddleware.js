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
 * 僅允許 Admin 角色存取
 */
export function authorizeAdmin(req, res, next) {
  if (req.user?.role !== "Admin") {
    return res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message: "需要管理員權限" },
    });
  }
  next();
}
