import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcrypt";
import { Sequelize } from "sequelize";
import sequelize from "../config/database.js";
import { User, Resource, Tag, ResourceTag, ResourceRelationship } from "../models/index.js";
import { encrypt } from "../utils/crypto.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function createDatabaseIfNotExists() {
  // 建立不含資料庫名稱的連線來檢查和建立資料庫
  const tempSequelize = new Sequelize("", process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false,
  });

  try {
    console.log("檢查資料庫是否存在...");
    await tempSequelize.authenticate();

    // 檢查資料庫是否存在
    const [results] = await tempSequelize.query(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${process.env.DB_NAME}'`);

    if (results.length === 0) {
      console.log(`建立資料庫 ${process.env.DB_NAME}...`);
      await tempSequelize.query(`CREATE DATABASE \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log(`資料庫 ${process.env.DB_NAME} 建立成功`);
    } else {
      console.log(`資料庫 ${process.env.DB_NAME} 已存在`);
    }
  } catch (error) {
    console.error("資料庫檢查或建立失敗:", error.message);
    throw error;
  } finally {
    await tempSequelize.close();
  }
}

async function init() {
  try {
    // 先檢查並建立資料庫
    await createDatabaseIfNotExists();

    // 檢查資料庫連線
    console.log("檢查資料庫連線...");
    await sequelize.authenticate();
    console.log("資料庫連線成功");

    // 刪除並重新創建資料表
    console.log("刪除現有資料表並重新創建...");
    await sequelize.sync({ force: true });
    console.log("資料表重新創建完成");

    const adminAccount = process.env.DEFAULT_ADMIN_ACCOUNT || "admin";
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin";

    // 建立預設管理員帳號
    let adminUser = await User.findOne({ where: { LoginAccount: adminAccount } });
    if (!adminUser) {
      const hash = await bcrypt.hash(adminPassword, 10);
      adminUser = await User.create({
        LoginAccount: adminAccount,
        DisplayName: "系統管理員",
        PasswordHash: hash,
        Role: "SuperAdmin",
        Status: "Active",
        CreatedBy: null,
        UpdatedBy: null,
      });
      console.log("預設管理員帳號已建立:", adminAccount);
    } else {
      console.log("預設管理員帳號已存在:", adminAccount);
    }

    // 獲取管理員用戶 ID (用於審計字段)
    const adminUserId = adminUser.Id;

    // 建立 willy 用戶帳號
    const willyAccount = "willy";
    const willyPassword = "55665566";
    const existingWilly = await User.findOne({ where: { LoginAccount: willyAccount } });
    if (!existingWilly) {
      const willyHash = await bcrypt.hash(willyPassword, 10);
      await User.create({
        LoginAccount: willyAccount,
        DisplayName: "Willy",
        PasswordHash: willyHash,
        Role: "ITManager",
        Status: "Active",
        CreatedBy: adminUserId,
        UpdatedBy: adminUserId,
      });
      console.log("Willy 用戶帳號已建立:", willyAccount);
    } else {
      console.log("Willy 用戶帳號已存在:", willyAccount);
    }

    // 建立範例標籤
    const sampleTags = [
      { Name: "生產環境", Category: "環境", Color: "#F56C6C", Description: "生產環境資源" },
      { Name: "測試環境", Category: "環境", Color: "#E6A23C", Description: "測試環境資源" },
      { Name: "開發環境", Category: "環境", Color: "#67C23A", Description: "開發環境資源" },
      { Name: "Web伺服器", Category: "服務類型", Color: "#409EFF", Description: "Web伺服器服務" },
      { Name: "資料庫", Category: "服務類型", Color: "#909399", Description: "資料庫服務" },
      { Name: "API服務", Category: "服務類型", Color: "#606266", Description: "API服務" },
      { Name: "高優先級", Category: "重要性", Color: "#F56C6C", Description: "高優先級資源" },
      { Name: "中優先級", Category: "重要性", Color: "#E6A23C", Description: "中優先級資源" },
    ];

    for (const tagData of sampleTags) {
      try {
        const existingTag = await Tag.findOne({
          where: {
            Name: tagData.Name,
            Category: tagData.Category,
          },
        });
        if (!existingTag) {
          await Tag.create({
            ...tagData,
            IsActive: true,
            CreatedBy: adminUserId,
            UpdatedBy: adminUserId,
          });
          console.log(`建立標籤: ${tagData.Name} (${tagData.Category})`);
        }
      } catch (error) {
        // 如果是唯一性約束違反，忽略錯誤
        if (error.name === "SequelizeUniqueConstraintError") {
          console.log(`標籤已存在: ${tagData.Name} (${tagData.Category})`);
        } else {
          throw error;
        }
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
        Status: "Active",
        CreatedBy: adminUserId,
        UpdatedBy: adminUserId,
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
        Status: "Active",
        CreatedBy: adminUserId,
        UpdatedBy: adminUserId,
      },
      {
        ResourceType: "API服務",
        Name: "用戶管理API",
        IpAddress: "192.168.1.102",
        LoginUser: "apiuser",
        LoginPasswordEncrypted: encrypt("apikey789"),
        Description: "處理用戶註冊、登入和管理功能的RESTful API服務",
        Port: 8080,
        Status: "Active",
        CreatedBy: adminUserId,
        UpdatedBy: adminUserId,
      },
      {
        ResourceType: "伺服器",
        Name: "測試環境伺服器",
        IpAddress: "192.168.1.103",
        LoginUser: "testuser",
        LoginPasswordEncrypted: encrypt("testpass123"),
        Description: "用於功能測試和QA驗證的測試環境伺服器",
        Port: 8000,
        Status: "Active",
        CreatedBy: adminUserId,
        UpdatedBy: adminUserId,
      },
      {
        ResourceType: "網站",
        Name: "公司官網",
        IpAddress: "203.0.113.10",
        LoginUser: "webmaster",
        LoginPasswordEncrypted: encrypt("website456"),
        Description: "公司對外官方網站，提供產品資訊和客戶服務",
        Port: 443,
        Status: "Active",
        CreatedBy: adminUserId,
        UpdatedBy: adminUserId,
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
      const resource = createdResources.find((r) => r.Name === mapping.resourceName);
      if (resource) {
        for (const tagName of mapping.tags) {
          const tag = await Tag.findOne({ where: { Name: tagName } });
          if (tag) {
            const existingMapping = await ResourceTag.findOne({
              where: { ResourceId: resource.Id, TagId: tag.Id },
            });
            if (!existingMapping) {
              await ResourceTag.create({
                ResourceId: resource.Id,
                TagId: tag.Id,
                CreatedBy: adminUserId,
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
      const sourceResource = createdResources.find((r) => r.Name === rel.source);
      const targetResource = createdResources.find((r) => r.Name === rel.target);

      if (sourceResource && targetResource) {
        const existingRel = await ResourceRelationship.findOne({
          where: {
            SourceResourceId: sourceResource.Id,
            TargetResourceId: targetResource.Id,
            RelationshipType: rel.type,
          },
        });

        if (!existingRel) {
          await ResourceRelationship.create({
            SourceResourceId: sourceResource.Id,
            TargetResourceId: targetResource.Id,
            RelationshipType: rel.type,
            Description: rel.description,
            IsActive: true,
            CreatedBy: adminUserId,
            UpdatedBy: adminUserId,
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
