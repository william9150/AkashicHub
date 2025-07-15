import { Tag } from "../models/index.js";
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
  const { name, category } = req.body;
  if (!name || !category) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "name 與 category 為必填" },
    });
  }
  const tag = await Tag.create({ Name: name, Category: category });

  logger.info("TAG_CREATED", { tagId: tag.Id, userId: req.user?.Id });

  res.status(201).json({ success: true, data: tag });
}

/**
 * 更新標籤
 */
export async function updateTag(req, res) {
  const id = req.params.id;
  const { name, category } = req.body;
  const tag = await Tag.findByPk(id);
  if (!tag) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Tag 不存在" },
    });
  }
  await tag.update({
    Name: name !== undefined ? name : tag.Name,
    Category: category !== undefined ? category : tag.Category,
  });

  logger.info("TAG_UPDATED", { tagId: id, userId: req.user?.Id });

  res.json({ success: true, message: "Tag updated successfully." });
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
  await tag.destroy();

  logger.info("TAG_DELETED", { tagId: id, userId: req.user?.Id });

  res.status(204).send();
}
