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
      type: DataTypes.ENUM("SuperAdmin", "ITManager", "Viewer"),
      allowNull: false,
      defaultValue: "Viewer",
      comment: "SuperAdmin: 可編輯人員和IT資料, ITManager: 可新增修改IT資料並刪除自己創建的, Viewer: 只能瀏覽資料",
    },
  },
  {
    tableName: "Users",
  }
);

export default User;
