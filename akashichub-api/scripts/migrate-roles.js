import sequelize from "../config/database.js";
import bcrypt from "bcrypt";

/**
 * 遷移用戶角色到新的三層權限系統
 */
async function migrateRoles() {
  try {
    console.log("開始遷移用戶角色...");
    
    // 檢查資料庫連線
    await sequelize.authenticate();
    console.log("資料庫連線成功");

    // 1. 首先清空 Users 表，避免 ENUM 衝突
    await sequelize.query("DELETE FROM Users");
    console.log("清空現有用戶資料");

    // 2. 修改 Role 欄位為新的 ENUM 類型
    await sequelize.query(`
      ALTER TABLE Users 
      MODIFY COLUMN Role ENUM('SuperAdmin', 'ITManager', 'Viewer') 
      NOT NULL DEFAULT 'Viewer' 
      COMMENT 'SuperAdmin: 可編輯人員和IT資料, ITManager: 可新增修改IT資料並刪除自己創建的, Viewer: 只能瀏覽資料'
    `);
    console.log("更新 Role 欄位類型");

    // 3. 添加 CreatedBy 欄位到 Resources 表（如果不存在）
    try {
      await sequelize.query(`
        ALTER TABLE Resources 
        ADD COLUMN CreatedBy INT NOT NULL DEFAULT 1
        COMMENT '資料創建者ID，用於權限控制'
      `);
      console.log("為 Resources 表添加 CreatedBy 欄位");
    } catch (error) {
      if (error.original?.code !== 'ER_DUP_FIELDNAME') {
        throw error;
      }
      console.log("Resources.CreatedBy 欄位已存在");
    }

    // 4. 添加 CreatedBy 欄位到 Tags 表（如果不存在）
    try {
      await sequelize.query(`
        ALTER TABLE Tags 
        ADD COLUMN CreatedBy INT NOT NULL DEFAULT 1
        COMMENT '標籤創建者ID，用於權限控制'
      `);
      console.log("為 Tags 表添加 CreatedBy 欄位");
    } catch (error) {
      if (error.original?.code !== 'ER_DUP_FIELDNAME') {
        throw error;
      }
      console.log("Tags.CreatedBy 欄位已存在");
    }

    // 5. 創建預設管理員帳號
    const adminAccount = process.env.DEFAULT_ADMIN_ACCOUNT || "admin";
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin";
    const adminHash = await bcrypt.hash(adminPassword, 10);
    
    await sequelize.query(`
      INSERT INTO Users (LoginAccount, DisplayName, PasswordHash, Role) 
      VALUES (?, ?, ?, ?)
    `, {
      replacements: [adminAccount, "系統管理員", adminHash, "SuperAdmin"]
    });
    console.log(`創建 SuperAdmin 用戶: ${adminAccount}`);

    // 6. 創建測試用戶
    const willyHash = await bcrypt.hash("55665566", 10);
    await sequelize.query(`
      INSERT INTO Users (LoginAccount, DisplayName, PasswordHash, Role) 
      VALUES (?, ?, ?, ?)
    `, {
      replacements: ["willy", "Willy", willyHash, "ITManager"]
    });
    console.log("創建 ITManager 用戶: willy");

    // 7. 創建一個 Viewer 用戶用於測試
    const viewerHash = await bcrypt.hash("viewer123", 10);
    await sequelize.query(`
      INSERT INTO Users (LoginAccount, DisplayName, PasswordHash, Role) 
      VALUES (?, ?, ?, ?)
    `, {
      replacements: ["viewer", "觀察者", viewerHash, "Viewer"]
    });
    console.log("創建 Viewer 用戶: viewer");

    console.log("✅ 角色遷移完成！");
    console.log("測試帳號：");
    console.log("- SuperAdmin: admin / admin");
    console.log("- ITManager: willy / 55665566");
    console.log("- Viewer: viewer / viewer123");
    
  } catch (error) {
    console.error("❌ 遷移失敗:", error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 執行遷移
migrateRoles().catch(error => {
  console.error("遷移過程中發生錯誤:", error);
  process.exit(1);
});