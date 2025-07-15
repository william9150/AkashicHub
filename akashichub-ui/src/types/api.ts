// API 相關類型定義

// 基礎 API 回應格式
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

// 分頁資料結構
export interface PaginationData<T = any> {
  resources?: T[]
  items?: T[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    limit: number
  }
}

// 查詢參數
export interface QueryParams {
  page?: number
  limit?: number
  keyword?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

// 資源查詢參數
export interface ResourceQueryParams extends QueryParams {
  tags?: string | string[]
  resourceType?: string
}

// 標籤查詢參數
export interface TagQueryParams extends QueryParams {
  category?: string
}

// 用戶查詢參數
export interface UserQueryParams extends QueryParams {
  role?: 'Admin' | 'User'
}

// HTTP 方法
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// 請求配置
export interface RequestConfig {
  url: string
  method: HttpMethod
  data?: any
  params?: any
  headers?: Record<string, string>
  timeout?: number
}

// 錯誤類型
export interface ApiError {
  code: string
  message: string
  status?: number
  details?: any
}

// 文件上傳
export interface FileUploadResponse {
  url: string
  filename: string
  size: number
  type: string
}

// 系統狀態
export interface SystemStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  checks: {
    environment: {
      status: string
      hasRequiredVars: boolean
    }
    redis?: {
      status: string
      connected: boolean
      error?: string
    }
    encryption: {
      status: string
      keyLength: number
      valid: boolean
    }
  }
}

// 系統配置
export interface SystemConfig {
  environment: string
  server: {
    port: number
    host: string
  }
  database: {
    host: string
    port: number
    name: string
    user: string
    hasPassword: boolean
  }
  redis: {
    enabled: boolean
    host: string
    port: number
    status: {
      isConnected: boolean
      connectionStatus: string
    }
  }
  jwt: {
    hasSecret: boolean
    expiresIn: string
  }
  logging: {
    seqUrl: string
    hasSeqApiKey: boolean
  }
  security: {
    hasEncryptionKey: boolean
    encryptionKeyLength: number
  }
}

// 統計資料
export interface Statistics {
  totalResources: number
  totalTags: number
  totalUsers: number
  resourcesByType: Record<string, number>
  tagsByCategory: Record<string, number>
  recentActivity: ActivityLog[]
}

// 活動日誌
export interface ActivityLog {
  id: string
  userId: string
  action: string
  resource: string
  timestamp: string
  details?: any
}

// 導出類型
export type {
  ApiResponse,
  PaginationData,
  QueryParams,
  ResourceQueryParams,
  TagQueryParams,
  UserQueryParams,
  HttpMethod,
  RequestConfig,
  ApiError,
  FileUploadResponse,
  SystemStatus,
  SystemConfig,
  Statistics,
  ActivityLog
}