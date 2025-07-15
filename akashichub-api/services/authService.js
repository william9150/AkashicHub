import { User } from "../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

export class AuthService {
  
  /**
   * 用戶登入驗證
   * @param {string} loginAccount - 登入帳號
   * @param {string} password - 密碼
   * @returns {Object} 登入結果
   */
  async login(loginAccount, password) {
    try {
      // 驗證必填欄位
      if (!loginAccount || !password) {
        throw new Error("LOGIN_ACCOUNT_PASSWORD_REQUIRED");
      }

      // 查找用戶
      const user = await User.findOne({ 
        where: { LoginAccount: loginAccount } 
      });

      if (!user) {
        logger.warn("登入失敗：用戶不存在", { loginAccount });
        throw new Error("INVALID_CREDENTIALS");
      }

      // 驗證密碼
      const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);
      if (!isPasswordValid) {
        logger.warn("登入失敗：密碼錯誤", { loginAccount });
        throw new Error("INVALID_CREDENTIALS");
      }

      // 生成JWT Token
      const token = this.generateToken({
        id: user.Id,
        loginAccount: user.LoginAccount,
        role: user.Role
      });

      logger.info("用戶登入成功", { 
        userId: user.Id, 
        loginAccount: user.LoginAccount,
        role: user.Role 
      });

      return {
        success: true,
        data: {
          token,
          user: {
            id: user.Id,
            loginAccount: user.LoginAccount,
            displayName: user.DisplayName,
            role: user.Role
          }
        }
      };

    } catch (error) {
      logger.error("登入服務錯誤", { error: error.message, loginAccount });
      throw error;
    }
  }

  /**
   * 根據用戶ID獲取用戶資訊
   * @param {number} userId - 用戶ID
   * @returns {Object} 用戶資訊
   */
  async getUserById(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: ['Id', 'LoginAccount', 'DisplayName', 'Role']
      });

      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      return {
        success: true,
        data: {
          id: user.Id,
          loginAccount: user.LoginAccount,
          displayName: user.DisplayName,
          role: user.Role
        }
      };

    } catch (error) {
      logger.error("獲取用戶資訊錯誤", { error: error.message, userId });
      throw error;
    }
  }

  /**
   * 生成JWT Token
   * @param {Object} payload - Token載荷
   * @returns {string} JWT Token
   */
  generateToken(payload) {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

    if (!secret) {
      throw new Error("JWT_SECRET_NOT_CONFIGURED");
    }

    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * 驗證JWT Token
   * @param {string} token - JWT Token
   * @returns {Object} 解碼後的載荷
   */
  verifyToken(token) {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error("JWT_SECRET_NOT_CONFIGURED");
      }

      return jwt.verify(token, secret);
    } catch (error) {
      logger.warn("Token驗證失敗", { error: error.message });
      throw new Error("INVALID_TOKEN");
    }
  }

  /**
   * 刷新Token
   * @param {string} token - 現有Token
   * @returns {string} 新Token
   */
  refreshToken(token) {
    try {
      const decoded = this.verifyToken(token);
      
      // 移除過期時間欄位
      delete decoded.iat;
      delete decoded.exp;

      return this.generateToken(decoded);
    } catch (error) {
      logger.error("Token刷新失敗", { error: error.message });
      throw error;
    }
  }

  /**
   * 檢查用戶權限
   * @param {Object} user - 用戶資訊
   * @param {string} requiredRole - 需要的角色
   * @returns {boolean} 是否有權限
   */
  checkPermission(user, requiredRole) {
    if (!user || !user.role) {
      return false;
    }

    // Admin有所有權限
    if (user.role === 'Admin') {
      return true;
    }

    // 檢查特定角色
    return user.role === requiredRole;
  }
}

// 創建單例服務實例
export const authService = new AuthService();
export default authService;