import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ResourceTag = sequelize.define(
  "ResourceTags",
  {
    ResourceId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "Resources",
        key: "Id",
      },
    },
    TagId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "Tags",
        key: "Id",
      },
    },
  },
  {
    tableName: "ResourceTags",
    timestamps: false,
  }
);

export default ResourceTag;
