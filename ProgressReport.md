# 阿卡西 (AkashicHub) 後端開發進度報告  
更新時間：2025-07-10  

---

## 1. 已完成項目
| 類別 | 內容 | 對應規格章節 |
|------|------|--------------|
| 專案骨架 | • Node.js 22 + Express 專案結構<br>• 模組化資料夾（config / controllers / routes / models / middlewares / utils / scripts） | 2.2 |
| Docker 化 | • `Dockerfile` 與 `docker-compose.yml`（含 db、seq、api 服務） | 2.1 / 6.3 |
| ORM / 資料庫 | • Sequelize 初始化<br>• **Users / Resources / Tags / ResourceTags / ResourceRelationships** 五張主要資料表 Model 定義 | 4.2 |
| 認證機制 | • `POST /api/auth/login` 登入<br>• `GET  /api/auth/me` 取得個人資訊<br>• JWT 簽發與 `authenticateToken` 中介軟體 | 5.2 |
| 使用者管理 | • **`/api/admin/users` CRUD API**<br>• **`authorizeAdmin` 中介軟體（Admin 權限驗證）** | 5.3 / 5.2 |
| 資源管理 API | • `GET  /api/resources` 列表（支援 keyword、分頁、tagIds 過濾）<br>• `POST /api/resources` 新增（含新舊標籤關聯 + RelatedResources）<br>• `GET  /api/resources/:id` 詳情<br>• `PUT  /api/resources/:id` 更新（同步 TagIds / RelatedResourceIds 差異）<br>• `DELETE /api/resources/:id` 刪除<br>• `POST /api/resources/:id/decrypt-password` 取得密碼 (AES-256-GCM) | 5.4 |
| 標籤管理 API | • `GET  /api/tags` 全查<br>• `POST /api/tags` 新增<br>• `PUT  /api/tags/:id` 更新<br>• `DELETE /api/tags/:id` 刪除 | 5.5 |
| 密碼加解密 | • `utils/crypto.js` AES-256-GCM + 32 bytes `ENCRYPTION_KEY` | 4.3 |
| Audit Log | • `utils/logger.js` 集成 Winston + Seq；記錄 User / Tag / Resource CRUD 與密碼解密行為 | 2.4 |
| 測試框架 | • 安裝 **Jest** + **Supertest**<br>• `jest.config.js` 基礎設定<br>• 範例 `tests/health.test.js` | 6.4 |
| 單元測試 | • Auth API 測試（登入成功 / 失敗） | 6.4 |
| 資源關聯 | • `ResourceRelationships` Model<br>• `POST / PUT /api/resources` 支援 `relatedResourceIds` 並批量維護關聯 | 5.4.3 |
| 初始化腳本 | • `scripts/init.js`：資料表同步＋預設管理員帳號建立 | 6.3 |

---

## 2. 進度評估
以規格書 **Sprint 1 ~ Sprint 2** 為基準：

- Sprint 1（基礎建設 / 認證）  
  ✅ **100 % 完成**

- Sprint 2（資源 CRUD / 登入頁前端）  
  ✅ **90 % 完成（後端）**  
  - 標籤 CRUD、資源 CRUD + 關聯 + 加密 + 差異更新 完成  
  - 剩餘：**單元測試**。

---

## 3. 尚待完成 & 下一步計畫

| 優先級 | 項目 | 說明 |
|--------|------|------|
| P1 | 單元測試 | 已完成 Auth API 測試；接續撰寫 User / Resource / Tag / Relationships 測試並確保 CI 綠燈 |
| ~~P1~~ | ~~Tag & Relationship 更新邏輯優化~~ | 已完成（同步邏輯已實作） |
| P2 | Service Layer 抽離 | 商業邏輯移至 `services/` |
| P2 | Env Schema 驗證 | 啟動時驗證必要環境變數 |
| P2 | Swagger / OpenAPI | 自動產生 API 文件 |

---

## 4. 下個 Sprint（預計 Sprint 3，07/08 ~ 07/20）工作清單
1. **撰寫單元測試並整合至 CI**  
2. ~~**完善 Tag 與 ResourceRelationship 差異更新邏輯**~~ *(已完成)*  
3. **重構 Controllers → Services（Auth & Resource 優先）**  
4. **Env 驗證 + Swagger 文件產生**

---

### 風險與注意事項
- **測試覆蓋率**：CI 擋板需設定最低覆蓋率門檻。  
- **日誌量**：Seq 磁碟用量需監控。  

---

> **結論**：Sprint 2 已完成主要後端功能與差異同步邏輯；接續將聚焦於測試、重構與文件，確保系統品質及維護性。
