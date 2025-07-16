import { Op } from 'sequelize';
import logger from './logger.js';

/**
 * 查詢優化工具
 * 提供資料庫查詢效能優化功能
 */

/**
 * 建立分頁查詢配置
 */
export function buildPaginationConfig(page = 1, limit = 10, maxLimit = 100) {
  // 確保參數為正整數
  const normalizedPage = Math.max(1, parseInt(page) || 1);
  const normalizedLimit = Math.min(maxLimit, Math.max(1, parseInt(limit) || 10));
  
  const offset = (normalizedPage - 1) * normalizedLimit;
  
  return {
    limit: normalizedLimit,
    offset,
    page: normalizedPage
  };
}

/**
 * 建立搜尋條件
 */
export function buildSearchConditions(keyword, searchFields = []) {
  if (!keyword || !searchFields.length) {
    return {};
  }

  const conditions = searchFields.map(field => ({
    [field]: {
      [Op.like]: `%${keyword}%`
    }
  }));

  return {
    [Op.or]: conditions
  };
}

/**
 * 建立標籤篩選條件
 */
export function buildTagFilterConditions(tags) {
  if (!tags || !tags.length) {
    return {};
  }

  const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
  
  return {
    '$Tags.id$': {
      [Op.in]: tagArray
    }
  };
}

/**
 * 建立日期範圍篩選條件
 */
export function buildDateRangeConditions(startDate, endDate, dateField = 'Id') {
  const conditions = {};
  
  if (startDate) {
    conditions[dateField] = {
      ...conditions[dateField],
      [Op.gte]: new Date(startDate)
    };
  }
  
  if (endDate) {
    conditions[dateField] = {
      ...conditions[dateField],
      [Op.lte]: new Date(endDate)
    };
  }
  
  return conditions;
}

/**
 * 建立排序配置
 */
export function buildOrderConfig(sortBy = 'Id', sortOrder = 'DESC') {
  const validSortOrders = ['ASC', 'DESC'];
  const normalizedSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) 
    ? sortOrder.toUpperCase() 
    : 'DESC';
  
  return [[sortBy, normalizedSortOrder]];
}

/**
 * 建立包含關聯的查詢配置
 */
export function buildIncludeConfig(associations = []) {
  return associations.map(association => {
    if (typeof association === 'string') {
      return { association };
    }
    
    return {
      association: association.name,
      attributes: association.attributes || undefined,
      where: association.where || undefined,
      required: association.required || false
    };
  });
}

/**
 * 資源查詢優化配置
 */
export function buildResourceQuery(options = {}) {
  const {
    page = 1,
    limit = 10,
    keyword,
    tags,
    resourceType,
    sortBy = 'Id',
    sortOrder = 'DESC',
    includeTags = true,
    includeRelationships = false
  } = options;

  // 分頁配置
  const paginationConfig = buildPaginationConfig(page, limit);
  
  // 搜尋條件
  const searchConditions = buildSearchConditions(keyword, [
    'name', 'ipAddress', 'description', 'loginUser'
  ]);
  
  // 標籤篩選條件
  const tagFilterConditions = buildTagFilterConditions(tags);
  
  // 資源類型篩選
  const resourceTypeCondition = resourceType ? { resourceType } : {};
  
  // 合併所有條件
  const where = {
    ...searchConditions,
    ...tagFilterConditions,
    ...resourceTypeCondition
  };
  
  // 排序配置
  const order = buildOrderConfig(sortBy, sortOrder);
  
  // 關聯配置
  const include = [];
  if (includeTags) {
    include.push({
      association: 'Tags',
      attributes: ['id', 'name', 'category'],
      through: { attributes: [] }
    });
  }
  
  if (includeRelationships) {
    include.push({
      association: 'RelatedResources',
      attributes: ['id', 'name', 'resourceType'],
      through: { attributes: ['relationshipType'] }
    });
  }
  
  return {
    where,
    include,
    order,
    ...paginationConfig,
    distinct: true // 避免JOIN造成的重複記錄
  };
}

/**
 * 標籤查詢優化配置
 */
export function buildTagQuery(options = {}) {
  const {
    category,
    keyword,
    includeResourceCount = false,
    sortBy = 'category',
    sortOrder = 'ASC'
  } = options;

  // 搜尋條件
  const searchConditions = buildSearchConditions(keyword, ['name', 'category']);
  
  // 分類篩選
  const categoryCondition = category ? { category } : {};
  
  // 合併條件
  const where = {
    ...searchConditions,
    ...categoryCondition
  };
  
  // 排序配置
  const order = buildOrderConfig(sortBy, sortOrder);
  
  // 關聯配置
  const include = [];
  if (includeResourceCount) {
    include.push({
      association: 'Resources',
      attributes: [],
      through: { attributes: [] }
    });
  }
  
  const attributes = includeResourceCount 
    ? ['id', 'name', 'category']
    : undefined;
  
  return {
    where,
    include,
    order,
    attributes,
    group: includeResourceCount ? ['Tag.id'] : undefined
  };
}

/**
 * 用戶查詢優化配置
 */
export function buildUserQuery(options = {}) {
  const {
    page = 1,
    limit = 10,
    keyword,
    role,
    sortBy = 'Id',
    sortOrder = 'DESC'
  } = options;

  // 分頁配置
  const paginationConfig = buildPaginationConfig(page, limit);
  
  // 搜尋條件
  const searchConditions = buildSearchConditions(keyword, [
    'loginAccount', 'displayName'
  ]);
  
  // 角色篩選
  const roleCondition = role ? { role } : {};
  
  // 合併條件
  const where = {
    ...searchConditions,
    ...roleCondition
  };
  
  // 排序配置
  const order = buildOrderConfig(sortBy, sortOrder);
  
  // 排除敏感欄位
  const attributes = {
    exclude: ['passwordHash']
  };
  
  return {
    where,
    order,
    attributes,
    ...paginationConfig
  };
}

/**
 * 計算查詢效能統計
 */
export function calculateQueryStats(startTime, recordCount, queryType = 'unknown') {
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  const stats = {
    queryType,
    duration,
    recordCount,
    averageTimePerRecord: recordCount > 0 ? duration / recordCount : 0,
    timestamp: new Date().toISOString()
  };
  
  // 記錄效能統計
  logger.info('查詢效能統計', stats);
  
  return stats;
}

/**
 * 查詢效能監控中間件
 */
export function queryPerformanceMiddleware() {
  return (req, res, next) => {
    const startTime = Date.now();
    
    // 包裝原始的json方法
    const originalJson = res.json;
    res.json = function(data) {
      // 計算查詢統計
      const recordCount = data?.data?.resources?.length || 
                         data?.data?.length || 
                         (data?.data ? 1 : 0);
      
      const stats = calculateQueryStats(startTime, recordCount, req.route?.path);
      
      // 在開發環境中添加效能資訊到回應頭
      if (process.env.NODE_ENV === 'development') {
        res.set({
          'X-Query-Time': stats.duration,
          'X-Record-Count': stats.recordCount,
          'X-Avg-Time-Per-Record': stats.averageTimePerRecord.toFixed(2)
        });
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * 查詢快取鍵生成器
 */
export function generateCacheKey(queryConfig, prefix = 'query') {
  const keyParts = [
    prefix,
    queryConfig.where ? JSON.stringify(queryConfig.where) : 'no-where',
    queryConfig.order ? JSON.stringify(queryConfig.order) : 'no-order',
    queryConfig.limit || 'no-limit',
    queryConfig.offset || 'no-offset'
  ];
  
  return keyParts.join(':');
}

export default {
  buildPaginationConfig,
  buildSearchConditions,
  buildTagFilterConditions,
  buildDateRangeConditions,
  buildOrderConfig,
  buildIncludeConfig,
  buildResourceQuery,
  buildTagQuery,
  buildUserQuery,
  calculateQueryStats,
  queryPerformanceMiddleware,
  generateCacheKey
};