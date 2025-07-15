import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

/**
 * ResourceRelationships
 * 多對多自關聯：資源 (Resource) 之間的依賴／引用關係
 *
 * - SourceResourceId: 來源資源
 * - TargetResourceId: 目標資源
 * - RelationshipType: 關係描述，預設 '使用'
 *
 * 複合主鍵：SourceResourceId + TargetResourceId
 */
const ResourceRelationship = sequelize.define(
  "ResourceRelationships",
  {
    SourceResourceId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "Resources",
        key: "Id",
      },
    },
    TargetResourceId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "Resources",
        key: "Id",
      },
    },
    RelationshipType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "使用",
    },
  },
  {
    tableName: "ResourceRelationships",
    timestamps: false,
  }
);

export default ResourceRelationship;
