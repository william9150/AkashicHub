import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define(
  "Users",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    LoginAccount: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: "登入帳號"
    },
    DisplayName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "顯示名稱"
    },
    PasswordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "密碼雜湊值"
    },
    Role: {
      type: DataTypes.ENUM("SuperAdmin", "ITManager", "Viewer"),
      allowNull: false,
      defaultValue: "Viewer",
      comment: "用戶角色"
    },
    Status: {
      type: DataTypes.ENUM("Active", "Disabled", "Locked"),
      allowNull: false,
      defaultValue: "Active",
      comment: "帳號狀態：啟用/禁用/鎖定"
    },
    LastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "最後登入時間"
    },
    LoginAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "登入嘗試次數 (用於帳號鎖定)"
    },
    LockedUntil: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "帳號鎖定至何時"
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "創建時間"
    },
    CreatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'Id'
      },
      comment: "創建者ID (初始管理員可為空)"
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "更新時間"
    },
    UpdatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'Id'
      },
      comment: "更新者ID"
    },
  },
  {
    tableName: "Users",
    indexes: [
      {
        fields: ['LoginAccount']
      },
      {
        fields: ['Role']
      },
      {
        fields: ['Status']
      },
      {
        fields: ['CreatedAt']
      }
    ]
  }
);

export default User;
