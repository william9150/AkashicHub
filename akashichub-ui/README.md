# AkashicHub Frontend

阿卡西資源管理系統的前端應用程式 - 用於企業內部IT資源的集中管理和檢索。

## 專案概述

AkashicHub 前端是一個現代化的Web應用程式，提供直觀的界面來管理伺服器、資料庫、網站等IT資源。系統支援角色權限管理、資源分類標籤、關係映射等功能。

## 技術棧

- **框架**: Vue.js 3 + Composition API
- **開發工具**: Vite
- **語言**: TypeScript
- **UI庫**: Element Plus
- **路由**: Vue Router 4
- **狀態管理**: Pinia
- **HTTP客戶端**: Axios
- **圖表**: ECharts
- **樣式**: SCSS
- **測試**: Vitest + Vue Test Utils

## 功能特色

### 🔐 認證與授權
- JWT Token認證
- 角色權限控制 (Admin/User)
- 路由守衛保護
- 自動登出機制

### 📋 資源管理
- 資源列表展示與分頁
- 資源詳情檢視
- 資源CRUD操作 (管理員)
- 密碼加密儲存與解密
- 資源關係映射

### 🏷️ 標籤系統
- 標籤分類管理
- 標籤與資源關聯
- 標籤篩選功能

### 👥 用戶管理
- 用戶列表管理 (管理員)
- 用戶資訊編輯
- 角色權限設定

### 🔍 搜尋與篩選
- 關鍵字搜尋
- 多條件篩選
- 標籤篩選
- 進階搜尋

### 📊 數據可視化
- 資源統計圖表
- 使用情況分析
- 系統狀態監控

## 專案結構

```
akashichub-ui/
├── public/                 # 靜態資源
│   ├── index.html         # HTML模板
│   └── favicon.ico        # 網站圖標
├── src/
│   ├── api/               # API接口定義
│   │   ├── auth.ts        # 認證相關API
│   │   ├── resources.ts   # 資源相關API
│   │   ├── tags.ts        # 標籤相關API
│   │   └── users.ts       # 用戶相關API
│   ├── components/        # 共用組件
│   │   ├── common/        # 通用組件
│   │   ├── forms/         # 表單組件
│   │   └── charts/        # 圖表組件
│   ├── composables/       # 組合式函數
│   │   ├── useAuth.ts     # 認證邏輯
│   │   ├── useApi.ts      # API請求邏輯
│   │   └── useTheme.ts    # 主題切換邏輯
│   ├── layouts/           # 版面配置
│   │   ├── Default.vue    # 預設佈局
│   │   └── Auth.vue       # 認證佈局
│   ├── plugins/           # 外掛配置
│   │   ├── element-plus.ts
│   │   └── echarts.ts
│   ├── router/            # 路由配置
│   │   ├── index.ts       # 路由定義
│   │   └── guards.ts      # 路由守衛
│   ├── stores/            # Pinia狀態管理
│   │   ├── auth.ts        # 認證狀態
│   │   ├── resources.ts   # 資源狀態
│   │   └── app.ts         # 全域狀態
│   ├── styles/            # 全域樣式
│   │   ├── variables.scss # SCSS變數
│   │   └── global.scss    # 全域樣式
│   ├── types/             # TypeScript類型定義
│   │   ├── api.ts         # API類型
│   │   ├── auth.ts        # 認證類型
│   │   └── resources.ts   # 資源類型
│   ├── utils/             # 工具函數
│   │   ├── request.ts     # HTTP請求配置
│   │   ├── auth.ts        # 認證工具
│   │   └── format.ts      # 格式化工具
│   ├── views/             # 頁面組件
│   │   ├── Auth/          # 認證頁面
│   │   ├── Dashboard/     # 儀表板
│   │   ├── Resources/     # 資源管理
│   │   ├── Tags/          # 標籤管理
│   │   └── Users/         # 用戶管理
│   ├── App.vue            # 根組件
│   └── main.ts            # 入口文件
├── tests/                 # 測試文件
│   ├── unit/             # 單元測試
│   └── e2e/              # E2E測試
├── package.json          # 依賴管理
├── vite.config.ts        # Vite配置
├── tsconfig.json         # TypeScript配置
└── README.md             # 專案說明
```

## 開發指令

### 安裝依賴
```bash
npm install
```

### 開發環境
```bash
# 啟動開發伺服器 (預設端口 5173)
npm run dev

# 使用特定環境配置
npm run dev:development
npm run dev:production
```

### 建置專案
```bash
# 建置生產版本
npm run build

# 建置並預覽
npm run build && npm run preview
```

### 測試
```bash
# 運行單元測試
npm run test

# 運行E2E測試
npm run test:e2e

# 測試覆蓋率
npm run test:coverage
```

### 代碼品質
```bash
# ESLint檢查
npm run lint

# 修復ESLint問題
npm run lint:fix

# 格式化代碼
npm run format
```

## 環境配置

### 開發環境 (.env.development)
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_TITLE=AkashicHub Development
```

### 生產環境 (.env.production)
```env
VITE_API_BASE_URL=https://api.akashichub.com/api
VITE_APP_TITLE=AkashicHub
```

## API整合

後端API端點：
- **認證**: `POST /api/auth/login`, `GET /api/auth/me`
- **資源**: `GET /api/resources`, `POST /api/resources`, `PUT /api/resources/:id`
- **標籤**: `GET /api/tags`, `POST /api/tags`, `PUT /api/tags/:id`
- **用戶**: `GET /api/admin/users`, `POST /api/admin/users`

API回應格式：
```json
{
  "success": true,
  "data": { ... },
  "error": { "code": "ERROR_CODE", "message": "錯誤訊息" }
}
```

## 權限管理

### 角色權限
- **Admin**: 完整系統管理權限
- **User**: 資源檢視權限

### 路由保護
```typescript
// 需要認證的路由
meta: { requiresAuth: true }

// 需要管理員權限的路由
meta: { requiresAuth: true, requiresAdmin: true }
```

## 主題配置

支援明暗主題切換：
- 自動偵測系統主題
- 手動主題切換
- 主題設定持久化

## 響應式設計

- **桌面端**: >= 1200px
- **平板端**: 768px - 1199px
- **手機端**: < 768px

## 瀏覽器支援

- Chrome >= 90
- Firefox >= 90
- Safari >= 14
- Edge >= 90

## 開發規範

### 代碼風格
- 使用 TypeScript 強型別
- 遵循 Vue 3 Composition API
- 採用 ESLint + Prettier 代碼規範

### 命名規則
- 組件: PascalCase (UserProfile.vue)
- 函數: camelCase (getUserInfo)
- 常數: UPPER_SNAKE_CASE (API_BASE_URL)
- 文件: kebab-case (user-profile.ts)

### Git提交規範
```
feat: 新增功能
fix: 修復問題
docs: 文檔更新
style: 代碼格式
refactor: 重構代碼
test: 測試相關
chore: 建置工具
```

## 部署

### Docker部署
```bash
# 建置Docker映像
docker build -t akashichub-ui .

# 運行容器
docker run -p 8080:80 akashichub-ui
```

### 手動部署
```bash
# 建置專案
npm run build

# 部署dist目錄到Web伺服器
```

## 故障排除

### 常見問題
1. **API請求失敗**: 檢查後端服務是否運行
2. **認證失效**: 清除本地儲存中的token
3. **樣式問題**: 確認Element Plus是否正確引入
4. **路由錯誤**: 檢查路由配置和權限設定

### 調試技巧
- 使用Vue DevTools檢查組件狀態
- 查看Network面板確認API請求
- 檢查Console錯誤訊息

## 參與貢獻

1. Fork專案
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟Pull Request

## 版本歷史

- **v1.0.0** - 初始版本
  - 基礎認證系統
  - 資源管理功能
  - 標籤系統
  - 用戶管理

## 授權條款

本專案採用 MIT 授權條款

## 聯絡方式

- 專案維護者: AkashicHub Team
- 問題回報: GitHub Issues
- 文檔: 專案Wiki

---

**注意**: 本專案僅供內部使用，請勿洩露敏感資訊。