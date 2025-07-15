import { sequelize } from '../config/database.js';
import logger from '../utils/logger.js';
import { QueryTypes } from 'sequelize';

/**
 * 資料庫索引優化腳本
 * 為提升查詢效能添加必要的索引
 */

// 需要創建的索引定義
const indexes = [
  // Resources 表索引
  {
    table: 'Resources',
    name: 'idx_resources_name',
    columns: ['Name'],
    type: 'BTREE',
    description: '資源名稱索引，用於名稱搜尋'
  },
  {
    table: 'Resources',
    name: 'idx_resources_ip_address',
    columns: ['IpAddress'],
    type: 'BTREE',
    description: 'IP位址索引，用於IP搜尋'
  },
  {
    table: 'Resources',
    name: 'idx_resources_type',
    columns: ['ResourceType'],
    type: 'BTREE',
    description: '資源類型索引，用於類型篩選'
  },
  {
    table: 'Resources',
    name: 'idx_resources_name_ip',
    columns: ['Name', 'IpAddress'],
    type: 'BTREE',
    description: '複合索引，用於名稱和IP的聯合搜尋'
  },
  {
    table: 'Resources',
    name: 'idx_resources_type_name',
    columns: ['ResourceType', 'Name'],
    type: 'BTREE',
    description: '複合索引，用於類型和名稱的聯合查詢'
  },
  {
    table: 'Resources',
    name: 'idx_resources_created_at',
    columns: ['createdAt'],
    type: 'BTREE',
    description: '創建時間索引，用於排序'
  },
  {
    table: 'Resources',
    name: 'idx_resources_updated_at',
    columns: ['updatedAt'],
    type: 'BTREE',
    description: '更新時間索引，用於排序'
  },

  // Tags 表索引
  {
    table: 'Tags',
    name: 'idx_tags_name',
    columns: ['Name'],
    type: 'BTREE',
    description: '標籤名稱索引，用於名稱搜尋'
  },
  {
    table: 'Tags',
    name: 'idx_tags_category',
    columns: ['Category'],
    type: 'BTREE',
    description: '標籤分類索引，用於分類篩選'
  },
  {
    table: 'Tags',
    name: 'idx_tags_category_name',
    columns: ['Category', 'Name'],
    type: 'BTREE',
    description: '複合索引，用於分類和名稱的聯合查詢'
  },

  // ResourceTags 表索引
  {
    table: 'ResourceTags',
    name: 'idx_resource_tags_resource_id',
    columns: ['ResourceId'],
    type: 'BTREE',
    description: '資源ID索引，用於查詢資源的標籤'
  },
  {
    table: 'ResourceTags',
    name: 'idx_resource_tags_tag_id',
    columns: ['TagId'],
    type: 'BTREE',
    description: '標籤ID索引，用於查詢標籤的資源'
  },

  // ResourceRelationships 表索引
  {
    table: 'ResourceRelationships',
    name: 'idx_resource_relationships_source',
    columns: ['SourceResourceId'],
    type: 'BTREE',
    description: '來源資源ID索引，用於查詢資源關係'
  },
  {
    table: 'ResourceRelationships',
    name: 'idx_resource_relationships_target',
    columns: ['TargetResourceId'],
    type: 'BTREE',
    description: '目標資源ID索引，用於查詢資源關係'
  },
  {
    table: 'ResourceRelationships',
    name: 'idx_resource_relationships_type',
    columns: ['RelationshipType'],
    type: 'BTREE',
    description: '關係類型索引，用於關係類型篩選'
  },

  // Users 表索引
  {
    table: 'Users',
    name: 'idx_users_login_account',
    columns: ['LoginAccount'],
    type: 'BTREE',
    description: '登入帳號索引，用於登入驗證'
  },
  {
    table: 'Users',
    name: 'idx_users_display_name',
    columns: ['DisplayName'],
    type: 'BTREE',
    description: '顯示名稱索引，用於名稱搜尋'
  },
  {
    table: 'Users',
    name: 'idx_users_role',
    columns: ['Role'],
    type: 'BTREE',
    description: '角色索引，用於角色篩選'
  }
];

/**
 * 檢查索引是否存在
 */
async function checkIndexExists(tableName, indexName) {
  try {
    const query = `
      SELECT COUNT(*) as count 
      FROM information_schema.statistics 
      WHERE table_schema = DATABASE() 
      AND table_name = :tableName 
      AND index_name = :indexName
    `;
    
    const result = await sequelize.query(query, {
      replacements: { tableName, indexName },
      type: QueryTypes.SELECT
    });
    
    return result[0].count > 0;
  } catch (error) {
    logger.error('檢查索引失敗', { error: error.message, tableName, indexName });
    return false;
  }
}

/**
 * 創建索引
 */
async function createIndex(indexDef) {
  try {
    const { table, name, columns, type, description } = indexDef;
    
    // 檢查索引是否已存在
    const exists = await checkIndexExists(table, name);
    if (exists) {
      logger.info('索引已存在，跳過創建', { table, name });
      return { success: true, skipped: true };
    }
    
    // 創建索引SQL
    const columnList = columns.join(', ');
    const createIndexSQL = `
      CREATE INDEX ${name} 
      ON ${table} (${columnList}) 
      USING ${type}
    `;
    
    await sequelize.query(createIndexSQL);
    
    logger.info('索引創建成功', { table, name, columns, description });
    return { success: true, created: true };
    
  } catch (error) {
    logger.error('索引創建失敗', { 
      error: error.message, 
      table: indexDef.table, 
      name: indexDef.name 
    });
    return { success: false, error: error.message };
  }
}

/**
 * 分析表格統計資訊
 */
async function analyzeTable(tableName) {
  try {
    await sequelize.query(`ANALYZE TABLE ${tableName}`);
    logger.info('表格統計分析完成', { table: tableName });
    return true;
  } catch (error) {
    logger.error('表格統計分析失敗', { error: error.message, table: tableName });
    return false;
  }
}

/**
 * 獲取索引使用統計
 */
async function getIndexStats() {
  try {
    const query = `
      SELECT 
        table_name,
        index_name,
        cardinality,
        sub_part,
        packed,
        nullable,
        index_type,
        comment
      FROM information_schema.statistics 
      WHERE table_schema = DATABASE()
      AND table_name IN ('Resources', 'Tags', 'ResourceTags', 'ResourceRelationships', 'Users')
      ORDER BY table_name, index_name
    `;
    
    const stats = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });
    
    return stats;
  } catch (error) {
    logger.error('獲取索引統計失敗', { error: error.message });
    return [];
  }
}

/**
 * 主要執行函數
 */
async function addIndexes() {
  try {
    logger.info('開始添加資料庫索引');
    
    const results = {
      created: 0,
      skipped: 0,
      failed: 0,
      details: []
    };
    
    // 創建所有索引
    for (const indexDef of indexes) {
      const result = await createIndex(indexDef);
      results.details.push({
        ...indexDef,
        result
      });
      
      if (result.success) {
        if (result.created) {
          results.created++;
        } else if (result.skipped) {
          results.skipped++;
        }
      } else {
        results.failed++;
      }
      
      // 稍微延遲以避免資料庫負載過高
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // 分析表格統計資訊
    const tables = ['Resources', 'Tags', 'ResourceTags', 'ResourceRelationships', 'Users'];
    for (const table of tables) {
      await analyzeTable(table);
    }
    
    // 獲取索引統計
    const indexStats = await getIndexStats();
    
    logger.info('索引添加完成', {
      ...results,
      totalIndexes: indexStats.length
    });
    
    console.log('\\n索引添加結果:');
    console.log(`創建: ${results.created}`);
    console.log(`跳過: ${results.skipped}`);
    console.log(`失敗: ${results.failed}`);
    console.log(`總索引數: ${indexStats.length}`);
    
    return results;
    
  } catch (error) {
    logger.error('索引添加過程失敗', { error: error.message });
    throw error;
  }
}

/**
 * 移除索引（僅用於測試或回滾）
 */
async function removeIndexes() {
  try {
    logger.info('開始移除自定義索引');
    
    const results = {
      removed: 0,
      failed: 0,
      details: []
    };
    
    for (const indexDef of indexes) {
      try {
        const { table, name } = indexDef;
        
        // 檢查索引是否存在
        const exists = await checkIndexExists(table, name);
        if (!exists) {
          logger.info('索引不存在，跳過移除', { table, name });
          continue;
        }
        
        // 移除索引
        const dropIndexSQL = `DROP INDEX ${name} ON ${table}`;
        await sequelize.query(dropIndexSQL);
        
        logger.info('索引移除成功', { table, name });
        results.removed++;
        
      } catch (error) {
        logger.error('索引移除失敗', { 
          error: error.message, 
          table: indexDef.table, 
          name: indexDef.name 
        });
        results.failed++;
      }
    }
    
    logger.info('索引移除完成', results);
    return results;
    
  } catch (error) {
    logger.error('索引移除過程失敗', { error: error.message });
    throw error;
  }
}

// 如果直接執行此腳本
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  if (command === 'remove') {
    removeIndexes()
      .then(() => {
        console.log('索引移除完成');
        process.exit(0);
      })
      .catch(error => {
        console.error('索引移除失敗:', error);
        process.exit(1);
      });
  } else {
    addIndexes()
      .then(() => {
        console.log('索引添加完成');
        process.exit(0);
      })
      .catch(error => {
        console.error('索引添加失敗:', error);
        process.exit(1);
      });
  }
}

export { addIndexes, removeIndexes, getIndexStats };
export default addIndexes;