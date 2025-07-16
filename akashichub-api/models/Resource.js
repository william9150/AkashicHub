import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Resource = sequelize.define(
  "Resources",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ResourceType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "資源類型 (Server, Database, Website, API, etc.)"
    },
    Name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "資源名稱"
    },
    IpAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "IP地址 (支援IPv4和IPv6)"
    },
    Port: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "端口號"
    },
    LoginUser: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "登入用戶名"
    },
    LoginPasswordEncrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "登入密碼 (加密)"
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "資源描述"
    },
    DbName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "資料庫名稱 (適用於資料庫類型)"
    },
    DbVersion: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "資料庫版本"
    },
    Status: {
      type: DataTypes.ENUM("Active", "Inactive", "Maintenance"),
      allowNull: false,
      defaultValue: "Active",
      comment: "資源狀態"
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "創建時間"
    },
    CreatedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'Id'
      },
      comment: "創建者ID"
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "更新時間"
    },
    UpdatedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'Id'
      },
      comment: "更新者ID"
    },
  },
  {
    tableName: "Resources",
    indexes: [
      {
        fields: ['ResourceType']
      },
      {
        fields: ['Name']
      },
      {
        fields: ['IpAddress']
      },
      {
        fields: ['Status']
      },
      {
        fields: ['CreatedAt']
      },
      {
        fields: ['CreatedBy']
      }
    ]
  }
);

export default Resource;
