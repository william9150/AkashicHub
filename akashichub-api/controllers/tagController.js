import { Tag } from "../models/index.js";
import { Op } from "sequelize";
import logger from "../utils/logger.js";

/**
 * 取得所有標籤，可依 category 查詢
 */
export async function getAllTags(req, res) {
  const { category } = req.query;
  const where = category ? { Category: category } : {};
  const tags = await Tag.findAll({ where });
  res.json({ success: true, data: tags });
}

/**
 * 新增標籤
 */
export async function createTag(req, res) {
  try {
    const { name, category } = req.body;
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "name 與 category 為必填" },
      });
    }

    // 檢查是否已存在相同的標籤
    const existingTag = await Tag.findOne({
      where: { Name: name, Category: category }
    });
    
    if (existingTag) {
      return res.status(409).json({
        success: false,
        error: { code: "DUPLICATE_TAG", message: "相同名稱和類別的標籤已存在" },
      });
    }

    const tag = await Tag.create({ 
      Name: name, 
      Category: category,
      CreatedBy: req.user.id
    });

    logger.info("TAG_CREATED", { tagId: tag.Id, userId: req.user?.Id });

    res.status(201).json({ success: true, data: tag });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        error: { code: "DUPLICATE_TAG", message: "相同名稱和類別的標籤已存在" },
      });
    }
    logger.error("TAG_CREATE_ERROR", { error: error.message, userId: req.user?.Id });
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "建立標籤時發生錯誤" },
    });
  }
}

/**
 * 更新標籤
 */
export async function updateTag(req, res) {
  try {
    const id = req.params.id;
    const { name, category } = req.body;
    const tag = await Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Tag 不存在" },
      });
    }

    const newName = name !== undefined ? name : tag.Name;
    const newCategory = category !== undefined ? category : tag.Category;

    // 如果名稱或類別有變更，檢查是否會產生重複
    if (newName !== tag.Name || newCategory !== tag.Category) {
      const existingTag = await Tag.findOne({
        where: { 
          Name: newName, 
          Category: newCategory,
          Id: { [Op.ne]: id } // 排除自己
        }
      });
      
      if (existingTag) {
        return res.status(409).json({
          success: false,
          error: { code: "DUPLICATE_TAG", message: "相同名稱和類別的標籤已存在" },
        });
      }
    }

    await tag.update({
      Name: newName,
      Category: newCategory,
    });

    logger.info("TAG_UPDATED", { tagId: id, userId: req.user?.Id });

    res.json({ success: true, message: "Tag updated successfully." });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        error: { code: "DUPLICATE_TAG", message: "相同名稱和類別的標籤已存在" },
      });
    }
    logger.error("TAG_UPDATE_ERROR", { error: error.message, tagId: req.params.id, userId: req.user?.Id });
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "更新標籤時發生錯誤" },
    });
  }
}

/**
 * 刪除標籤
 */
export async function deleteTag(req, res) {
  const id = req.params.id;
  const tag = await Tag.findByPk(id);
  if (!tag) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Tag 不存在" },
    });
  }

  // 檢查擁有者權限（如果中介軟體設定了 checkOwnership）
  if (req.checkOwnership && tag.CreatedBy !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message: "只能刪除自己創建的標籤" },
    });
  }

  await tag.destroy();

  logger.info("TAG_DELETED", { tagId: id, userId: req.user?.Id });

  res.status(204).send();
}
