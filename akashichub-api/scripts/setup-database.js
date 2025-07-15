import mysql from 'mysql2/promise';
import dotenv from "dotenv";
import path from "path";

// 載入環境變數
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function setupDatabase() {
  let connection;
  
  try {
    console.log('連接到 MySQL 伺服器...');
    
    // 連接到 MySQL（不指定資料庫）
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'admin123'
    });

    console.log('已成功連接到 MySQL');

    // 創建資料庫
    const dbName = process.env.DB_NAME || 'akashichub_db';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    console.log(`✅ 資料庫 '${dbName}' 已成功創建或已存在`);

    // 檢查資料庫是否存在
    const [rows] = await connection.execute('SHOW DATABASES LIKE ?', [dbName]);
    if (rows.length > 0) {
      console.log(`✅ 確認資料庫 '${dbName}' 存在`);
    }

    // 顯示連接資訊
    console.log('\n資料庫連接資訊:');
    console.log(`- 主機: ${process.env.DB_HOST}`);
    console.log(`- 埠號: ${process.env.DB_PORT}`);
    console.log(`- 使用者: ${process.env.DB_USER}`);
    console.log(`- 資料庫: ${dbName}`);

  } catch (error) {
    console.error('❌ 資料庫設置失敗:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('無法連接到 MySQL 伺服器。請確認:');
      console.error('1. MySQL 服務正在運行');
      console.error('2. 連接資訊正確 (主機、埠號、使用者名稱、密碼)');
      console.error('3. 防火牆設定允許連接');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('存取被拒絕。請檢查使用者名稱和密碼是否正確。');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('MySQL 連接已關閉');
    }
  }
}

// 執行資料庫設置
setupDatabase();