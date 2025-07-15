import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcrypt";
import sequelize from "../config/database.js";
import { User, Resource, Tag, ResourceTag, ResourceRelationship } from "../models/index.js";
import { encrypt } from "../utils/crypto.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function init() {
  try {
    await sequelize.sync();

    const adminAccount = process.env.DEFAULT_ADMIN_ACCOUNT || "admin";
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin";

    // 建立預設管理員帳號
    const existing = await User.findOne({ where: { LoginAccount: adminAccount } });
    if (!existing) {
      const hash = await bcrypt.hash(adminPassword, 10);
      await User.create({
        LoginAccount: adminAccount,
        DisplayName: "系統管理員",
        PasswordHash: hash,
        Role: "Admin",
      });
      console.log("預設管理員帳號已建立:", adminAccount);
    } else {
      console.log("預設管理員帳號已存在:", adminAccount);
    }

    // 建立範例標籤
    const sampleTags = [
      { Name: "生產環境", Category: "環境" },
      { Name: "測試環境", Category: "環境" },
      { Name: "開發環境", Category: "環境" },
      { Name: "Web伺服器", Category: "服務類型" },
      { Name: "資料庫", Category: "服務類型" },
      { Name: "API服務", Category: "服務類型" },
      { Name: "高優先級", Category: "重要性" },
      { Name: "中優先級", Category: "重要性" },
    ];

    for (const tagData of sampleTags) {
      const existingTag = await Tag.findOne({ where: { Name: tagData.Name } });
      if (!existingTag) {
        await Tag.create(tagData);
      }
    }
    console.log("範例標籤已建立");

    // 建立範例資源
    const sampleResources = [
      {
        ResourceType: "伺服器",
        Name: "主要Web伺服器",
        IpAddress: "192.168.1.100",
        LoginUser: "admin",
        LoginPasswordEncrypted: encrypt("webserver123"),
        Description: "主要的生產環境Web伺服器，運行公司官網和主要應用程式",
        Port: 80,
      },
      {
        ResourceType: "資料庫",
        Name: "主資料庫",
        IpAddress: "192.168.1.101",
        LoginUser: "dbadmin",
        LoginPasswordEncrypted: encrypt("dbpass456"),
        Description: "MySQL主資料庫，存儲所有業務數據",
        Port: 3306,
        DbName: "production_db",
        DbVersion: "8.0.32",
      },
      {
        ResourceType: "API服務",
        Name: "用戶管理API",
        IpAddress: "192.168.1.102",
        LoginUser: "apiuser",
        LoginPasswordEncrypted: encrypt("apikey789"),
        Description: "處理用戶註冊、登入和管理功能的RESTful API服務",
        Port: 8080,
      },
      {
        ResourceType: "伺服器",
        Name: "測試環境伺服器",
        IpAddress: "192.168.1.103",
        LoginUser: "testuser",
        LoginPasswordEncrypted: encrypt("testpass123"),
        Description: "用於功能測試和QA驗證的測試環境伺服器",
        Port: 8000,
      },
      {
        ResourceType: "網站",
        Name: "公司官網",
        IpAddress: "203.0.113.10",
        LoginUser: "webmaster",
        LoginPasswordEncrypted: encrypt("website456"),
        Description: "公司對外官方網站，提供產品資訊和客戶服務",
        Port: 443,
      },
    ];

    const createdResources = [];
    for (const resourceData of sampleResources) {
      const existingResource = await Resource.findOne({ where: { Name: resourceData.Name } });
      if (!existingResource) {
        const resource = await Resource.create(resourceData);
        createdResources.push(resource);
      } else {
        createdResources.push(existingResource);
      }
    }
    console.log("範例資源已建立");

    // 為資源分配標籤
    const resourceTagMappings = [
      { resourceName: "主要Web伺服器", tags: ["生產環境", "Web伺服器", "高優先級"] },
      { resourceName: "主資料庫", tags: ["生產環境", "資料庫", "高優先級"] },
      { resourceName: "用戶管理API", tags: ["生產環境", "API服務", "高優先級"] },
      { resourceName: "測試環境伺服器", tags: ["測試環境", "Web伺服器", "中優先級"] },
      { resourceName: "公司官網", tags: ["生產環境", "Web伺服器", "中優先級"] },
    ];

    for (const mapping of resourceTagMappings) {
      const resource = createdResources.find(r => r.Name === mapping.resourceName);
      if (resource) {
        for (const tagName of mapping.tags) {
          const tag = await Tag.findOne({ where: { Name: tagName } });
          if (tag) {
            const existingMapping = await ResourceTag.findOne({
              where: { ResourceId: resource.Id, TagId: tag.Id }
            });
            if (!existingMapping) {
              await ResourceTag.create({
                ResourceId: resource.Id,
                TagId: tag.Id,
              });
            }
          }
        }
      }
    }
    console.log("資源標籤關聯已建立");

    // 建立資源關聯關係
    const resourceRelationships = [
      { source: "主要Web伺服器", target: "主資料庫", type: "連接", description: "Web伺服器連接到主資料庫讀取數據" },
      { source: "用戶管理API", target: "主資料庫", type: "連接", description: "API服務連接到主資料庫進行用戶數據操作" },
      { source: "公司官網", target: "主要Web伺服器", type: "部署", description: "官網部署在主要Web伺服器上" },
    ];

    for (const rel of resourceRelationships) {
      const sourceResource = createdResources.find(r => r.Name === rel.source);
      const targetResource = createdResources.find(r => r.Name === rel.target);
      
      if (sourceResource && targetResource) {
        const existingRel = await ResourceRelationship.findOne({
          where: {
            SourceResourceId: sourceResource.Id,
            TargetResourceId: targetResource.Id,
            RelationshipType: rel.type
          }
        });
        
        if (!existingRel) {
          await ResourceRelationship.create({
            SourceResourceId: sourceResource.Id,
            TargetResourceId: targetResource.Id,
            RelationshipType: rel.type,
            Description: rel.description,
          });
        }
      }
    }
    console.log("資源關聯關係已建立");

    process.exit(0);
  } catch (err) {
    console.error("初始化失敗:", err);
    process.exit(1);
  }
}

init();
