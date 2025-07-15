import { User } from "../models/index.js";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import logger from "../utils/logger.js";

export class UserService {

  /**
   * 獲取所有用戶
   * @param {Object} options - 查詢選項
   * @returns {Object} 用戶列表
   */
  async getAllUsers(options = {}) {
    try {
      const { role, page, limit } = options;
      
      const whereClause = {};
      let queryOptions = {
        attributes: ['Id', 'LoginAccount', 'DisplayName', 'Role'],
        order: [['Id', 'DESC']]
      };

      // 按角色篩選
      if (role) {
        whereClause.Role = role;
      }

      // 分頁
      if (page && limit) {
        const offset = (page - 1) * limit;
        queryOptions.limit = parseInt(limit);
        queryOptions.offset = offset;
      }

      queryOptions.where = whereClause;

      const users = await User.findAll(queryOptions);

      logger.info("獲取用戶列表", { role, page, limit, count: users.length });

      return {
        success: true,
        data: users
      };

    } catch (error) {
      logger.error("獲取用戶列表錯誤", { error: error.message, options });
      throw error;
    }
  }

  /**
   * 根據ID獲取用戶
   * @param {number} userId - 用戶ID
   * @returns {Object} 用戶詳情
   */
  async getUserById(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: ['Id', 'LoginAccount', 'DisplayName', 'Role']
      });

      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      logger.info("獲取用戶詳情", { userId });

      return {
        success: true,
        data: user
      };

    } catch (error) {
      logger.error("獲取用戶詳情錯誤", { error: error.message, userId });
      throw error;
    }
  }

  /**
   * 創建新用戶
   * @param {Object} userData - 用戶數據
   * @returns {Object} 創建的用戶
   */
  async createUser(userData) {
    try {
      const { loginAccount, displayName, password, role = 'User' } = userData;

      // 驗證必填欄位
      if (!loginAccount || !displayName || !password) {
        throw new Error("LOGIN_ACCOUNT_DISPLAY_NAME_PASSWORD_REQUIRED");
      }

      // 驗證角色
      if (!['Admin', 'User'].includes(role)) {
        throw new Error("INVALID_ROLE");
      }

      // 檢查帳號是否已存在
      const existingUser = await User.findOne({
        where: { LoginAccount: loginAccount }
      });

      if (existingUser) {
        throw new Error("LOGIN_ACCOUNT_EXISTS");
      }

      // 密碼加密
      const passwordHash = await bcrypt.hash(password, 10);

      // 創建用戶
      const user = await User.create({
        LoginAccount: loginAccount,
        DisplayName: displayName,
        PasswordHash: passwordHash,
        Role: role
      });

      logger.info("創建用戶成功", { 
        userId: user.Id, 
        loginAccount, 
        displayName, 
        role 
      });

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
      logger.error("創建用戶錯誤", { error: error.message, userData });
      throw error;
    }
  }

  /**
   * 更新用戶
   * @param {number} userId - 用戶ID
   * @param {Object} updateData - 更新數據
   * @returns {Object} 更新後的用戶
   */
  async updateUser(userId, updateData) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      const { loginAccount, displayName, password, role } = updateData;

      // 準備更新數據
      const updateFields = {};
      
      if (loginAccount !== undefined) {
        // 檢查新帳號是否已被其他用戶使用
        const existingUser = await User.findOne({
          where: { 
            LoginAccount: loginAccount,
            Id: { [Op.ne]: userId }
          }
        });

        if (existingUser) {
          throw new Error("LOGIN_ACCOUNT_EXISTS");
        }
        updateFields.LoginAccount = loginAccount;
      }

      if (displayName !== undefined) {
        updateFields.DisplayName = displayName;
      }

      if (role !== undefined) {
        if (!['Admin', 'User'].includes(role)) {
          throw new Error("INVALID_ROLE");
        }
        updateFields.Role = role;
      }

      if (password !== undefined) {
        updateFields.PasswordHash = await bcrypt.hash(password, 10);
      }

      // 更新用戶
      await user.update(updateFields);

      logger.info("更新用戶成功", { userId, updateFields: Object.keys(updateFields) });

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
      logger.error("更新用戶錯誤", { error: error.message, userId, updateData });
      throw error;
    }
  }

  /**
   * 刪除用戶
   * @param {number} userId - 用戶ID
   * @returns {Object} 刪除結果
   */
  async deleteUser(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      // 不能刪除最後一個管理員
      if (user.Role === 'Admin') {
        const adminCount = await User.count({
          where: { Role: 'Admin' }
        });

        if (adminCount <= 1) {
          throw new Error("CANNOT_DELETE_LAST_ADMIN");
        }
      }

      // 刪除用戶
      await user.destroy();

      logger.info("刪除用戶成功", { userId, loginAccount: user.LoginAccount });

      return {
        success: true,
        data: { message: "用戶刪除成功" }
      };

    } catch (error) {
      logger.error("刪除用戶錯誤", { error: error.message, userId });
      throw error;
    }
  }

  /**
   * 更改用戶密碼
   * @param {number} userId - 用戶ID
   * @param {string} oldPassword - 舊密碼
   * @param {string} newPassword - 新密碼
   * @returns {Object} 更新結果
   */
  async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      // 驗證舊密碼
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.PasswordHash);
      if (!isOldPasswordValid) {
        throw new Error("INVALID_OLD_PASSWORD");
      }

      // 新密碼不能與舊密碼相同
      const isSamePassword = await bcrypt.compare(newPassword, user.PasswordHash);
      if (isSamePassword) {
        throw new Error("NEW_PASSWORD_SAME_AS_OLD");
      }

      // 更新密碼
      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      await user.update({ PasswordHash: newPasswordHash });

      logger.info("用戶密碼更新成功", { userId, loginAccount: user.LoginAccount });

      return {
        success: true,
        data: { message: "密碼更新成功" }
      };

    } catch (error) {
      logger.error("更改密碼錯誤", { error: error.message, userId });
      throw error;
    }
  }

  /**
   * 重置用戶密碼（管理員操作）
   * @param {number} userId - 用戶ID
   * @param {string} newPassword - 新密碼
   * @returns {Object} 重置結果
   */
  async resetPassword(userId, newPassword) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      // 更新密碼
      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      await user.update({ PasswordHash: newPasswordHash });

      logger.info("管理員重置用戶密碼", { userId, loginAccount: user.LoginAccount });

      return {
        success: true,
        data: { message: "密碼重置成功" }
      };

    } catch (error) {
      logger.error("重置密碼錯誤", { error: error.message, userId });
      throw error;
    }
  }

  /**
   * 獲取用戶統計資訊
   * @returns {Object} 統計資訊
   */
  async getUserStats() {
    try {
      const stats = await User.findAll({
        attributes: [
          'Role',
          [User.sequelize.fn('COUNT', User.sequelize.col('Id')), 'count']
        ],
        group: ['Role']
      });

      const total = await User.count();

      return {
        success: true,
        data: {
          byRole: stats,
          total
        }
      };

    } catch (error) {
      logger.error("獲取用戶統計錯誤", { error: error.message });
      throw error;
    }
  }

  /**
   * 搜尋用戶
   * @param {string} searchTerm - 搜尋關鍵字
   * @returns {Object} 搜尋結果
   */
  async searchUsers(searchTerm) {
    try {
      const users = await User.findAll({
        where: {
          [Op.or]: [
            { LoginAccount: { [Op.like]: `%${searchTerm}%` } },
            { DisplayName: { [Op.like]: `%${searchTerm}%` } }
          ]
        },
        attributes: ['Id', 'LoginAccount', 'DisplayName', 'Role'],
        order: [['DisplayName', 'ASC']],
        limit: 20
      });

      logger.info("用戶搜尋", { searchTerm, resultCount: users.length });

      return {
        success: true,
        data: users
      };

    } catch (error) {
      logger.error("用戶搜尋錯誤", { error: error.message, searchTerm });
      throw error;
    }
  }
}

// 創建單例服務實例
export const userService = new UserService();
export default userService;