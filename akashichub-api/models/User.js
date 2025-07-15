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
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      comment: "唯一登入帳號",
    },
    DisplayName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "顯示名稱",
    },
    PasswordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Role: {
      type: DataTypes.ENUM("Admin", "User"),
      allowNull: false,
      defaultValue: "User",
    },
  },
  {
    tableName: "Users",
  }
);

export default User;
