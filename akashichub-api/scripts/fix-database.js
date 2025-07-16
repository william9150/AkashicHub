import mysql from 'mysql2/promise';
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function fixDatabase() {
  let connection;
  
  try {
    console.log('連接到資料庫...');
    
    // 建立資料庫連接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'akashichub'
    });

    console.log('✅ 資料庫連接成功');

    // 檢查 Resources 表是否存在
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'Resources'"
    );

    if (tables.length === 0) {
      console.log('❌ Resources 表不存在');
      return;
    }

    console.log('✅ Resources 表存在');

    // 檢查現有欄位
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM Resources"
    );

    console.log('📋 現有欄位:', columns.map(col => col.Field));

    const existingColumns = columns.map(col => col.Field);
    
    // 檢查並添加缺失的欄位
    const columnsToAdd = [];
    
    if (!existingColumns.includes('CreatedBy')) {
      columnsToAdd.push({
        name: 'CreatedBy',
        sql: 'ADD COLUMN CreatedBy INT NULL COMMENT "資料創建者ID"'
      });
    }
    
    if (!existingColumns.includes('CreatedAt')) {
      columnsToAdd.push({
        name: 'CreatedAt',
        sql: 'ADD COLUMN CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT "創建時間"'
      });
    }
    
    if (!existingColumns.includes('UpdatedAt')) {
      columnsToAdd.push({
        name: 'UpdatedAt',
        sql: 'ADD COLUMN UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT "更新時間"'
      });
    }

    // 執行 ALTER TABLE 語句
    for (const column of columnsToAdd) {
      try {
        console.log(`➕ 添加欄位: ${column.name}`);
        await connection.execute(`ALTER TABLE Resources ${column.sql}`);
        console.log(`✅ 成功添加欄位: ${column.name}`);
      } catch (error) {
        console.error(`❌ 添加欄位 ${column.name} 失敗:`, error.message);
      }
    }

    if (columnsToAdd.length === 0) {
      console.log('✅ 所有必要欄位都已存在');
    } else {
      console.log(`✅ 成功添加 ${columnsToAdd.length} 個欄位`);
    }

    // 更新現有記錄的 CreatedBy 字段為 1 (假設管理員 ID 為 1)
    if (columnsToAdd.some(c => c.name === 'CreatedBy')) {
      try {
        const [result] = await connection.execute(
          'UPDATE Resources SET CreatedBy = 1 WHERE CreatedBy IS NULL'
        );
        console.log(`✅ 更新了 ${result.affectedRows} 筆記錄的 CreatedBy 字段`);
      } catch (error) {
        console.error('❌ 更新 CreatedBy 字段失敗:', error.message);
      }
    }

    // 檢查最終結果
    const [finalColumns] = await connection.execute(
      "SHOW COLUMNS FROM Resources"
    );
    
    console.log('🎉 最終欄位列表:', finalColumns.map(col => col.Field));
    console.log('🎉 資料庫修復完成！');

  } catch (error) {
    console.error('❌ 資料庫修復失敗:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔚 資料庫連接已關閉');
    }
  }
}

// 執行修復
fixDatabase().catch(console.error);