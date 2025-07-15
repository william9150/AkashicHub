# AkashicHub API

![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)
![Express](https://img.shields.io/badge/Express-5.x-blue.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.x-orange.svg)
![JWT](https://img.shields.io/badge/JWT-Authentication-red.svg)
![Swagger](https://img.shields.io/badge/Swagger-API_Docs-brightgreen.svg)

AkashicHub (阿卡西) 是一個現代化的 IT 內部資源檢索系統後端 API，專為企業內部技術資源的集中管理而設計。提供安全的資源管理、標籤分類、用戶權限控制和關係映射功能。

## 🌟 主要特性

### 核心功能
- **🔐 JWT 身份驗證**：安全的Token-based認證機制
- **📊 資源管理**：完整的CRUD操作，支援伺服器、資料庫、網站等IT資源
- **🏷️ 標籤系統**：靈活的分類標籤管理
- **👥 用戶管理**：多角色權限控制（Admin/User）
- **🔗 關係映射**：資源間依賴關係管理
- **🔒 密碼加密**：AES-256-GCM加密存儲敏感資訊

### 技術特色
- **📝 完整文檔**：Swagger/OpenAPI 3.0 API 文檔
- **🧪 測試覆蓋**：Jest測試框架
- **📋 結構化日誌**：Winston + Seq 日誌系統
- **🐳 容器化**：Docker支援
- **🔍 搜尋功能**：關鍵字搜尋和標籤篩選
- **📄 分頁查詢**：高效的資料分頁處理

## 📋 系統需求

- **Node.js**: 22.x 或更高版本
- **MySQL**: 8.x 或更高版本
- **npm**: 最新版本

## 🚀 快速開始

### 1. 克隆專案
```bash
git clone <repository-url>
cd akashichub-api
```

### 2. 安裝依賴
```bash
npm install
```

### 3. 環境配置
複製並編輯環境變數檔案：
```bash
cp .env.example .env
```

編輯 `.env` 檔案：
```env
# 後端 AkashicHub API 環境變數
NODE_ENV=development
PORT=3000

# JWT 設定
JWT_SECRET=your-super-secret-key-for-jwt
JWT_EXPIRES_IN=7d

# 資料庫連線
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=akashichub_db

# 密碼學加密金鑰 (32位元組)
ENCRYPTION_KEY=12345678901234567890123456789012

# Seq 日誌伺服器
SEQ_URL=http://localhost:5341
SEQ_API_KEY=

# 預設管理員帳號
DEFAULT_ADMIN_ACCOUNT=akashic_user
DEFAULT_ADMIN_PASSWORD=akashic_password
```

### 4. 資料庫初始化
```bash
npm run init-db
```

### 5. 啟動開發伺服器
```bash
npm run dev
```

伺服器將在 `http://localhost:3000` 啟動。

## 📖 API 文檔

### Swagger UI
完整的 API 文檔可通過 Swagger UI 查看：
- **文檔地址**: `http://localhost:3000/api-docs`
- **格式**: OpenAPI 3.0
- **語言**: 中文

### API 端點總覽

#### 🔐 認證 API (`/api/auth`)
- `POST /api/auth/login` - 用戶登入
- `GET /api/auth/me` - 取得當前用戶資訊

#### 📊 資源管理 API (`/api/resources`)
- `GET /api/resources` - 取得資源列表（支援分頁、搜尋、篩選）
- `POST /api/resources` - 新增資源（管理員）
- `GET /api/resources/:id` - 取得單一資源詳情
- `PUT /api/resources/:id` - 更新資源（管理員）
- `DELETE /api/resources/:id` - 刪除資源（管理員）
- `POST /api/resources/:id/decrypt-password` - 解密密碼

#### 🏷️ 標籤管理 API (`/api/tags`)
- `GET /api/tags` - 取得所有標籤
- `POST /api/tags` - 新增標籤（管理員）
- `PUT /api/tags/:id` - 更新標籤（管理員）
- `DELETE /api/tags/:id` - 刪除標籤（管理員）

#### 👥 用戶管理 API (`/api/admin/users`)
- `GET /api/admin/users` - 取得所有用戶（管理員）
- `POST /api/admin/users` - 新增用戶（管理員）
- `PUT /api/admin/users/:id` - 更新用戶（管理員）
- `DELETE /api/admin/users/:id` - 刪除用戶（管理員）

### 認證方式
API 使用 JWT Bearer Token 認證：
```
Authorization: Bearer <your-jwt-token>
```

### 預設管理員帳號
- **帳號**: `akashic_user`
- **密碼**: `akashic_password`

## 🧪 開發與測試

### 開發命令
```bash
# 啟動開發伺服器
npm run dev

# 資料庫初始化
npm run init-db

# 執行測試
npm test

# 測試覆蓋率報告
npm run test:coverage
```

### 測試結構
```
tests/
├── auth.test.js              # 認證相關測試
├── authController.test.js    # 認證控制器測試
├── resourceController.test.js # 資源控制器測試
├── tagController.test.js     # 標籤控制器測試
├── userController.test.js    # 用戶控制器測試
└── health.test.js           # 健康檢查測試
```

### 程式碼覆蓋率
當前測試覆蓋率：
- **語句覆蓋率**: 11.58%
- **分支覆蓋率**: 13.77%
- **函數覆蓋率**: 23.8%
- **行覆蓋率**: 12.14%

> 💡 **注意**: 測試覆蓋率有待改進，建議增加更多測試用例。

## 📁 專案結構

```
akashichub-api/
├── config/
│   ├── database.js           # 資料庫配置
│   └── swagger.js           # Swagger配置
├── controllers/
│   ├── authController.js    # 認證控制器
│   ├── resourceController.js # 資源控制器
│   ├── tagController.js     # 標籤控制器
│   └── userController.js    # 用戶控制器
├── middlewares/
│   ├── authMiddleware.js    # JWT認證中間件
│   ├── errorHandler.js      # 錯誤處理中間件
│   └── validation.js        # 輸入驗證中間件
├── models/
│   ├── User.js              # 用戶模型
│   ├── Resource.js          # 資源模型
│   ├── Tag.js               # 標籤模型
│   ├── ResourceTag.js       # 資源標籤關聯模型
│   ├── ResourceRelationship.js # 資源關係模型
│   └── index.js             # 模型關聯定義
├── routes/
│   ├── auth.js              # 認證路由
│   ├── resources.js         # 資源路由
│   ├── tags.js              # 標籤路由
│   └── adminUsers.js        # 用戶管理路由
├── scripts/
│   └── init.js              # 資料庫初始化腳本
├── tests/                   # 測試檔案
├── utils/
│   ├── crypto.js            # 加密工具
│   └── logger.js            # 日誌工具
├── .env                     # 環境變數
├── .env.example             # 環境變數範本
├── Dockerfile               # Docker配置
├── index.js                 # 主程式入口
├── jest.config.js           # Jest測試配置
└── package.json             # 專案依賴
```

## 🗄️ 資料庫結構

### 核心表結構

#### Users (用戶表)
```sql
CREATE TABLE Users (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  LoginAccount VARCHAR(255) UNIQUE NOT NULL,
  DisplayName VARCHAR(255) NOT NULL,
  PasswordHash VARCHAR(255) NOT NULL,
  Role ENUM('Admin', 'User') NOT NULL
);
```

#### Resources (資源表)
```sql
CREATE TABLE Resources (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  ResourceType VARCHAR(255) NOT NULL,
  Name VARCHAR(255) NOT NULL,
  IpAddress VARCHAR(255),
  LoginUser VARCHAR(255),
  LoginPasswordEncrypted VARCHAR(255),
  Description TEXT,
  Port INT,
  DbName VARCHAR(255),
  DbVersion VARCHAR(255)
);
```

#### Tags (標籤表)
```sql
CREATE TABLE Tags (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(255) NOT NULL,
  Category VARCHAR(255) NOT NULL
);
```

#### ResourceTags (資源標籤關聯表)
```sql
CREATE TABLE ResourceTags (
  ResourceId INT,
  TagId INT,
  PRIMARY KEY (ResourceId, TagId),
  FOREIGN KEY (ResourceId) REFERENCES Resources(Id),
  FOREIGN KEY (TagId) REFERENCES Tags(Id)
);
```

#### ResourceRelationships (資源關係表)
```sql
CREATE TABLE ResourceRelationships (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  SourceResourceId INT,
  TargetResourceId INT,
  RelationshipType VARCHAR(255),
  Description TEXT,
  FOREIGN KEY (SourceResourceId) REFERENCES Resources(Id),
  FOREIGN KEY (TargetResourceId) REFERENCES Resources(Id)
);
```

## 🔧 配置說明

### 環境變數詳解

| 變數名 | 描述 | 預設值 | 必填 |
|--------|------|--------|------|
| `NODE_ENV` | 執行環境 | `development` | ❌ |
| `PORT` | 伺服器端口 | `3000` | ❌ |
| `JWT_SECRET` | JWT簽名密鑰 | - | ✅ |
| `JWT_EXPIRES_IN` | Token過期時間 | `7d` | ❌ |
| `DB_HOST` | 資料庫主機 | `127.0.0.1` | ✅ |
| `DB_PORT` | 資料庫端口 | `3306` | ✅ |
| `DB_USER` | 資料庫用戶名 | - | ✅ |
| `DB_PASSWORD` | 資料庫密碼 | - | ✅ |
| `DB_NAME` | 資料庫名稱 | - | ✅ |
| `ENCRYPTION_KEY` | 加密金鑰(32位元組) | - | ✅ |
| `SEQ_URL` | Seq日誌伺服器URL | - | ❌ |
| `DEFAULT_ADMIN_ACCOUNT` | 預設管理員帳號 | `admin` | ❌ |
| `DEFAULT_ADMIN_PASSWORD` | 預設管理員密碼 | `admin` | ❌ |

### 安全配置建議

1. **JWT密鑰**: 使用強隨機字串
2. **加密金鑰**: 必須為32位元組長度
3. **資料庫密碼**: 使用強密碼
4. **預設帳號**: 生產環境應更改預設密碼

## 🐳 Docker 部署

### 使用 Docker Compose
```bash
# 啟動所有服務
docker-compose up -d

# 僅啟動資料庫和日誌服務
docker-compose up -d akashichub-db akashichub-seq

# 查看日誌
docker-compose logs -f akashichub-api
```

### 單獨使用 Docker
```bash
# 建立映像
docker build -t akashichub-api .

# 執行容器
docker run -d \
  --name akashichub-api \
  -p 3000:3000 \
  --env-file .env \
  akashichub-api
```

## 📊 日誌與監控

### 日誌系統
- **工具**: Winston + Seq
- **格式**: 結構化JSON日誌
- **等級**: error, warn, info, debug
- **存儲**: 控制台 + 遠端Seq伺服器

### 監控端點
- **健康檢查**: `GET /api/health`
- **系統狀態**: 回傳服務運行狀態

### Seq 日誌查看
如果配置了Seq伺服器，可透過以下地址查看日誌：
- **Seq UI**: `http://localhost:8081`

## 🔒 安全考量

### 已實施的安全措施
1. **JWT認證**: 無狀態Token認證
2. **密碼加密**: bcrypt雜湊存儲
3. **敏感資料加密**: AES-256-GCM加密
4. **輸入驗證**: 完整的請求驗證
5. **錯誤處理**: 不洩露敏感資訊
6. **CORS配置**: 適當的跨域設定

### 建議的額外安全措施
1. **Rate Limiting**: 防止API濫用
2. **HTTPS**: 使用TLS加密傳輸
3. **API Key管理**: 更細粒度的API存取控制
4. **審計日誌**: 記錄所有敏感操作
5. **定期密碼更新**: 強制定期更換密碼

## 🛠️ 維護指南

### 資料庫維護
```bash
# 備份資料庫
mysqldump -h localhost -u root -p akashichub_db > backup.sql

# 還原資料庫
mysql -h localhost -u root -p akashichub_db < backup.sql

# 重新初始化資料庫
npm run init-db
```

### 日誌維護
- 定期清理舊日誌檔案
- 監控Seq伺服器磁碟空間
- 設定日誌輪替機制

### 效能優化
- 資料庫索引優化
- 查詢語句效能調優
- 實施適當的快取策略

## 🤝 貢獻指南

### 開發流程
1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

### 程式碼規範
- 使用 ES6+ 語法
- 遵循 ESLint 配置
- 寫入單元測試
- 更新相關文檔

### 提交規範
- `feat:` 新功能
- `fix:` 錯誤修復
- `docs:` 文檔更新
- `test:` 測試相關
- `refactor:` 重構

## 📞 支援與協助

### 問題回報
- **GitHub Issues**: 提交錯誤報告和功能請求
- **Email**: support@akashichub.com

### 常見問題

**Q: 如何重設管理員密碼？**
A: 修改 `.env` 中的 `DEFAULT_ADMIN_PASSWORD` 後重新執行 `npm run init-db`

**Q: 如何新增新的資源類型？**
A: 修改 `middlewares/validation.js` 中的 `VALID_RESOURCE_TYPES` 陣列

**Q: 如何配置HTTPS？**
A: 建議使用反向代理（如Nginx）處理SSL終止

**Q: 如何擴展API功能？**
A: 在相應的controller中新增方法，並在routes中註冊路由

## 📄 授權條款

本專案使用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 🙏 致謝

感謝所有為此專案貢獻的開發者和使用者。

---

**AkashicHub Team** - 致力於打造高效的IT資源管理解決方案