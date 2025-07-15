import { Resource, Tag, ResourceTag, ResourceRelationship } from "../models/index.js";
import { Op } from "sequelize";
import { encrypt, decrypt } from "../utils/crypto.js";
import logger from "../utils/logger.js";

export class ResourceService {

  /**
   * 分頁查詢資源列表
   * @param {Object} options - 查詢選項
   * @returns {Object} 資源列表和分頁資訊
   */
  async getResources(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        keyword = '',
        tags = '',
        resourceType = ''
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {};
      const includeClause = [{
        model: Tag,
        as: 'Tags',
        through: { attributes: [] }
      }];

      // 關鍵字搜尋
      if (keyword) {
        whereClause[Op.or] = [
          { Name: { [Op.like]: `%${keyword}%` } },
          { IpAddress: { [Op.like]: `%${keyword}%` } },
          { Description: { [Op.like]: `%${keyword}%` } }
        ];
      }

      // 資源類型篩選
      if (resourceType) {
        whereClause.ResourceType = resourceType;
      }

      // 標籤篩選
      if (tags) {
        const tagNames = tags.split(',').map(tag => tag.trim());
        includeClause[0].where = {
          Name: { [Op.in]: tagNames }
        };
        includeClause[0].required = true;
      }

      const { count, rows } = await Resource.findAndCountAll({
        where: whereClause,
        include: includeClause,
        limit: parseInt(limit),
        offset: offset,
        order: [['Id', 'DESC']],
        distinct: true
      });

      const totalPages = Math.ceil(count / limit);

      logger.info("資源列表查詢", {
        page,
        limit,
        keyword,
        tags,
        resourceType,
        totalItems: count
      });

      return {
        success: true,
        data: {
          resources: rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: count,
            limit: parseInt(limit)
          }
        }
      };

    } catch (error) {
      logger.error("查詢資源列表錯誤", { error: error.message, options });
      throw error;
    }
  }

  /**
   * 根據ID獲取單一資源
   * @param {number} resourceId - 資源ID
   * @returns {Object} 資源詳情
   */
  async getResourceById(resourceId) {
    try {
      const resource = await Resource.findByPk(resourceId, {
        include: [
          {
            model: Tag,
            as: 'Tags',
            through: { attributes: [] }
          },
          {
            model: ResourceRelationship,
            as: 'OutgoingRelationships',
            include: [{
              model: Resource,
              as: 'TargetResource',
              attributes: ['Id', 'Name', 'ResourceType']
            }]
          },
          {
            model: ResourceRelationship,
            as: 'IncomingRelationships',
            include: [{
              model: Resource,
              as: 'SourceResource',
              attributes: ['Id', 'Name', 'ResourceType']
            }]
          }
        ]
      });

      if (!resource) {
        throw new Error("RESOURCE_NOT_FOUND");
      }

      logger.info("獲取資源詳情", { resourceId });

      return {
        success: true,
        data: resource
      };

    } catch (error) {
      logger.error("獲取資源詳情錯誤", { error: error.message, resourceId });
      throw error;
    }
  }

  /**
   * 創建新資源
   * @param {Object} resourceData - 資源數據
   * @returns {Object} 創建的資源
   */
  async createResource(resourceData) {
    try {
      const {
        resourceType,
        name,
        ipAddress,
        loginUser,
        loginPassword,
        description,
        port,
        dbName,
        dbVersion,
        tagIds = []
      } = resourceData;

      // 驗證必填欄位
      if (!resourceType || !name) {
        throw new Error("RESOURCE_TYPE_NAME_REQUIRED");
      }

      // 加密登入密碼
      let encryptedPassword = null;
      if (loginPassword) {
        encryptedPassword = encrypt(loginPassword);
      }

      // 創建資源
      const resource = await Resource.create({
        ResourceType: resourceType,
        Name: name,
        IpAddress: ipAddress,
        LoginUser: loginUser,
        LoginPasswordEncrypted: encryptedPassword,
        Description: description,
        Port: port,
        DbName: dbName,
        DbVersion: dbVersion
      });

      // 關聯標籤
      if (tagIds.length > 0) {
        await this.updateResourceTags(resource.Id, tagIds);
      }

      // 獲取完整的資源資訊（包含標籤）
      const createdResource = await this.getResourceById(resource.Id);

      logger.info("創建資源成功", { 
        resourceId: resource.Id, 
        resourceType, 
        name 
      });

      return createdResource;

    } catch (error) {
      logger.error("創建資源錯誤", { error: error.message, resourceData });
      throw error;
    }
  }

  /**
   * 更新資源
   * @param {number} resourceId - 資源ID
   * @param {Object} updateData - 更新數據
   * @returns {Object} 更新後的資源
   */
  async updateResource(resourceId, updateData) {
    try {
      const resource = await Resource.findByPk(resourceId);
      if (!resource) {
        throw new Error("RESOURCE_NOT_FOUND");
      }

      const {
        resourceType,
        name,
        ipAddress,
        loginUser,
        loginPassword,
        description,
        port,
        dbName,
        dbVersion,
        tagIds
      } = updateData;

      // 準備更新數據
      const updateFields = {};
      if (resourceType !== undefined) updateFields.ResourceType = resourceType;
      if (name !== undefined) updateFields.Name = name;
      if (ipAddress !== undefined) updateFields.IpAddress = ipAddress;
      if (loginUser !== undefined) updateFields.LoginUser = loginUser;
      if (description !== undefined) updateFields.Description = description;
      if (port !== undefined) updateFields.Port = port;
      if (dbName !== undefined) updateFields.DbName = dbName;
      if (dbVersion !== undefined) updateFields.DbVersion = dbVersion;

      // 處理密碼更新
      if (loginPassword !== undefined) {
        updateFields.LoginPasswordEncrypted = loginPassword ? encrypt(loginPassword) : null;
      }

      // 更新資源
      await resource.update(updateFields);

      // 更新標籤關聯
      if (tagIds !== undefined) {
        await this.updateResourceTags(resourceId, tagIds);
      }

      // 獲取更新後的資源資訊
      const updatedResource = await this.getResourceById(resourceId);

      logger.info("更新資源成功", { resourceId, updateFields });

      return updatedResource;

    } catch (error) {
      logger.error("更新資源錯誤", { error: error.message, resourceId, updateData });
      throw error;
    }
  }

  /**
   * 刪除資源
   * @param {number} resourceId - 資源ID
   * @returns {Object} 刪除結果
   */
  async deleteResource(resourceId) {
    try {
      const resource = await Resource.findByPk(resourceId);
      if (!resource) {
        throw new Error("RESOURCE_NOT_FOUND");
      }

      // 刪除相關聯的數據
      await ResourceTag.destroy({ where: { ResourceId: resourceId } });
      await ResourceRelationship.destroy({
        where: {
          [Op.or]: [
            { SourceResourceId: resourceId },
            { TargetResourceId: resourceId }
          ]
        }
      });

      // 刪除資源
      await resource.destroy();

      logger.info("刪除資源成功", { resourceId, resourceName: resource.Name });

      return {
        success: true,
        data: { message: "資源刪除成功" }
      };

    } catch (error) {
      logger.error("刪除資源錯誤", { error: error.message, resourceId });
      throw error;
    }
  }

  /**
   * 解密資源密碼
   * @param {number} resourceId - 資源ID
   * @returns {Object} 解密的密碼
   */
  async decryptResourcePassword(resourceId) {
    try {
      const resource = await Resource.findByPk(resourceId, {
        attributes: ['Id', 'Name', 'LoginPasswordEncrypted']
      });

      if (!resource) {
        throw new Error("RESOURCE_NOT_FOUND");
      }

      if (!resource.LoginPasswordEncrypted) {
        throw new Error("RESOURCE_NO_PASSWORD");
      }

      const decryptedPassword = decrypt(resource.LoginPasswordEncrypted);

      logger.info("資源密碼解密", { resourceId, resourceName: resource.Name });

      return {
        success: true,
        data: {
          password: decryptedPassword
        }
      };

    } catch (error) {
      logger.error("解密資源密碼錯誤", { error: error.message, resourceId });
      throw error;
    }
  }

  /**
   * 更新資源標籤關聯
   * @param {number} resourceId - 資源ID
   * @param {Array} tagIds - 標籤ID陣列
   */
  async updateResourceTags(resourceId, tagIds) {
    try {
      // 刪除現有關聯
      await ResourceTag.destroy({ where: { ResourceId: resourceId } });

      // 創建新關聯
      if (tagIds && tagIds.length > 0) {
        const resourceTags = tagIds.map(tagId => ({
          ResourceId: resourceId,
          TagId: tagId
        }));
        await ResourceTag.bulkCreate(resourceTags);
      }

      logger.info("更新資源標籤關聯", { resourceId, tagIds });

    } catch (error) {
      logger.error("更新資源標籤關聯錯誤", { error: error.message, resourceId, tagIds });
      throw error;
    }
  }

  /**
   * 獲取資源類型統計
   * @returns {Object} 資源類型統計
   */
  async getResourceTypeStats() {
    try {
      const stats = await Resource.findAll({
        attributes: [
          'ResourceType',
          [Resource.sequelize.fn('COUNT', Resource.sequelize.col('Id')), 'count']
        ],
        group: ['ResourceType'],
        order: [[Resource.sequelize.fn('COUNT', Resource.sequelize.col('Id')), 'DESC']]
      });

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      logger.error("獲取資源類型統計錯誤", { error: error.message });
      throw error;
    }
  }
}

// 創建單例服務實例
export const resourceService = new ResourceService();
export default resourceService;