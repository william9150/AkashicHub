import { Resource, Tag, ResourceTag } from "../models/index.js";
import { Op } from "sequelize";
import { encrypt, decrypt } from "../utils/crypto.js";
import logger from "../utils/logger.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

/**
 * 取得資源列表（簡化版本）
 */
export const getResources = asyncHandler(async (req, res) => {
  const { keyword, page = 1, limit = 20 } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  // 建立基本查詢條件
  const whereConditions = {};
  
  if (keyword) {
    whereConditions[Op.or] = [
      { Name: { [Op.like]: `%${keyword}%` } },
      { IpAddress: { [Op.like]: `%${keyword}%` } },
      { Description: { [Op.like]: `%${keyword}%` } },
      { ResourceType: { [Op.like]: `%${keyword}%` } }
    ];
  }

  try {
    // 檢查資料庫連接
    await Resource.sequelize.authenticate();
    
    // 執行查詢
    const { count, rows } = await Resource.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: offset,
      order: [['Id', 'DESC']], // 使用 Id 排序而不是 CreatedAt
      include: [
        {
          model: Tag,
          as: 'Tags',
          attributes: ['Id', 'Name', 'Category'],
          through: { attributes: [] }
        }
      ],
      distinct: true
    });

    // 解密敏感資料（如果需要）
    const resources = rows.map(resource => {
      const resourceData = resource.toJSON();
      
      // 如果用戶有權限，解密登入密碼
      if (resourceData.LoginPasswordEncrypted && req.user) {
        try {
          resourceData.LoginPassword = decrypt(resourceData.LoginPasswordEncrypted);
        } catch (error) {
          logger.warn('密碼解密失敗', { resourceId: resourceData.Id });
          resourceData.LoginPassword = '[解密失敗]';
        }
      }
      
      // 移除加密字段
      delete resourceData.LoginPasswordEncrypted;
      
      return resourceData;
    });

    // 計算分頁資訊
    const totalPages = Math.ceil(count / parseInt(limit));
    
    logger.info('資源列表查詢成功', {
      count,
      page: parseInt(page),
      limit: parseInt(limit),
      keyword: keyword || 'none'
    });

    res.json({
      success: true,
      data: {
        resources,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    logger.error('資源列表查詢失敗', { error: error.message });
    throw error;
  }
});

/**
 * 取得單一資源
 */
export const getResource = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const resource = await Resource.findByPk(id, {
    include: [
      {
        model: Tag,
        as: 'Tags',
        attributes: ['Id', 'Name', 'Category'],
        through: { attributes: [] }
      }
    ]
  });

  if (!resource) {
    return res.status(404).json({
      success: false,
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "資源不存在"
      }
    });
  }

  const resourceData = resource.toJSON();
  
  // 解密登入密碼
  if (resourceData.LoginPasswordEncrypted) {
    try {
      resourceData.LoginPassword = decrypt(resourceData.LoginPasswordEncrypted);
    } catch (error) {
      logger.warn('密碼解密失敗', { resourceId: id });
      resourceData.LoginPassword = '[解密失敗]';
    }
  }
  
  delete resourceData.LoginPasswordEncrypted;

  res.json({
    success: true,
    data: resourceData
  });
});

/**
 * 創建資源
 */
export const createResource = asyncHandler(async (req, res) => {
  const { Name, ResourceType, IpAddress, LoginUser, LoginPassword, Description, Port, DbName, DbVersion, tags } = req.body;

  // 加密登入密碼
  let LoginPasswordEncrypted = null;
  if (LoginPassword) {
    LoginPasswordEncrypted = encrypt(LoginPassword);
  }

  // 創建資源
  const resource = await Resource.create({
    Name,
    ResourceType,
    IpAddress,
    LoginUser,
    LoginPasswordEncrypted,
    Description,
    Port,
    DbName,
    DbVersion,
    CreatedBy: req.user?.Id || 1 // 使用當前用戶 ID 或默認為 1
  });

  // 處理標籤關聯
  if (tags && Array.isArray(tags)) {
    const tagInstances = await Tag.findAll({
      where: { Id: { [Op.in]: tags } }
    });
    await resource.setTags(tagInstances);
  }

  logger.info('資源創建成功', { resourceId: resource.Id, name: Name });

  res.status(201).json({
    success: true,
    data: {
      id: resource.Id,
      message: "資源創建成功"
    }
  });
});

/**
 * 更新資源
 */
export const updateResource = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { Name, ResourceType, IpAddress, LoginUser, LoginPassword, Description, Port, DbName, DbVersion, tags } = req.body;

  const resource = await Resource.findByPk(id);
  
  if (!resource) {
    return res.status(404).json({
      success: false,
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "資源不存在"
      }
    });
  }

  // 準備更新資料
  const updateData = {
    Name,
    ResourceType,
    IpAddress,
    LoginUser,
    Description,
    Port,
    DbName,
    DbVersion
  };

  // 如果提供了新密碼，加密它
  if (LoginPassword) {
    updateData.LoginPasswordEncrypted = encrypt(LoginPassword);
  }

  // 更新資源
  await resource.update(updateData);

  // 處理標籤關聯
  if (tags && Array.isArray(tags)) {
    const tagInstances = await Tag.findAll({
      where: { Id: { [Op.in]: tags } }
    });
    await resource.setTags(tagInstances);
  }

  logger.info('資源更新成功', { resourceId: id });

  res.json({
    success: true,
    data: {
      message: "資源更新成功"
    }
  });
});

/**
 * 刪除資源
 */
export const deleteResource = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const resource = await Resource.findByPk(id);
  
  if (!resource) {
    return res.status(404).json({
      success: false,
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "資源不存在"
      }
    });
  }

  // 刪除標籤關聯
  await resource.setTags([]);
  
  // 刪除資源
  await resource.destroy();

  logger.info('資源刪除成功', { resourceId: id });

  res.json({
    success: true,
    data: {
      message: "資源刪除成功"
    }
  });
});

/**
 * 解密資源密碼
 */
export const decryptPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const resource = await Resource.findByPk(id);
  
  if (!resource) {
    return res.status(404).json({
      success: false,
      error: {
        code: "RESOURCE_NOT_FOUND",
        message: "資源不存在"
      }
    });
  }

  if (!resource.LoginPasswordEncrypted) {
    return res.json({
      success: true,
      data: {
        password: null,
        message: "該資源沒有設定密碼"
      }
    });
  }

  try {
    const decryptedPassword = decrypt(resource.LoginPasswordEncrypted);
    
    logger.info('密碼解密請求', { 
      resourceId: id, 
      userId: req.user?.Id,
      resourceName: resource.Name 
    });

    res.json({
      success: true,
      data: {
        password: decryptedPassword
      }
    });
  } catch (error) {
    logger.error('密碼解密失敗', { resourceId: id, error: error.message });
    
    res.status(500).json({
      success: false,
      error: {
        code: "DECRYPT_ERROR",
        message: "密碼解密失敗"
      }
    });
  }
});