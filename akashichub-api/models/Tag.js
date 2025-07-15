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
      type: DataTypes.STRING,
      allowNull: false,
    },
    Category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "Tags",
  }
);

export default Tag;
