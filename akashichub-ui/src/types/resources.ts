// 資源管理相關類型定義

// 資源類型
export type ResourceType = '伺服器' | '資料庫' | '網站' | '應用程式' | '其他'

// 資源狀態
export type ResourceStatus = 'active' | 'inactive' | 'maintenance' | 'unknown'

// 關係類型
export type RelationshipType = '使用' | '依賴' | '連接' | '備份' | '監控'

// 資源基本資訊
export interface Resource {
  id: number
  resourceType: ResourceType
  name: string
  ipAddress?: string
  port?: number
  loginUser?: string
  loginPasswordEncrypted?: string
  description?: string
  dbName?: string
  dbVersion?: string
  status?: ResourceStatus
  createdAt: string
  updatedAt: string
  tags?: Tag[]
  relationships?: ResourceRelationship[]
}

// 資源創建請求
export interface ResourceCreateRequest {
  resourceType: ResourceType
  name: string
  ipAddress?: string
  port?: number
  loginUser?: string
  loginPassword?: string
  description?: string
  dbName?: string
  dbVersion?: string
  tagIds?: number[]
  newTags?: { name: string; category: string }[]
  relatedResourceIds?: number[]
}

// 資源更新請求
export interface ResourceUpdateRequest {
  resourceType?: ResourceType
  name?: string
  ipAddress?: string
  port?: number
  loginUser?: string
  loginPassword?: string
  description?: string
  dbName?: string
  dbVersion?: string
  status?: ResourceStatus
  tagIds?: number[]
}

// 資源列表項
export interface ResourceListItem {
  id: number
  resourceType: ResourceType
  name: string
  ipAddress?: string
  port?: number
  loginUser?: string
  description?: string
  status?: ResourceStatus
  tagsCount: number
  createdAt: string
  updatedAt: string
}

// 資源詳情
export interface ResourceDetail extends Resource {
  tags: Tag[]
  relationships: ResourceRelationship[]
  relatedResources: Resource[]
  activityLogs: ActivityLog[]
}

// 資源關係
export interface ResourceRelationship {
  id: number
  sourceResourceId: number
  targetResourceId: number
  relationshipType: RelationshipType
  description?: string
  createdAt: string
  sourceResource?: Resource
  targetResource?: Resource
}

// 標籤
export interface Tag {
  id: number
  name: string
  category: string
  color?: string
  description?: string
  createdAt: string
  updatedAt: string
  resourcesCount?: number
}

// 標籤創建請求
export interface TagCreateRequest {
  name: string
  category: string
  color?: string
  description?: string
}

// 標籤更新請求
export interface TagUpdateRequest {
  name?: string
  category?: string
  color?: string
  description?: string
}

// 標籤分類
export interface TagCategory {
  name: string
  count: number
  tags: Tag[]
}

// 密碼解密請求
export interface PasswordDecryptRequest {
  resourceId: number
  reason?: string
}

// 密碼解密回應
export interface PasswordDecryptResponse {
  password: string
  timestamp: string
  expiresAt: string
}

// 資源導入
export interface ResourceImport {
  file: File
  options: {
    skipDuplicates: boolean
    updateExisting: boolean
    createTags: boolean
  }
}

// 資源導出
export interface ResourceExport {
  resourceIds: number[]
  format: 'json' | 'csv' | 'xlsx'
  includePasswords: boolean
  includeRelationships: boolean
}

// 資源搜尋
export interface ResourceSearch {
  keyword?: string
  resourceType?: ResourceType
  status?: ResourceStatus
  tags?: string[]
  dateRange?: {
    start: string
    end: string
  }
  hasPassword?: boolean
  hasRelationships?: boolean
}

// 資源統計
export interface ResourceStats {
  totalCount: number
  byType: Record<ResourceType, number>
  byStatus: Record<ResourceStatus, number>
  withPasswords: number
  withRelationships: number
  createdThisMonth: number
  updatedThisWeek: number
}

// 資源活動日誌
export interface ResourceActivityLog {
  id: string
  resourceId: number
  userId: number
  action: 'create' | 'update' | 'delete' | 'view' | 'decrypt_password'
  description: string
  details?: any
  timestamp: string
  user?: {
    id: number
    displayName: string
  }
}

// 資源備份
export interface ResourceBackup {
  id: string
  resourceId: number
  type: 'manual' | 'auto'
  status: 'pending' | 'running' | 'completed' | 'failed'
  location: string
  size: number
  createdAt: string
  completedAt?: string
  error?: string
}

// 導出類型
export type {
  ResourceType,
  ResourceStatus,
  RelationshipType,
  Resource,
  ResourceCreateRequest,
  ResourceUpdateRequest,
  ResourceListItem,
  ResourceDetail,
  ResourceRelationship,
  Tag,
  TagCreateRequest,
  TagUpdateRequest,
  TagCategory,
  PasswordDecryptRequest,
  PasswordDecryptResponse,
  ResourceImport,
  ResourceExport,
  ResourceSearch,
  ResourceStats,
  ResourceActivityLog,
  ResourceBackup
}