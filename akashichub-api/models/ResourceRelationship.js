import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ResourceRelationship = sequelize.define(
  "ResourceRelationships",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    SourceResourceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Resources",
        key: "Id",
      },
      comment: "來源資源ID"
    },
    TargetResourceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Resources",
        key: "Id",
      },
      comment: "目標資源ID"
    },
    RelationshipType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "depends_on",
      comment: "關係類型 (depends_on, connects_to, deployed_on, etc.)"
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "關係描述"
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: "關係是否啟用"
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
    tableName: "ResourceRelationships",
    indexes: [
      {
        fields: ['SourceResourceId']
      },
      {
        fields: ['TargetResourceId']
      },
      {
        fields: ['RelationshipType']
      },
      {
        fields: ['CreatedAt']
      }
    ]
  }
);

export default ResourceRelationship;
