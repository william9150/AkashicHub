import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Tag = sequelize.define(
  "Tags",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "標籤名稱"
    },
    Category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "標籤分類"
    },
    Color: {
      type: DataTypes.STRING(7),
      allowNull: false,
      defaultValue: "#409EFF",
      comment: "標籤顏色 (HEX格式)"
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "標籤描述"
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: "標籤是否啟用"
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
    tableName: "Tags",
    indexes: [
      {
        unique: true,
        fields: ['Name', 'Category']
      },
      {
        fields: ['Category']
      },
      {
        fields: ['Name']
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

export default Tag;
