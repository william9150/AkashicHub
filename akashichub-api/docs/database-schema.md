# AkashicHub 資料庫 Schema 設計

## 設計原則
所有資料表都應包含以下標準字段：
- `CreatedAt` - 創建時間 (DATETIME, 自動設置為當前時間)
- `CreatedBy` - 創建者 ID (INT, 外鍵關聯到 Users.Id)
- `UpdatedAt` - 更新時間 (DATETIME, 自動更新為當前時間)
- `UpdatedBy` - 更新者 ID (INT, 外鍵關聯到 Users.Id)

## 表結構定義

### 1. Users (用戶表)
```sql
CREATE TABLE Users (
  Id INT PRIMARY KEY AUTO_INCREMENT,
  LoginAccount VARCHAR(50) UNIQUE NOT NULL COMMENT '登入帳號',
  DisplayName VARCHAR(100) NOT NULL COMMENT '顯示名稱',
  PasswordHash VARCHAR(255) NOT NULL COMMENT '密碼雜湊值',
  Role ENUM('SuperAdmin', 'ITManager', 'Viewer') NOT NULL DEFAULT 'Viewer' COMMENT '用戶角色',
  Status ENUM('Active', 'Disabled', 'Locked') NOT NULL DEFAULT 'Active' COMMENT '帳號狀態：啟用/禁用/鎖定',
  LastLoginAt DATETIME NULL COMMENT '最後登入時間',
  LoginAttempts INT DEFAULT 0 COMMENT '登入嘗試次數 (用於帳號鎖定)',
  LockedUntil DATETIME NULL COMMENT '帳號鎖定至何時',
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
  CreatedBy INT NULL COMMENT '創建者ID (初始管理員可為空)',
  UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  UpdatedBy INT NULL COMMENT '更新者ID',
  
  INDEX idx_login_account (LoginAccount),
  INDEX idx_role (Role),
  INDEX idx_status (Status),
  INDEX idx_created_at (CreatedAt),
  FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE SET NULL,
  FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE SET NULL
) COMMENT '用戶資料表';
```

### 2. Resources (資源表)
```sql
CREATE TABLE Resources (
  Id INT PRIMARY KEY AUTO_INCREMENT,
  ResourceType VARCHAR(50) NOT NULL COMMENT '資源類型 (Server, Database, Website, API, etc.)',
  Name VARCHAR(100) NOT NULL COMMENT '資源名稱',
  IpAddress VARCHAR(45) NULL COMMENT 'IP地址 (支援IPv4和IPv6)',
  Port INT NULL COMMENT '端口號',
  LoginUser VARCHAR(100) NULL COMMENT '登入用戶名',
  LoginPasswordEncrypted TEXT NULL COMMENT '登入密碼 (加密)',
  Description TEXT NULL COMMENT '資源描述',
  DbName VARCHAR(100) NULL COMMENT '資料庫名稱 (適用於資料庫類型)',
  DbVersion VARCHAR(50) NULL COMMENT '資料庫版本',
  Status ENUM('Active', 'Inactive', 'Maintenance') DEFAULT 'Active' COMMENT '資源狀態',
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
  CreatedBy INT NOT NULL COMMENT '創建者ID',
  UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  UpdatedBy INT NOT NULL COMMENT '更新者ID',
  
  INDEX idx_resource_type (ResourceType),
  INDEX idx_name (Name),
  INDEX idx_ip_address (IpAddress),
  INDEX idx_status (Status),
  INDEX idx_created_at (CreatedAt),
  INDEX idx_created_by (CreatedBy),
  FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE RESTRICT,
  FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE RESTRICT
) COMMENT '資源資料表';
```

### 3. Tags (標籤表)
```sql
CREATE TABLE Tags (
  Id INT PRIMARY KEY AUTO_INCREMENT,
  Name VARCHAR(50) NOT NULL COMMENT '標籤名稱',
  Category VARCHAR(50) NOT NULL COMMENT '標籤分類',
  Color VARCHAR(7) DEFAULT '#409EFF' COMMENT '標籤顏色 (HEX格式)',
  Description TEXT NULL COMMENT '標籤描述',
  IsActive BOOLEAN DEFAULT TRUE COMMENT '標籤是否啟用',
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
  CreatedBy INT NOT NULL COMMENT '創建者ID',
  UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  UpdatedBy INT NOT NULL COMMENT '更新者ID',
  
  UNIQUE KEY uk_name_category (Name, Category),
  INDEX idx_category (Category),
  INDEX idx_name (Name),
  INDEX idx_created_at (CreatedAt),
  INDEX idx_created_by (CreatedBy),
  FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE RESTRICT,
  FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE RESTRICT
) COMMENT '標籤資料表';
```

### 4. ResourceTags (資源標籤關聯表)
```sql
CREATE TABLE ResourceTags (
  Id INT PRIMARY KEY AUTO_INCREMENT,
  ResourceId INT NOT NULL COMMENT '資源ID',
  TagId INT NOT NULL COMMENT '標籤ID',
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '關聯創建時間',
  CreatedBy INT NOT NULL COMMENT '創建者ID',
  
  UNIQUE KEY uk_resource_tag (ResourceId, TagId),
  INDEX idx_resource_id (ResourceId),
  INDEX idx_tag_id (TagId),
  INDEX idx_created_at (CreatedAt),
  FOREIGN KEY (ResourceId) REFERENCES Resources(Id) ON DELETE CASCADE,
  FOREIGN KEY (TagId) REFERENCES Tags(Id) ON DELETE CASCADE,
  FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE RESTRICT
) COMMENT '資源標籤關聯表';
```

### 5. ResourceRelationships (資源關係表)
```sql
CREATE TABLE ResourceRelationships (
  Id INT PRIMARY KEY AUTO_INCREMENT,
  SourceResourceId INT NOT NULL COMMENT '來源資源ID',
  TargetResourceId INT NOT NULL COMMENT '目標資源ID',
  RelationshipType VARCHAR(50) NOT NULL COMMENT '關係類型 (depends_on, connects_to, deployed_on, etc.)',
  Description TEXT NULL COMMENT '關係描述',
  IsActive BOOLEAN DEFAULT TRUE COMMENT '關係是否啟用',
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
  CreatedBy INT NOT NULL COMMENT '創建者ID',
  UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  UpdatedBy INT NOT NULL COMMENT '更新者ID',
  
  INDEX idx_source_resource (SourceResourceId),
  INDEX idx_target_resource (TargetResourceId),
  INDEX idx_relationship_type (RelationshipType),
  INDEX idx_created_at (CreatedAt),
  FOREIGN KEY (SourceResourceId) REFERENCES Resources(Id) ON DELETE CASCADE,
  FOREIGN KEY (TargetResourceId) REFERENCES Resources(Id) ON DELETE CASCADE,
  FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE RESTRICT,
  FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE RESTRICT
) COMMENT '資源關係表';
```

## 索引策略
1. 所有表的主鍵使用自增 INT
2. 重要查詢字段建立索引
3. 外鍵約束確保資料完整性
4. 時間戳字段建立索引便於時間範圍查詢
5. 複合索引優化常見查詢組合

## 資料完整性
1. 使用外鍵約束確保引用完整性
2. 必要字段設置 NOT NULL
3. 使用 ENUM 限制可選值
4. 自動時間戳確保審計追蹤

## 擴展性考慮
1. 預留描述字段支持未來擴展
2. 狀態字段支持業務流程管理
3. 顏色和分類字段支持UI定制
4. 關係表支持複雜的資源依賴管理