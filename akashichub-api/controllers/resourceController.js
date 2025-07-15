import { Resource, Tag, ResourceTag, ResourceRelationship } from "../models/index.js";
import { Op } from "sequelize";
import { encrypt, decrypt } from "../utils/crypto.js";
import logger from "../utils/logger.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { buildResourceQuery, queryPerformanceMiddleware } from "../utils/queryOptimizer.js";

/**
 * 取得資源列表，可篩選 keyword, tagIds, 分頁
 */
export const getResources = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { keyword, tags, resourceType, page = 1, limit = 20, sortBy, sortOrder } = req.query;

  // 使用查詢優化器建立查詢配置
  const queryConfig = buildResourceQuery({
    page,
    limit,
    keyword,
    tags,
    resourceType,
    sortBy,
    sortOrder,
    includeTags: true,
    includeRelationships: false
  });

  // 執行優化查詢
  const resources = await Resource.findAndCountAll(queryConfig);

  // 計算效能統計
  const queryStats = {
    duration: Date.now() - startTime,
    recordCount: resources.count,
    queryType: 'resources_list'
  };

  // 在開發環境中添加效能資訊到回應頭
  if (process.env.NODE_ENV === 'development') {
    res.set({
      'X-Query-Time': queryStats.duration,
      'X-Record-Count': queryStats.recordCount,
      'X-Query-Type': queryStats.queryType
    });
  }

  logger.info('資源列表查詢', queryStats);

  res.json({
    success: true,
    data: {
      resources: resources.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(resources.count / limit),
        totalItems: resources.count,
        limit: parseInt(limit)
      }
    }
  });
});

/**
 * 建立資源
 */
export const createResource = asyncHandler(async (req, res) => {
  const { resourceType, name, ipAddress, loginUser, loginPassword, description, port, dbName, dbVersion, tagIds = [], newTags = [], relatedResourceIds = [] } = req.body;

  // 加密密碼 (AES-256-GCM)
  const loginPasswordEncrypted = loginPassword ? encrypt(loginPassword) : "";

  const resource = await Resource.create({
    ResourceType: resourceType,
    Name: name,
    IpAddress: ipAddress,
    LoginUser: loginUser,
    LoginPasswordEncrypted: loginPasswordEncrypted,
    Description: description,
    Port: port,
    DbName: dbName,
    DbVersion: dbVersion,
  });

  // 關聯既有標籤
  if (tagIds.length) {
    const existingTags = await Tag.findAll({ where: { Id: tagIds } });
    await resource.addTags(existingTags);
  }
  // 新增並關聯新標籤
  if (newTags.length) {
    for (const t of newTags) {
      const tag = await Tag.create({ Name: t.name, Category: t.category });
      await resource.addTags([tag]);
    }
  }
  // 關聯其他資源
  if (relatedResourceIds.length) {
    const relationshipData = relatedResourceIds.map(targetId => ({
      SourceResourceId: resource.Id,
      TargetResourceId: targetId,
      RelationshipType: "使用"
    }));
    await ResourceRelationship.bulkCreate(relationshipData);
  }

  const data = await Resource.findByPk(resource.Id, {
    include: [{ model: Tag, as: "Tags", through: { attributes: [] } }],
  });

  logger.info("RESOURCE_CREATED", { resourceId: resource.Id, userId: req.user?.Id });

  res.status(201).json({ success: true, data });
});

/**
 * 取得單一資源詳情
 */
export const getResource = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const resource = await Resource.findByPk(id, {
    include: [
      { model: Tag, as: "Tags", through: { attributes: [] } },
      {
        model: ResourceRelationship,
        as: "OutgoingRelationships",
        include: [{ model: Resource, as: "TargetResource", attributes: ["Id", "Name", "ResourceType"] }]
      },
      {
        model: ResourceRelationship,
        as: "IncomingRelationships",
        include: [{ model: Resource, as: "SourceResource", attributes: ["Id", "Name", "ResourceType"] }]
      }
    ],
  });
  if (!resource) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Resource 不存在" },
    });
  }
  res.json({ success: true, data: resource });
});

/**
 * 更新資源
 */
export const updateResource = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const resource = await Resource.findByPk(id);
  if (!resource) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Resource 不存在" },
    });
  }

  // 處理密碼欄位
  const { loginPassword, tagIds = [], newTags = [], relatedResourceIds = [], ...rest } = req.body;
  if (loginPassword !== undefined) {
    rest.LoginPasswordEncrypted = loginPassword ? encrypt(loginPassword) : "";
  }

  // 先更新 Resource 主要欄位
  await resource.update(rest);

  /* ---------- Tag 同步 ---------- */
  // 1. 建立新標籤並收集其 Id
  const createdTagIds = [];
  for (const t of newTags) {
    if (t && t.name) {
      const tag = await Tag.create({ Name: t.name, Category: t.category });
      createdTagIds.push(tag.Id);
    }
  }
  const finalTagIds = [...new Set([...tagIds, ...createdTagIds])];

  // 2. 取得目前已關聯標籤 Id
  const currentTags = await resource.getTags({ attributes: ["Id"] });
  const currentTagIds = currentTags.map((t) => t.Id);

  // 3. 計算差異並執行增減
  const tagsToAdd = finalTagIds.filter((id) => !currentTagIds.includes(id));
  const tagsToRemove = currentTagIds.filter((id) => !finalTagIds.includes(id));

  if (tagsToAdd.length) {
    const tagsToAddObjects = await Tag.findAll({ where: { Id: tagsToAdd } });
    await resource.addTags(tagsToAddObjects);
  }
  if (tagsToRemove.length) {
    const tagsToRemoveObjects = await Tag.findAll({ where: { Id: tagsToRemove } });
    await resource.removeTags(tagsToRemoveObjects);
  }

  /* ---------- RelatedResource 同步 ---------- */
  if (Array.isArray(relatedResourceIds)) {
    const existing = await ResourceRelationship.findAll({
      where: { SourceResourceId: resource.Id },
      attributes: ["TargetResourceId"],
    });
    const currentRelatedIds = existing.map((r) => r.TargetResourceId);

    const relsToAdd = relatedResourceIds.filter((rid) => !currentRelatedIds.includes(rid));
    const relsToRemove = currentRelatedIds.filter((rid) => !relatedResourceIds.includes(rid));

    if (relsToAdd.length) {
      const records = relsToAdd.map((rid) => ({
        SourceResourceId: resource.Id,
        TargetResourceId: rid,
      }));
      await ResourceRelationship.bulkCreate(records);
    }
    if (relsToRemove.length) {
      await ResourceRelationship.destroy({
        where: {
          SourceResourceId: resource.Id,
          TargetResourceId: relsToRemove,
        },
      });
    }
  }

  logger.info("RESOURCE_UPDATED", { resourceId: id, userId: req.user?.Id });

  // 回傳最新資料
  const data = await Resource.findByPk(resource.Id, {
    include: [{ model: Tag, as: "Tags", through: { attributes: [] } }],
  });

  res.json({ success: true, data });
});

/**
 * 刪除資源
 */
export const deleteResource = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const resource = await Resource.findByPk(id);
  if (!resource) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Resource 不存在" },
    });
  }
  await resource.destroy();

  logger.info("RESOURCE_DELETED", { resourceId: id, userId: req.user?.Id });
  res.status(204).send();
});

/**
 * 解密並取得密碼
 */
export const decryptPassword = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const resource = await Resource.findByPk(id);
  if (!resource) {
    return res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Resource 不存在" },
    });
  }

  const plainPassword = decrypt(resource.LoginPasswordEncrypted);

  logger.info("RESOURCE_PASSWORD_DECRYPTED", { resourceId: id, userId: req.user?.Id });
  res.json({
    success: true,
    data: { plainPassword },
  });
});
