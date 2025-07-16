import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ResourceTag = sequelize.define(
  "ResourceTags",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ResourceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Resources",
        key: "Id",
      },
      comment: "資源ID"
    },
    TagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Tags",
        key: "Id",
      },
      comment: "標籤ID"
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "關聯創建時間"
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
  },
  {
    tableName: "ResourceTags",
    indexes: [
      {
        unique: true,
        fields: ['ResourceId', 'TagId']
      },
      {
        fields: ['ResourceId']
      },
      {
        fields: ['TagId']
      },
      {
        fields: ['CreatedAt']
      }
    ]
  }
);

export default ResourceTag;
