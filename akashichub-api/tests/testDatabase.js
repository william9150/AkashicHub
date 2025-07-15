import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

// 創建測試資料庫連接
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "mysql",
  logging: false, // 禁用測試期間的SQL日誌
  define: {
    freezeTableName: true,
    timestamps: false,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// 測試資料庫連接函數
export async function connectTestDB() {
  try {
    await sequelize.authenticate();
    console.log('測試資料庫連接成功');
    return sequelize;
  } catch (error) {
    console.error('測試資料庫連接失敗:', error);
    throw error;
  }
}

// 清理測試資料庫
export async function cleanTestDB() {
  try {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.query('DROP TABLE IF EXISTS ResourceRelationships');
    await sequelize.query('DROP TABLE IF EXISTS ResourceTags');
    await sequelize.query('DROP TABLE IF EXISTS Resources');
    await sequelize.query('DROP TABLE IF EXISTS Tags');
    await sequelize.query('DROP TABLE IF EXISTS Users');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('測試資料庫清理完成');
  } catch (error) {
    console.error('測試資料庫清理失敗:', error);
    throw error;
  }
}

// 關閉測試資料庫連接
export async function closeTestDB() {
  try {
    await sequelize.close();
    console.log('測試資料庫連接已關閉');
  } catch (error) {
    console.error('關閉測試資料庫連接失敗:', error);
    throw error;
  }
}

export default sequelize;