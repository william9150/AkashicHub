import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "mysql",
  logging: false,
  define: {
    freezeTableName: true,
    timestamps: false,
  },
  
  // 連接池配置優化
  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 10, // 最大連接數
    min: parseInt(process.env.DB_POOL_MIN) || 0,  // 最小連接數
    acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 60000, // 獲取連接的最大等待時間（毫秒）
    idle: parseInt(process.env.DB_POOL_IDLE) || 10000,       // 連接空閒時間（毫秒）
    evict: parseInt(process.env.DB_POOL_EVICT) || 1000,     // 清理空閒連接的間隔（毫秒）
    handleDisconnects: true  // 自動處理斷線重連
  },
  
  // 查詢優化配置
  dialectOptions: {
    charset: 'utf8mb4',
    supportBigNumbers: true,
    bigNumberStrings: true,
    dateStrings: true,
    typeCast: true,
    // 連接超時設置
    connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT) || 60000,
    // SSL配置（如果需要）
    ssl: process.env.DB_SSL_ENABLED === 'true' ? {
      rejectUnauthorized: false
    } : false
  },
  
  // 重試配置
  retry: {
    max: parseInt(process.env.DB_RETRY_MAX) || 3,
    timeout: parseInt(process.env.DB_RETRY_TIMEOUT) || 5000,
    backoffBase: parseInt(process.env.DB_RETRY_BACKOFF) || 100,
    backoffExponent: 1.1
  },
  
  // 事務配置
  transactionType: 'IMMEDIATE',
  isolationLevel: 'READ_COMMITTED',
  
  // 效能監控
  benchmark: process.env.NODE_ENV === 'development',
  
  // 查詢超時
  queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT) || 30000
});

export { sequelize };
export default sequelize;
