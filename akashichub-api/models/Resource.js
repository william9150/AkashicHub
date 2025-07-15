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
      type: DataTypes.STRING,
      allowNull: false,
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    IpAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    LoginUser: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    LoginPasswordEncrypted: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Port: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    DbName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    DbVersion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Resources",
  }
);

export default Resource;
