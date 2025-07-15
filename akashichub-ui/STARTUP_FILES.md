# 前端專案啟動相關檔案清單

## 🚀 核心啟動檔案

### 1. 應用進入點
- **`public/index.html`** - HTML 模板檔案，包含 `<div id="app">` 容器
- **`src/main.ts`** - Vue 應用主要進入點，創建和掛載應用
- **`src/App.vue`** - 根組件，包含路由視圖和全域樣式

### 2. 配置檔案
- **`vite.config.ts`** - Vite 建置工具配置，包含開發服務器設定
- **`vite.config.test.ts`** - 測試用的簡化 Vite 配置
- **`package.json`** - 專案元數據和腳本命令
- **`tsconfig.json`** - TypeScript 配置

### 3. 環境配置檔案
- **`.env`** - 本地環境配置（包含敏感資訊，不提交到版本控制）
- **`.env.example`** - 環境配置範例模板
- **`.env.development`** - 開發環境專用配置
- **`.env.production`** - 生產環境專用配置

## 🔧 輔助工具和腳本

### 1. Windows 專用檔案
- **`start-dev.bat`** - Windows 批次檔，自動檢查和啟動開發服務器
- **`diagnose.js`** - 網絡診斷腳本，檢查端口和連接狀態

### 2. 測試和診斷檔案
- **`public/test.html`** - 靜態測試頁面，用於診斷連接問題
- **`vitest.config.ts`** - Vitest 測試配置
- **`cypress.config.ts`** - Cypress E2E 測試配置

### 3. 程式碼品質工具
- **`.gitignore`** - Git 忽略檔案列表
- **`auto-imports.d.ts`** - 自動導入的 TypeScript 類型定義
- **`components.d.ts`** - 組件的 TypeScript 類型定義

## 📋 啟動命令

### 開發環境啟動
```bash
# 標準開發模式
npm run dev

# 開發模式（明確指定）
npm run dev:development

# Windows 專用（解決網絡問題）
npm run dev:windows

# 使用 Windows 批次檔啟動
start-dev.bat

# 使用測試配置啟動
npm run dev:test
```

### 診斷和測試
```bash
# 運行網絡診斷
npm run diagnose

# 運行單元測試
npm test

# 運行 E2E 測試
npm run test:e2e
```

### 建置和部署
```bash
# 建置生產版本
npm run build

# 預覽建置結果
npm run preview

# 類型檢查
npm run type-check
```

## 🔍 檔案結構和依賴關係

```
啟動流程:
1. package.json (定義啟動腳本)
2. vite.config.ts (Vite 配置)
3. public/index.html (HTML 模板)
4. src/main.ts (Vue 應用進入點)
5. src/App.vue (根組件)
6. src/router/index.ts (路由配置)
7. src/stores/*.ts (狀態管理)
```

## 🛠️ 關鍵配置詳解

### Vite 開發服務器配置 (`vite.config.ts`)
```typescript
server: {
  port: 5173,                    // 服務器端口
  host: '0.0.0.0',              // 綁定所有網絡接口
  strictPort: true,             // 端口被佔用時失敗
  open: false,                  // 不自動打開瀏覽器
  cors: true,                   // 啟用跨域
  hmr: { port: 5174 }          // HMR 使用不同端口
}
```

### 環境變數配置
```bash
# 應用基本資訊
VITE_APP_TITLE=AkashicHub
VITE_APP_VERSION=1.0.0

# API 配置
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_BASE_URL=ws://localhost:3000

# 功能開關
VITE_ENABLE_DEVTOOLS=true
VITE_ENABLE_DEBUG=true
```

## 🐛 常見問題和解決方案

### 問題1: 瀏覽器無法訪問 localhost:5173
**解決方案**:
1. 使用 `start-dev.bat` 啟動
2. 嘗試訪問 `http://127.0.0.1:5173/`
3. 檢查 Windows 防火牆設定
4. 運行 `npm run diagnose` 進行診斷

### 問題2: 端口被佔用
**解決方案**:
```bash
# 查找佔用進程
netstat -ano | findstr :5173

# 終止進程
taskkill /PID <PID> /F
```

### 問題3: 依賴安裝失敗
**解決方案**:
```bash
# 清除快取重新安裝
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 🎯 測試和驗證

### 1. 靜態檔案測試
訪問 `http://localhost:5173/test.html` 進行連接測試

### 2. 主應用測試
訪問 `http://localhost:5173/` 載入主應用

### 3. API 測試
檢查 `/api` 端點的代理設定是否正常

## 📚 相關文檔

- `ENV_CONFIG.md` - 環境配置詳細說明
- `WINDOWS_TROUBLESHOOTING.md` - Windows 專用故障排除
- `README.md` - 專案總體說明
- `CLAUDE.md` - 專案架構和開發指南

## 🔒 安全注意事項

1. **`.env` 檔案不要提交到版本控制**
2. **生產環境必須更改預設金鑰**
3. **只有 `VITE_` 前綴的環境變數會暴露給客戶端**
4. **敏感配置應該在服務端管理**

## 🚀 快速啟動檢查清單

- [ ] Node.js 版本 >= 18.0.0
- [ ] npm 版本 >= 8.0.0
- [ ] 依賴已安裝 (`node_modules` 存在)
- [ ] 環境配置檔案已設定 (`.env`)
- [ ] 端口 5173 可用
- [ ] 防火牆允許 Node.js
- [ ] 網絡連接正常

執行 `start-dev.bat` 會自動檢查以上項目。