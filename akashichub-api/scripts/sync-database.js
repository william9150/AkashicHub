import sequelize from "../config/database.js";
import { User, Resource, Tag, ResourceTag, ResourceRelationship } from "../models/index.js";

async function syncDatabase() {
  try {
    console.log('開始同步資料庫結構...');
    
    // 檢查連接
    await sequelize.authenticate();
    console.log('✅ 資料庫連接成功');
    
    // 同步所有模型，alter: true 會修改現有表結構
    await sequelize.sync({ alter: true });
    console.log('✅ 資料庫結構同步完成');
    
    // 檢查是否有 Resources 表的記錄
    const resourceCount = await Resource.count();
    console.log(`📊 目前資源數量: ${resourceCount}`);
    
    // 如果沒有資源，創建一些測試資料
    if (resourceCount === 0) {
      console.log('創建測試資源...');
      
      // 先確保有用戶存在
      const [user] = await User.findOrCreate({
        where: { LoginAccount: 'admin' },
        defaults: {
          LoginAccount: 'admin',
          DisplayName: 'Administrator',
          PasswordHash: '$2b$10$example.hash',
          Role: 'Admin'
        }
      });
      
      // 創建測試資源
      await Resource.bulkCreate([
        {
          Name: '主要Web伺服器',
          ResourceType: 'Server',
          IpAddress: '192.168.1.100',
          Port: 80,
          Description: '主要的Web應用伺服器',
          CreatedBy: user.Id
        },
        {
          Name: '資料庫伺服器',
          ResourceType: 'Database',
          IpAddress: '192.168.1.101',
          Port: 3306,
          Description: 'MySQL資料庫伺服器',
          CreatedBy: user.Id
        },
        {
          Name: '備份伺服器',
          ResourceType: 'Server',
          IpAddress: '192.168.1.102',
          Port: 22,
          Description: '系統備份伺服器',
          CreatedBy: user.Id
        }
      ]);
      
      console.log('✅ 測試資源創建完成');
    }
    
    console.log('🎉 資料庫同步完成！');
    
  } catch (error) {
    console.error('❌ 資料庫同步失敗:', error);
    console.error('錯誤詳情:', error.message);
  } finally {
    await sequelize.close();
  }
}

// 執行同步
syncDatabase();