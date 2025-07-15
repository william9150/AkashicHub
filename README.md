### **開發規格書：阿卡西 (AkashicHub) IT內部資源檢索系統**

- **文件版本:** v7.0 (完整版)
- **修訂日期:** 2025年6月26日
- **撰寫人:** Gemini

### **1. 專案概述**

### **1.1 專案背景與目標**

在現代化的 IT 維運中，技術資源（如伺服器、資料庫、應用程式網站）的數量與複雜性日益俱增。相關的連線資訊、設定文件、與彼此間的依賴關係，往往散落在不同人員的筆記、Excel 文件或口頭傳承中。這種分散式的管理方式導致了以下問題：

- **資訊不一致：** 資料更新不及時，導致連線失敗或設定錯誤。
- **查詢效率低下：** 當系統發生問題時，難以快速定位相關的所有資源。
- **交接困難：** 人員異動時，知識傳承存在巨大風險，重要資訊可能遺失。
- **安全性隱憂：** 敏感的帳號密碼缺乏統一且安全的管理機制。

本專案「**阿卡西 (AkashicHub)**」旨在解決上述痛點，建立一個集中、可視化、易於查詢的技術資源圖譜。

**核心目標：**

1. **集中化管理：** 將所有技術資源資訊統一儲存，確保資料的單一來源與一致性。
2. **關係圖譜化：** 建立資源間的關聯，讓使用者能清晰地看到「一個網站使用了哪些資料庫」或「一個資料庫運行在哪台伺服器上」。
3. **快速檢索：** 提供強大的關鍵字搜尋與多維度標籤過濾功能，讓使用者在數秒內找到所需資訊。
4. **提升安全性：** 透過權限控管與加密機制，保護敏感連線資訊的安全。
5. **可觀測性：** 透過結構化日誌與集中式管理平台，提供強大的系統監控與問題追蹤能力。

### **1.2 專案範圍**

**範圍內 (In-Scope):**

- 使用者身份驗證與角色權限管理（管理員、一般使用者）。
- 資源（伺服器、資料庫、網站等）的增、刪、改、查 (CRUD) 功能。
- 可分類的標籤系統，使用者可自訂標籤並為資源貼上多個標籤。
- 資源之間的關聯建立與查詢功能。
- 敏感密碼的加密儲存與授權查閱。
- 詳細的結構化操作日誌 (Audit Log)，記錄使用者操作與系統關鍵事件，並集中傳送至 Seq 進行管理與查詢。
- 系統使用 Docker Compose 進行容器化部署，並支援前後端獨立啟動。

**範圍外 (Out-of-Scope):**

- 自動化資源探測或監控功能。
- 與外部系統（如：AD網域）的帳號整合。
- 資源的備份、還原等實際維運操作。

### **1.3 技術棧**

- **前端:** Vue 3 (搭配 Vite、Vue Router、Pinia、**Bootstrap 5.3**)
- **後端:** **Node.js (v22.x)** + Express.js + ES Module
- **資料庫:** MySQL 8.x
- **ORM:** Sequelize
- **身份驗證:** JWT (JSON Web Tokens)
- **日誌管理:** Seq
- **部署:** Docker / Docker Compose

### **2. 系統架構**

### **2.1 架構總覽**

本系統採用經典的前後端分離架構，所有服務均運行在 Docker 容器中，透過 Docker Compose 統一管理。後端服務產生的所有日誌將以結構化格式發送到獨立的 Seq 容器中進行集中處理。

```bash
subgraph "使用者端"
        User[<img src='https://www.gstatic.com/images/icons/material/system/2x/person_black_48dp.png' width='40' /><br/>開發/維運人員]
    end

    subgraph "Docker 託管環境 (Docker Compose)"
        Nginx[Nginx<br/>(反向代理)]
        subgraph "前端服務 (akashichub-ui)"
            VueApp[Vue 3 SPA<br/>(Bootstrap 5.3)]
        end
        subgraph "後端服務 (akashichub-api)"
            API[<b>Node.js v22 / Express</b>]
        end
        subgraph "資料庫服務 (akashichub-db)"
            MySQL[(MySQL 8.x)]
        end
        subgraph "日誌服務 (akashichub-seq)"
            Seq[<img src='https://avatars.githubusercontent.com/u/4391962?s=200&v=4' width='40'/><br/><b>Seq Server</b>]
        end
    end

    User -- "HTTPS (Port 443)" --> Nginx
    User -- "HTTP (Port 8081)" --> Seq
    Nginx -- "服務靜態檔案" --> VueApp
    Nginx -- "/api/* 轉發" --> API
    API -- "讀寫資料" --> MySQL
    API -- "傳送結構化日誌 (HTTP)" --> Seq
```

### **2.2 後端架構 (Node.js / Express)**

採用模組化、分層的專案結構，將職責明確劃分：

- **`config/`**: 存放所有環境設定，如資料庫連線資訊、JWT 金鑰、Seq 伺服器位址等。
- **`routes/`**: 定義 API 路由。每個模組（如 `resources`, `users`, `auth`）有獨立的路由檔案。
- **`controllers/`**: 請求處理層。負責接收 HTTP 請求、驗證輸入、並呼叫對應的 `services`。
- **`services/`**: 業務邏輯層。處理核心應用邏輯，例如建立資源、處理關聯、加密密碼等。
- **`models/`**: 資料模型層。使用 **Sequelize** 定義資料庫的資料表結構 (Schema) 與關聯。
- **`middlewares/`**: 中介軟體層。存放可重用的中介軟體，如 JWT 驗證、權限檢查、請求日誌記錄器。
- **`utils/`**: 工具函式庫。存放共用的輔助函式，如密碼加密、API 回應格式化、日誌實例化等。
- **`tests/`**: **單元測試檔案。使用 Jest 針對 `controllers`, `services` 層的每個功能撰寫獨立的測試案例。**

### **2.3 前端架構 (Vue 3)**

- **UI 框架:** 整體視覺與元件將採用 **Bootstrap 5.3** 進行建構，確保響應式設計與跨裝置的一致性。將直接使用 Bootstrap 的 CSS class 或搭配如 `bootstrap-vue-next` 的整合套件。
- **狀態管理 (Pinia):**
    - `authStore`: 管理使用者登入狀態、Token、使用者資訊 (包含`loginAccount`與`displayName`)。
    - `resourceStore`: 管理資源列表、單一資源的狀態。
    - `tagStore`: 管理標籤快取。
- **路由管理 (Vue Router):**
    - `/login`: 登入頁。
    - `/dashboard`: 主儀表板，顯示所有資源。
    - `/resource/:id`: 顯示單一資源詳細資訊頁。
    - `/admin/*`: 管理員專用頁面（如：使用者管理）。
    - 使用路由守衛 (`beforeEach`) 檢查使用者是否登入，未登入者將被導向 `/login`。
- **API 通訊 (Axios):**
    - 建立一個 Axios 實例，並設定攔截器 (Interceptor)。
    - **請求攔截器:** 自動在每個請求的 Header 中附加 `Authorization: Bearer ${token}`。
    - **回應攔截器:** 統一處理 API 錯誤，例如遇到 401 (Unauthorized) 時，自動清除使用者狀態並導向登入頁。
- **測試 (Vitest):** **針對 Pinia stores 的 actions、mutations 以及重要的 Vue 元件進行單元測試，確保元件行為符合預期。**

### **2.4 日誌與稽核 (Logging and Auditing)**

採用 **結構化日誌 (Structured Logging)**，並使用 **Seq** 作為集中式日誌管理伺服器。

- **日誌函式庫:** 後端將使用 `winston` 搭配 `winston-seq` transport。
- **日誌內容範例:**
    
    ```json
    {
      "timestamp": "2025-06-26T11:50:00.123Z",
      "level": "info",
      "message": "User login successful",
      "service": "akashichub-api",
      "userId": 1,
      "loginAccount": "admin",
      "ipAddress": "192.168.1.100"
    }
    ```
    
- **稽核日誌 (Audit Log):**
    
    ```json
    {
      "timestamp": "2025-06-26T11:55:00.456Z",
      "level": "info",
      "message": "Resource 'LISWEB' updated by 'admin'",
      "service": "akashichub-api",
      "action": "UPDATE_RESOURCE",
      "userId": 1,
      "resourceId": 5,
      "changes": {
        "ipAddress": { "old": "10.0.0.1", "new": "10.0.0.2" }
      }
    }
    ```
    
- **查詢與告警:** 維運人員可直接透過 Seq 的 Web UI，對這些結構化日誌進行快速的搜尋、過濾、建立儀表板與設定告警規則。

### **3. 功能需求與使用者故事**

### **3.1 角色定義**

- **管理員 (Admin):** 擁有系統所有權限，包含使用者管理與資源管理。
- **一般使用者 (User):** 擁有查詢所有資源的權限，可新增標籤，但不可新增/修改/刪除資源。

### **3.2 使用者故事 (User Stories)**

- **作為一個 `使用者`，我想要** 使用我的「登入帳號」與密碼登入系統，**以便** 我可以開始查詢資源。
- **作為一個 `使用者`，我想要** 在系統介面的右上角看到我的「用戶名稱」，**以便** 確認我目前的登入身份。
- **作為一個 `使用者`，我想要** 在儀表板上看到所有資源的列表，**以便** 我可以快速瀏覽。
- **作為一個 `使用者`，我想要** 使用關鍵字搜尋資源，**以便** 我能快速找到特定名稱或IP的資源。
- **作為一個 `管理員`，我想要** 新增、修改和刪除資源，**以便** 我能隨時保持資訊的正確性。
- **作為一個 `管理員`，我想要** 新增使用者時，分別設定其唯一的「登入帳號」與可重複的「用戶名稱」，**以便** 兼顧系統登入的唯一性與顯示上的彈性。
- **作為一個 `管理員`，我想要** 查看系統稽核日誌，了解是哪個「登入帳號」在何時執行了哪些操作，**以便** 進行安全追蹤。

### **4. 資料庫設計**

### **4.1 實體關係圖 (ER Diagram)**

- 程式碼片段
    
    ```jsx
        Users {
            int Id PK
            varchar LoginAccount UK "唯一登入帳號"
            varchar DisplayName "顯示名稱"
            varchar PasswordHash
            varchar Role
        }
    
        Resources {
            int Id PK
            varchar ResourceType
            varchar Name
            varchar IpAddress
            varchar LoginUser
            varchar LoginPasswordEncrypted
            text Description
        }
    
        Tags {
            int Id PK
            varchar Name
            varchar Category
        }
    
        ResourceTags {
            int ResourceId PK, FK
            int TagId PK, FK
        }
    
        ResourceRelationships {
            int SourceResourceId PK, FK
            int TargetResourceId PK, FK
            varchar RelationshipType
        }
    
        Users ||--o{ Resources : "Manages"
        Resources ||--|{ ResourceTags : "has"
        Tags ||--|{ ResourceTags : "is on"
        Resources }o--o{ ResourceRelationships : "links to"
    ```
    

### **4.2 資料表詳解**

- **Users (使用者表)**
    - `Id`: 主鍵。
    - `LoginAccount`: **登入帳號**，用於身份驗證，必須**唯一 (Unique)**。
    - `DisplayName`: **用戶名稱**，用於在前端介面顯示，**不需唯一**。
    - `PasswordHash`: 使用 BCrypt 演算法雜湊後的密碼。
    - `Role`: 角色 ('Admin', 'User')。
- **Resources (資源總表)**
    - `Id`: 主鍵。
    - `ResourceType`: 主要類型 (e.g., 'Database', 'Website')。
    - `Name`: 資源的自訂名稱，用於顯示與搜尋。
    - `LoginPasswordEncrypted`: 使用對稱加密 (如 AES-256-GCM) 加密的密碼。
- **Tags (標籤表)**
    - `Id`: 主鍵。
    - `Name`: 標籤名稱 (e.g., '台中', 'HCLAB')。
    - `Category`: 標籤分類 (e.g., '使用區域', '用途')。
- **ResourceTags (多對多關聯表)**
    - 記錄哪個資源 (`ResourceId`) 擁有哪個標籤 (`TagId`)。
- **ResourceRelationships (多對多關聯表)**
    - `SourceResourceId`: 來源資源 ID。
    - `TargetResourceId`: 目標資源 ID。
    - `RelationshipType`: 描述關聯類型 (e.g., '使用 (uses)')。

### **5. API 規格**

### **5.1 通用原則**

- **基礎路徑 (Base Path):** 所有 API 端點皆以 `/api` 為前綴。例如：`https://your-domain.com/api/auth/login`。
- **身份驗證 (Authentication):** 除公開端點（如登入）外，所有請求都必須在 HTTP Header 中包含有效的 JWT Token。
    - 格式: `Authorization: Bearer <your_jwt_token>`
- **標準成功回應 (Standard Success Response):**
    - `200 OK`: 請求成功，適用於 `GET` 與 `PUT`。
    - `201 Created`: 資源建立成功，適用於 `POST`。
    - `204 No Content`: 請求成功但無回傳內容，適用於 `DELETE`。
    - 成功時的回應主體格式：
        
        ```json
        {
          "success": true,
          "data": { ... } // GET, PUT, POST
        }
        // 或
        {
          "success": true,
          "message": "Operation successful." // POST, PUT, DELETE
        }
        ```
        
- **標準錯誤回應 (Standard Error Response):**
    - `400 Bad Request`: 請求無效（例如：欄位缺失、格式錯誤）。
    - `401 Unauthorized`: 未提供 Token 或 Token 無效。
    - `403 Forbidden`: 使用者權限不足。
    - `404 Not Found`: 請求的資源不存在。
    - `409 Conflict`: 資源衝突（例如：建立已存在的唯一帳號）。
    - `500 Internal Server Error`: 伺服器內部錯誤。
    - 錯誤時的回應主體格式：
        
        ```json
        {
          "success": false,
          "error": {
            "code": "VALIDATION_ERROR", // 錯誤代碼
            "message": "Required fields are missing." // 錯誤訊息
          }
        }
        ```
        

### **5.2 身份驗證 (Authentication) - `/api/auth`**

### **5.2.1 使用者登入**

- **Endpoint:** `POST /api/auth/login`
- **描述:** 使用「登入帳號」和密碼進行身份驗證，成功後回傳 JWT Token。
- **權限:** `Public`
- **請求主體 (Request Body):**
    
    ```json
    {
      "loginAccount": "admin",
      "password": "your_password"
    }
    ```
    
- **成功回應 (200 OK):**
    
    ```json
    {
      "success": true,
      "data": {
        "token": "ey...",
        "displayName": "系統管理員",
        "role": "Admin"
      }
    }
    ```
    

### **5.2.2 取得當前使用者資訊**

- **Endpoint:** `GET /api/auth/me`
- **描述:** 驗證 Header 中的 Token，並回傳該使用者的個人資訊。
- **權限:** `User` / `Admin`
- **成功回應 (200 OK):**
    
    ```json
    {
      "success": true,
      "data": {
        "id": 1,
        "loginAccount": "admin",
        "displayName": "系統管理員",
        "role": "Admin"
      }
    }
    ```
    

### **5.3 使用者管理 (User Management) - `/api/admin/users`**

### **5.3.1 取得所有使用者列表**

- **Endpoint:** `GET /api/admin/users`
- **描述:** 取得系統內所有使用者的列表。
- **權限:** `Admin`
- **成功回應 (200 OK):**
    
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "loginAccount": "admin",
          "displayName": "系統管理員",
          "role": "Admin"
        },
        {
          "id": 2,
          "loginAccount": "user01",
          "displayName": "開發人員A",
          "role": "User"
        }
      ]
    }
    ```
    

### **5.3.2 新增使用者**

- **Endpoint:** `POST /api/admin/users`
- **描述:** 建立一個新的使用者帳號。
- **權限:** `Admin`
- **請求主體 (Request Body):**
    
    ```json
    {
      "loginAccount": "user02",
      "displayName": "維運人員B",
      "password": "new_strong_password",
      "role": "User"
    }
    ```
    
- **成功回應 (201 Created):**
    
    ```json
    {
      "success": true,
      "data": {
        "id": 3,
        "loginAccount": "user02",
        "displayName": "維運人員B",
        "role": "User"
      }
    }
    ```
    

### **5.3.3 更新使用者資訊**

- **Endpoint:** `PUT /api/admin/users/{id}`
- **描述:** 更新指定 ID 使用者的資訊（`displayName` 或 `role`）。
- **權限:** `Admin`
- **請求主體 (Request Body):**
    
    ```json
    {
      "displayName": "資深維運人員B",
      "role": "Admin"
    }
    ```
    
- **成功回應 (200 OK):**
    
    ```json
    {
      "success": true,
      "message": "User updated successfully."
    }
    ```
    

### **5.3.4 刪除使用者**

- **Endpoint:** `DELETE /api/admin/users/{id}`
- **描述:** 刪除指定 ID 的使用者。
- **權限:** `Admin`
- **成功回應 (204 No Content):** (無回應主體)

### **5.4 資源管理 (Resource Management) - `/api/resources`**

### **5.4.1 取得資源列表 (含篩選)**

- **Endpoint:** `GET /api/resources`
- **描述:** 取得所有資源，並支援關鍵字搜尋與標籤過濾。
- **權限:** `User` / `Admin`
- **查詢參數 (Query Parameters):**
    - `keyword` (string, optional): 關鍵字，用於搜尋資源的 `Name`, `IpAddress` 等欄位。
    - `tagIds` (string, optional): 逗號分隔的標籤 ID (e.g., `1,5,10`)。
    - `page` (number, optional, default: 1): 頁碼。
    - `limit` (number, optional, default: 20): 每頁筆數。
- **成功回應 (200 OK):**
    
    ```json
    {
      "success": true,
      "data": {
        "items": [
          {
            "id": 1,
            "resourceType": "Website",
            "name": "LISWEB",
            "ipAddress": "192.168.1.10",
            "tags": [
              { "id": 10, "name": "台中", "category": "使用區域" }
            ]
          }
        ],
        "total": 1,
        "page": 1,
        "limit": 20
      }
    }
    ```
    

### **5.4.2 新增資源**

- **Endpoint:** `POST /api/resources`
- **描述:** 建立一筆新的資源，並可同時關聯既有標籤、新增標籤、關聯其他資源。
- **權限:** `Admin`
- **請求主體 (Request Body):**
    
    ```json
    {
      "resourceType": "Database",
      "name": "ERP_DB_Backup",
      "ipAddress": "192.168.5.20",
      "loginUser": "sa",
      "loginPassword": "PlainPassword123",
      "description": "ERP 資料庫備份機",
      "port": 1433,
      "dbName": "ERP_BAK",
      "dbVersion": "SQL Server 2019",
      "tagIds": [10, 22], // 關聯已存在的標籤 ID
      "newTags": [ // 同時新增並關聯新標籤
        { "name": "ERP", "category": "用途" }
      ],
      "relatedResourceIds": [5] // 關聯已存在的資源 ID
    }
    ```
    
- **成功回應 (201 Created):**
    
    ```json
    {
      "success": true,
      "data": {
        "id": 101,
        // ... 回傳新建資源的完整資訊 ...
      }
    }
    ```
    

### **5.4.3 取得單一資源詳情**

- **Endpoint:** `GET /api/resources/{id}`
- **描述:** 取得指定 ID 資源的完整資訊，包含其標籤與關聯資源。
- **權限:** `User` / `Admin`
- **成功回應 (200 OK):**
    
    ```json
    {
      "success": true,
      "data": {
        "id": 1,
        "resourceType": "Website",
        "name": "LISWEB",
        // ...其他欄位...
        "tags": [
          { "id": 10, "name": "台中", "category": "使用區域" }
        ],
        "relatedResources": [
          {
            "resourceId": 5,
            "name": "LIS_DB",
            "resourceType": "Database",
            "relationshipType": "使用"
          }
        ]
      }
    }
    ```
    

### **5.4.4 更新資源**

- **Endpoint:** `PUT /api/resources/{id}`
- **描述:** 更新指定 ID 資源的資訊。請求主體格式與新增資源時相同。
- **權限:** `Admin`
- **成功回應 (200 OK):**
    
    ```json
    {
      "success": true,
      "message": "Resource updated successfully."
    }
    ```
    

### **5.4.5 刪除資源**

- **Endpoint:** `DELETE /api/resources/{id}`
- **描述:** 刪除指定 ID 的資源。
- **權限:** `Admin`
- **成功回應 (204 No Content):** (無回應主體)

### **5.4.6 解密並取得資源密碼**

- **Endpoint:** `POST /api/resources/{id}/decrypt-password`
- **描述:** 請求解密並回傳指定資源的密碼。此操作會被詳細稽核。
- **權限:** `User` / `Admin`
- **成功回應 (200 OK):**
    
    ```json
    {
      "success": true,
      "data": {
        "plainPassword": "PlainPassword123"
      }
    }
    ```
    

### **5.5 標籤管理 (Tag Management) - `/api/tags`**

### **5.5.1 取得所有標籤**

- **Endpoint:** `GET /api/tags`
- **描述:** 取得所有已建立的標籤，可用於前端的標籤選擇器。
- **權限:** `User` / `Admin`
- **查詢參數 (Query Parameters):**
    - `category` (string, optional): 依照分類篩選標籤。
- **成功回應 (200 OK):**
    
    ```json
    {
      "success": true,
      "data": [
        { "id": 10, "name": "台中", "category": "使用區域" },
        { "id": 11, "name": "台北", "category": "使用區域" },
        { "id": 22, "name": "ERP", "category": "用途" }
      ]
    }
    ```
    

### **5.5.2 新增標籤**

- **Endpoint:** `POST /api/tags`
- **描述:** 獨立建立一個新的標籤 (通常由管理員操作)。
- **權限:** `Admin`
- **請求主體 (Request Body):**
    
    ```json
    {
      "name": "測試環境",
      "category": "環境"
    }
    ```
    
- **成功回應 (201 Created):**
    
    ```json
    {
      "success": true,
      "data": {
        "id": 50,
        "name": "測試環境",
        "category": "環境"
      }
    }
    ```
    

### **5.5.3 更新標籤**

- **Endpoint:** `PUT /api/tags/{id}`
- **描述:** 更新指定 ID 標籤的名稱或分類。
- **權限:** `Admin`
- **成功回應 (200 OK):**
    
    ```json
    {
        "success": true,
        "message": "Tag updated successfully."
    }
    ```
    

### **5.5.4 刪除標籤**

- **Endpoint:** `DELETE /api/tags/{id}`
- **描述:** 刪除一個標籤。注意：需處理與該標籤的關聯。
- **權限:** `Admin`
- **成功回應 (204 No Content):** (無回應主體)

### **6. 部署方案**

### **6.1 開發環境設定 (Development Workflow)**

**為提升開發效率與便利性，開發階段採用混合模式：**

1. **啟動核心依賴服務:**在專案根目錄，僅啟動資料庫 (MySQL) 與日誌伺服器 (Seq) 的 Docker 容器。指令：`docker-compose up -d akashichub-db akashichub-seq`
2. **啟動後端應用 (本地):**進入後端專案目錄 (例如 `akashichub-api/`)。
    - 複製 `.env.example` 為 `.env` 並填入正確設定 (資料庫應指向 `localhost` 或 `127.0.0.1`)。
    - 執行 `npm install` 安裝依賴。
    - 執行 `npm run dev` 啟動服務。此模式通常會啟用熱重載 (Hot-Reloading)，方便即時查看程式碼變更。**
3. **啟動前端應用 (本地):**進入前端專案目錄 (例如 `akashichub-ui/`)。
    - 執行 `npm install` 安裝依賴。
    - 執行 `npm run dev` 啟動 Vite 開發伺服器。**前端開發伺服器會自動代理 `/api` 請求至後端本地運行的服務。**

**此工作流程讓開發者能享受本地開發的便利性（如 Hot-Reload、Debugger），同時又能確保資料庫與日誌服務的一致性。**

### **6.2 環境變數與設定檔 (`.env.example`)**

**專案根目錄將提供 `.env.example` 檔案，作為開發者建立個人 `.env` 設定檔的範本。內容如下：**

```
# .env.example
# 複製此檔案為 .env 並填入您的本機開發設定

# ---------------------------------
# 後端 (akashichub-api) 環境變數
# ---------------------------------
# 應用程式設定
NODE_ENV=development
PORT=3000

# JWT 金鑰 (請使用更複雜的隨機字串)
JWT_SECRET=your-super-secret-key-for-jwt
JWT_EXPIRES_IN=7d

# 資料庫連線資訊 (開發模式下，主機應指向 localhost 或 127.0.0.1)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=akashic_user
DB_PASSWORD=akashic_password
DB_NAME=akashichub_db

# 密碼學加密金鑰 (用於加密資源密碼，必須為 32 位元組的字串)
ENCRYPTION_KEY=a-very-secret-32-byte-long-key!

# Seq 日誌伺服器連線資訊
# 注意：若後端在 Docker 外運行，主機應指向 localhost 或 127.0.0.1
SEQ_URL=http://localhost:5341
# SEQ_API_KEY=(可選，如果您的 Seq 有設定)

# 系統首次啟動時，自動建立的預設管理員帳號
DEFAULT_ADMIN_ACCOUNT=admin
DEFAULT_ADMIN_PASSWORD=admin

# ---------------------------------
# Docker Compose 專用變數
# ---------------------------------
# MySQL Root 密碼 (Docker 容器初始化時使用)
MYSQL_ROOT_PASSWORD=a_strong_root_password

# Seq EULA (必須設為 Y)
SEQ_ACCEPT_EULA=Y
```

### **6.3 容器化部署方案 (Docker Compose)**

`docker-compose.yml` 檔案將作為**生產環境或完整模擬環境**部署的單一入口點，透過 `docker-compose -p akashic up -d` 指令即可啟動整個應用程式。

- **`akashichub-api` (後端):**
    - **Dockerfile:** 採用多階段建置 (Multi-stage build)，先在 build 環境中安裝所有依賴，再將產出複製到輕量的 production 環境中，以縮小映像檔體積。
    - **資料庫初始化與預設帳號:**
        - 後端應用程式啟動時，將執行一段初始化腳本。
        - 該腳本首先會呼叫 Sequelize 的 `sync()` 方法，自動檢查並建立資料庫中尚不存在的資料表。
        - 在資料表建立後，腳本會進一步**檢查預設管理員帳號是否存在**。
        - 它會讀取環境變數 `DEFAULT_ADMIN_ACCOUNT` 和 `DEFAULT_ADMIN_PASSWORD`。
        - 如果資料庫中不存在以此 `loginAccount` 命名的使用者，系統將使用這些環境變數的值，自動建立一筆具備 `Admin` 角色的預設使用者，其密碼將經過雜湊處理後存入資料庫。**此舉確保系統首次部署後即可登入使用。**
    - **環境變數:** 包含資料庫連線字串、JWT 金鑰、`SEQ_URL=http://akashichub-seq:5341`，以及新增的 `DEFAULT_ADMIN_ACCOUNT` 和 `DEFAULT_ADMIN_PASSWORD`。
- **`akashichub-ui` (前端):**
    - 使用多階段建置，最終將打包好的靜態檔案 (`dist` 目錄) 複製到 Nginx 官方映像檔中提供服務。
    - Nginx 同時作為反向代理，將 `/api` 路徑的請求轉發到後端服務 `akashichub-api`。
- **`akashichub-db` (資料庫):**
    - 使用官方 MySQL 8.x 映像檔。
    - 在 `docker-compose.yml` 中設定 `MYSQL_DATABASE=akashichub_db` 環境變數，容器在首次啟動時會**自動建立該資料庫**。
    - 透過 `volumes` 將資料庫檔案掛載到主機上，確保資料持久化。
- **`akashichub-seq` (日誌伺服器):**
    - 使用 `datalust/seq:latest` 官方映像檔。
    - **環境變數:** 必須設定 `ACCEPT_EULA=Y`。
    - **連接埠 (Ports):**
        - `8081:80` (Web UI)
        - `5341:5341` (日誌接收端點)
    - **儲存 (Volumes):** 透過 `volumes` 將 Seq 的資料目錄 (`/data`) 掛載到主機上，確保日誌與設定持久化。

### **7. 專案時程規劃 (預估)**

### **7.1 開發方法論**

本專案將採用 **敏捷開發 (Agile Development)** 中的 **Scrum** 框架。開發週期將被劃分為數個為期**兩週**的 **Sprint (衝刺)**。每個 Sprint 開始時會舉行規劃會議，確定該週期的工作目標 (Sprint Backlog)；結束時會進行成果展示 (Sprint Review) 與團隊回顧 (Sprint Retrospective)

品質保證：每個功能開發任務都必須伴隨對應的單元測試。所有單元測試必須通過，才能被視為「完成」(Done)，並合併到主開發分支。這確保了每個階段的功能都正常，才能進入下一個 Sprint。

### **7.2 關鍵里程碑**

1. **Phase 1 - 基礎建設 (Sprint 1):** 完成開發環境、部署架構與核心認證功能。
2. **Phase 2 - 核心功能開發 (Sprint 2-4):** 完成所有主要的 CRUD 功能與前後端畫面串接。
3. **Phase 3 - 整合與優化 (Sprint 5):** 進行端對端測試、效能調校與細部功能完善。
4. **Phase 4 - 部署與交付 (Sprint 6):** 完成最終測試、文件撰寫並正式部署上線。

### **7.3 詳細 Sprint 規劃**

---

**Sprint 1: 專案啟動與基礎建設 (第 1-2 週)**

- **主要目標:** 搭建完整的開發與部署環境，完成使用者身份驗證的核心邏輯，並確保日誌系統正常運作。
- **後端任務:**
    - 建立 Node.js (v22) + Express 專案結構。
    - 設定 Docker 與 Docker Compose，包含 `api`, `ui`, `db`, `seq` 四個服務。
    - 整合 Sequelize ORM，定義 `Users` 資料模型。
    - **實作資料庫初始化邏輯（自動同步資料表、建立預設管理員帳號）及單元測試。**
    - **實作使用者登入 API (`POST /api/auth/login`) 及單元測試。**
    - **實作 JWT 簽發與驗證中介軟體及單元測試。**
    - 整合 Winston 與 Seq，確保 API 請求能被記錄。
- **前端任務:**
    - 建立 Vue 3 + Vite 專案。
    - 整合 Bootstrap 5.3。
    - 設定 Vue Router 與 Pinia 狀態管理。
    - 建立 Axios 實例，並設定請求/回應攔截器。
    - 建立基本的專案佈局 (Layout) 元件。
- **交付成果:**
    - 一個可依循 **開發工作流程** (本地啟動) 或 **容器化部署** (`docker-compose up`) 的專案。
    - 可用的使用者登入 API，並附帶單元測試。
    - 後端產生的日誌成功發送到 Seq 儀表板。
    - 包含預設值的 `.env.example` 檔案。

---

**Sprint 2: 核心資源管理 (第 3-4 週)**

- **主要目標:** 完成資源 (Resource) 的後端 CRUD API，並在前端建立對應的登入頁面與資源主儀表板。
- **後端任務:**
    - 定義 `Resources`, `Tags`, `ResourceTags` 等資料模型及關聯。
    - **開發 `GET /api/resources` (列表查詢) API 及單元測試。**
    - **開發 `POST /api/resources` (新增資源) API 及單元測試。**
    - **開發 `GET /api/tags` (讀取標籤) API 及單元測試。**
    - 在新增資源時，處理標籤的關聯邏輯。
- **前端任務:**
    - 完成登入頁面 UI 與 API 串接。
    - **實作 `authStore` 的登入/登出 actions 及單元測試。**
    - 建立主儀表板頁面 (`/dashboard`)，顯示資源列表。
    - 串接 `GET /api/resources` API，將資源資料渲染於表格中。
    - 建立資源列表的搜尋框與分頁元件。
- **交付成果:**
    - 使用者可以登入系統。
    - 登入後，使用者可以在主儀表板上看到所有資源的列表。
    - 可以透過後端 API 新增資源與查詢列表，且功能有單元測試覆蓋。

---

**Sprint 3: 關聯與篩選功能 (第 5-6 週)**

- **主要目標:** 豐富資源管理的深度，加入資源間關聯與標籤篩選功能。
- **後端任務:**
    - 定義 `ResourceRelationships` 資料模型。
    - **開發 `PUT /api/resources/{id}` (更新資源) API 及單元測試。**
    - 在更新資源時，處理 `relatedResourceIds` 的關聯邏輯。
    - **修改 `GET /api/resources/{id}` API，使其回傳關聯的資源與標籤，並更新單元測試。**
    - **實作 `GET /api/resources` 的 `tagIds` 篩選功能及單元測試。**
- **前端任務:**
    - 在主儀表板上新增標籤雲或標籤篩選器。
    - 點擊標籤後，前端呼叫 API 時需帶上 `tagIds` 參數以過濾資源列表。
    - 建立資源詳情頁 (`/resource/:id`) 的基本框架。
    - 在詳情頁中串接 API，顯示資源的基本資料。
- **交付成果:**
    - 使用者可以在主儀表板上透過點擊標籤來篩選資源。
    - 可以在後端建立/更新資源之間的依賴關係。
    - 點擊單一資源可以跳轉至其詳情頁。

---

**Sprint 4: 詳情頁與管理功能 (第 7-8 週)**

- **主要目標:** 完善資源詳情頁的資訊呈現，並完成所有管理員的編輯功能。
- **後端任務:**
    - **開發 `DELETE /api/resources/{id}` (刪除資源) API 及單元測試。**
    - **開發 `/api/admin/users` 的完整 CRUD API 及對應單元測試。**
    - **開發 `/api/tags` 的新增/更新/刪除 API 及單元測試。**
    - **開發 `/api/resources/{id}/decrypt-password` API 及單元測試。**
- **前端任務:**
    - 在資源詳情頁中，完整顯示其關聯的其他資源與所有標籤。
    - (Admin) 建立資源新增/編輯的表單頁面 (Modal 或獨立頁面)，串接 API。
    - (Admin) 建立使用者管理頁面，串接使用者管理的 CRUD API。
    - 實作點擊「顯示密碼」按鈕後，呼叫解密 API 並顯示明文密碼的功能。
- **交付成果:**
    - 功能完整的資源詳情頁。
    - 管理員擁有新增、修改、刪除任何資源、使用者與標籤的完整權限與操作介面。
    - 所有核心後端 API 均有單元測試覆蓋。

---

**Sprint 5: 整合測試與優化 (第 9 週)**

- **主要目標:** 進行全面的端對端測試，修復 Bug，並根據內部回饋進行使用者體驗 (UX) 優化。
- **後端任務:**
    - 審查並優化資料庫查詢效能 (N+1 問題)。
    - 細化稽核日誌 (Audit Log) 的內容，確保所有關鍵操作都有詳細記錄。
    - API 壓力測試 (可選)。
- **前端任務:**
    - 修復各頁面的 Bug 與樣式問題。
    - 優化表單驗證與錯誤提示訊息。
    - 確保在不同裝置上的響應式佈局表現正常。
- **交付成果:**
    - 一個功能穩定、錯誤率低、核心流程順暢的應用程式版本。
    - 一份內部測試回饋與 Bug 列表。

---

**Sprint 6: 最終部署與文件交付 (第 10 週)**

- **主要目標:** 修復所有已知問題，完善專案文件，並完成正式環境的部署。
- **任務:**
    - 修復 Sprint 5 發現的所有重大 Bug。
    - 撰寫或完善 `README.md`，說明如何部署與設定專案。
    - 撰寫簡易的使用者操作手冊與管理員手冊。
    - 準備生產環境的 `.env` 檔案與 `docker-compose.prod.yml` (如果需要)。
    - 執行正式部署流程，並進行最終驗收測試 (UAT)。
- **交付成果:**
    - 正式上線的 AkashicHub 系統。
    - 完整的專案原始碼。
    - 部署與操作說明文件。