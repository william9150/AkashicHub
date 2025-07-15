import { Tag, Resource, ResourceTag } from "../models/index.js";
import { Op } from "sequelize";
import logger from "../utils/logger.js";

export class TagService {

  /**
   * 獲取所有標籤
   * @param {Object} options - 查詢選項
   * @returns {Object} 標籤列表
   */
  async getAllTags(options = {}) {
    try {
      const { category, includeResourceCount = false } = options;
      
      const whereClause = {};
      const includeClause = [];

      // 按分類篩選
      if (category) {
        whereClause.Category = category;
      }

      // 是否包含資源數量
      if (includeResourceCount) {
        includeClause.push({
          model: Resource,
          as: 'Resources',
          through: { attributes: [] },
          attributes: []
        });
      }

      const tags = await Tag.findAll({
        where: whereClause,
        include: includeClause,
        order: [['Category', 'ASC'], ['Name', 'ASC']],
        ...(includeResourceCount && {
          attributes: {
            include: [
              [Tag.sequelize.fn('COUNT', Tag.sequelize.col('Resources.Id')), 'resourceCount']
            ]
          },
          group: ['Tags.Id']
        })
      });

      logger.info("獲取標籤列表", { category, includeResourceCount, count: tags.length });

      return {
        success: true,
        data: tags
      };

    } catch (error) {
      logger.error("獲取標籤列表錯誤", { error: error.message, options });
      throw error;
    }
  }

  /**
   * 根據ID獲取標籤
   * @param {number} tagId - 標籤ID
   * @returns {Object} 標籤詳情
   */
  async getTagById(tagId) {
    try {
      const tag = await Tag.findByPk(tagId, {
        include: [{
          model: Resource,
          as: 'Resources',
          through: { attributes: [] },
          attributes: ['Id', 'Name', 'ResourceType', 'IpAddress']
        }]
      });

      if (!tag) {
        throw new Error("TAG_NOT_FOUND");
      }

      logger.info("獲取標籤詳情", { tagId });

      return {
        success: true,
        data: tag
      };

    } catch (error) {
      logger.error("獲取標籤詳情錯誤", { error: error.message, tagId });
      throw error;
    }
  }

  /**
   * 創建新標籤
   * @param {Object} tagData - 標籤數據
   * @returns {Object} 創建的標籤
   */
  async createTag(tagData) {
    try {
      const { name, category } = tagData;

      // 驗證必填欄位
      if (!name || !category) {
        throw new Error("TAG_NAME_CATEGORY_REQUIRED");
      }

      // 檢查標籤名稱是否已存在
      const existingTag = await Tag.findOne({
        where: { Name: name, Category: category }
      });

      if (existingTag) {
        throw new Error("TAG_ALREADY_EXISTS");
      }

      // 創建標籤
      const tag = await Tag.create({
        Name: name,
        Category: category
      });

      logger.info("創建標籤成功", { tagId: tag.Id, name, category });

      return {
        success: true,
        data: tag
      };

    } catch (error) {
      logger.error("創建標籤錯誤", { error: error.message, tagData });
      throw error;
    }
  }

  /**
   * 更新標籤
   * @param {number} tagId - 標籤ID
   * @param {Object} updateData - 更新數據
   * @returns {Object} 更新後的標籤
   */
  async updateTag(tagId, updateData) {
    try {
      const tag = await Tag.findByPk(tagId);
      if (!tag) {
        throw new Error("TAG_NOT_FOUND");
      }

      const { name, category } = updateData;

      // 準備更新數據
      const updateFields = {};
      if (name !== undefined) updateFields.Name = name;
      if (category !== undefined) updateFields.Category = category;

      // 檢查更新後的標籤名稱是否與其他標籤衝突
      if (name || category) {
        const checkName = name || tag.Name;
        const checkCategory = category || tag.Category;
        
        const existingTag = await Tag.findOne({
          where: { 
            Name: checkName, 
            Category: checkCategory,
            Id: { [Op.ne]: tagId }
          }
        });

        if (existingTag) {
          throw new Error("TAG_ALREADY_EXISTS");
        }
      }

      // 更新標籤
      await tag.update(updateFields);

      logger.info("更新標籤成功", { tagId, updateFields });

      return {
        success: true,
        data: tag
      };

    } catch (error) {
      logger.error("更新標籤錯誤", { error: error.message, tagId, updateData });
      throw error;
    }
  }

  /**
   * 刪除標籤
   * @param {number} tagId - 標籤ID
   * @returns {Object} 刪除結果
   */
  async deleteTag(tagId) {
    try {
      const tag = await Tag.findByPk(tagId);
      if (!tag) {
        throw new Error("TAG_NOT_FOUND");
      }

      // 檢查是否有資源使用此標籤
      const resourceCount = await ResourceTag.count({
        where: { TagId: tagId }
      });

      if (resourceCount > 0) {
        throw new Error("TAG_IN_USE");
      }

      // 刪除標籤
      await tag.destroy();

      logger.info("刪除標籤成功", { tagId, tagName: tag.Name });

      return {
        success: true,
        data: { message: "標籤刪除成功" }
      };

    } catch (error) {
      logger.error("刪除標籤錯誤", { error: error.message, tagId });
      throw error;
    }
  }

  /**
   * 獲取標籤分類列表
   * @returns {Object} 分類列表
   */
  async getTagCategories() {
    try {
      const categories = await Tag.findAll({
        attributes: [
          'Category',
          [Tag.sequelize.fn('COUNT', Tag.sequelize.col('Id')), 'tagCount']
        ],
        group: ['Category'],
        order: [['Category', 'ASC']]
      });

      return {
        success: true,
        data: categories
      };

    } catch (error) {
      logger.error("獲取標籤分類錯誤", { error: error.message });
      throw error;
    }
  }

  /**
   * 搜尋標籤
   * @param {string} searchTerm - 搜尋關鍵字
   * @returns {Object} 搜尋結果
   */
  async searchTags(searchTerm) {
    try {
      const tags = await Tag.findAll({
        where: {
          [Op.or]: [
            { Name: { [Op.like]: `%${searchTerm}%` } },
            { Category: { [Op.like]: `%${searchTerm}%` } }
          ]
        },
        order: [['Category', 'ASC'], ['Name', 'ASC']],
        limit: 20
      });

      logger.info("標籤搜尋", { searchTerm, resultCount: tags.length });

      return {
        success: true,
        data: tags
      };

    } catch (error) {
      logger.error("標籤搜尋錯誤", { error: error.message, searchTerm });
      throw error;
    }
  }

  /**
   * 批量創建標籤
   * @param {Array} tagsData - 標籤數據陣列
   * @returns {Object} 創建結果
   */
  async bulkCreateTags(tagsData) {
    try {
      // 驗證數據格式
      for (const tagData of tagsData) {
        if (!tagData.name || !tagData.category) {
          throw new Error("TAG_NAME_CATEGORY_REQUIRED");
        }
      }

      // 檢查重複標籤
      const existingTags = await Tag.findAll({
        where: {
          [Op.or]: tagsData.map(tag => ({
            Name: tag.name,
            Category: tag.category
          }))
        }
      });

      if (existingTags.length > 0) {
        const duplicateNames = existingTags.map(tag => `${tag.Category}:${tag.Name}`);
        throw new Error(`DUPLICATE_TAGS: ${duplicateNames.join(', ')}`);
      }

      // 批量創建
      const tags = await Tag.bulkCreate(
        tagsData.map(tag => ({
          Name: tag.name,
          Category: tag.category
        }))
      );

      logger.info("批量創建標籤成功", { count: tags.length });

      return {
        success: true,
        data: tags
      };

    } catch (error) {
      logger.error("批量創建標籤錯誤", { error: error.message, tagsData });
      throw error;
    }
  }
}

// 創建單例服務實例
export const tagService = new TagService();
export default tagService;