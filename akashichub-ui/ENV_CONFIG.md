# 環境配置說明

## 環境配置文件說明

### 文件用途

#### 1. `.env.development`
- **用途**: 開發環境專用配置
- **使用時機**: 執行 `npm run dev` 或 `npm run dev:development` 時自動加載
- **特點**: 
  - 啟用開發者工具
  - 啟用性能監控
  - 啟用調試功能
  - API指向本地開發服務器

#### 2. `.env.production`
- **用途**: 生產環境專用配置
- **使用時機**: 執行 `npm run build` 或部署到生產環境時使用
- **特點**:
  - 關閉所有調試功能
  - 優化性能設置
  - 使用相對路徑API
  - 啟用安全配置

#### 3. `.env`
- **用途**: 本地個人配置，包含敏感信息
- **使用時機**: 所有環境的基礎配置，優先級最高
- **注意**: 此文件包含敏感信息，**不應提交到版本控制**

#### 4. `.env.example`
- **用途**: 環境配置範例模板
- **使用時機**: 新開發者參考，了解需要配置哪些環境變數
- **注意**: 不包含真實敏感信息，可以安全提交到版本控制

## 配置優先級

Vite 環境變數加載優先級（從高到低）：
1. `.env.local` (本地覆蓋，所有環境)
2. `.env.[mode].local` (本地覆蓋，特定環境)
3. `.env.[mode]` (特定環境)
4. `.env` (所有環境)

## 主要配置項說明

### 應用配置
```bash
VITE_APP_TITLE=AkashicHub              # 應用標題
VITE_APP_VERSION=1.0.0                 # 應用版本
VITE_APP_DESCRIPTION=IT內部資源檢索系統  # 應用描述
```

### API配置
```bash
VITE_API_BASE_URL=http://localhost:3000/api  # API 基礎URL
VITE_WS_BASE_URL=ws://localhost:3000         # WebSocket URL
```

### 功能開關
```bash
VITE_ENABLE_MOCK=false          # 是否啟用Mock數據
VITE_ENABLE_DEVTOOLS=true       # 是否啟用開發者工具
VITE_SHOW_PERFORMANCE=true      # 是否顯示性能監控
VITE_ENABLE_DEBUG=true          # 是否啟用調試模式
```

### 系統配置
```bash
VITE_DEFAULT_LANGUAGE=zh-TW     # 默認語言
VITE_DEFAULT_THEME=light        # 默認主題
VITE_PAGE_SIZE=20               # 分頁大小
```

## 使用方法

### 1. 初始設置
```bash
# 複製範例文件
cp .env.example .env

# 編輯 .env 文件，填入實際值
nano .env
```

### 2. 在代碼中使用
```typescript
// 在 Vue 組件或 TypeScript 文件中使用
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const appTitle = import.meta.env.VITE_APP_TITLE
const isDebug = import.meta.env.VITE_ENABLE_DEBUG === 'true'
```

### 3. 添加新的環境變數
1. 在相應的 `.env.*` 文件中添加變數（必須以 `VITE_` 開頭）
2. 更新 `.env.example` 文件
3. 在 `src/types/env.d.ts` 中添加類型定義（如果需要）

## 安全注意事項

### ⚠️ 重要安全提醒
1. **永不提交 `.env` 文件** - 包含敏感信息
2. **生產環境必須更改默認密鑰** - 更改 `VITE_ENCRYPTION_KEY` 和 `VITE_JWT_SECRET`
3. **僅暴露必要的環境變數** - 只有以 `VITE_` 開頭的變數才會暴露給客戶端
4. **敏感配置放在服務端** - 真正的密鑰和敏感配置應該在後端管理

### 建議的生產環境配置方法
```bash
# 在服務器上設置環境變數
export VITE_API_BASE_URL=https://your-api-domain.com/api
export VITE_WS_BASE_URL=wss://your-ws-domain.com

# 或使用 Docker 環境變數
docker run -e VITE_API_BASE_URL=https://api.example.com/api your-app
```

## 故障排除

### 常見問題

1. **環境變數不生效**
   - 檢查變數名是否以 `VITE_` 開頭
   - 重啟開發服務器
   - 檢查文件編碼（UTF-8）

2. **API請求失敗**
   - 檢查 `VITE_API_BASE_URL` 配置
   - 確認後端服務是否運行
   - 檢查網絡連接和防火牆設置

3. **開發工具不顯示**
   - 檢查 `VITE_ENABLE_DEVTOOLS` 是否為 `true`
   - 確認是開發環境模式