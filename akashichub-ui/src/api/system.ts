// 系統管理相關API

import { get, post, put, del } from '@/utils/request'
import type { SystemStatus, SystemConfig, Statistics } from '@/types'

// 獲取系統健康狀態
export const getSystemHealth = (): Promise<SystemStatus> => {
  return get('/health')
}

// 獲取系統配置
export const getSystemConfig = (): Promise<SystemConfig> => {
  return get('/system/config')
}

// 獲取系統統計
export const getSystemStats = (): Promise<Statistics> => {
  return get('/system/stats')
}

// 獲取Redis狀態
export const getRedisStatus = (): Promise<{
  enabled: boolean
  connected: boolean
  stats?: {
    keyCount: number
    memory: {
      used: string
      peak: string
      rss: string
    }
    server: {
      version: string
      uptime: string
    }
  }
}> => {
  return get('/system/redis')
}

// 清除Redis快取
export const clearRedisCache = (pattern?: string): Promise<{
  deleted: number
  message: string
}> => {
  return post('/system/redis/clear', { pattern })
}

// 獲取Redis快取統計
export const getRedisCacheStats = (): Promise<{
  totalKeys: number
  keysByPrefix: Record<string, number>
  hitRate: number
  missRate: number
}> => {
  return get('/system/redis/stats')
}

// 獲取系統日誌
export const getSystemLogs = (params: {
  level?: 'error' | 'warn' | 'info' | 'debug'
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
  search?: string
}): Promise<{
  logs: Array<{
    timestamp: string
    level: string
    message: string
    meta?: any
  }>
  total: number
  pagination: {
    page: number
    limit: number
    totalPages: number
  }
}> => {
  return get('/system/logs', params)
}

// 獲取審計日誌
export const getAuditLogs = (params: {
  userId?: number
  action?: string
  resource?: string
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
}): Promise<{
  logs: Array<{
    id: string
    userId: number
    userName: string
    action: string
    resource: string
    details: any
    timestamp: string
    ipAddress: string
    userAgent: string
  }>
  total: number
  pagination: {
    page: number
    limit: number
    totalPages: number
  }
}> => {
  return get('/system/audit-logs', params)
}

// 下載系統日誌
export const downloadSystemLogs = (params: {
  format: 'json' | 'csv' | 'txt'
  level?: string
  startDate?: string
  endDate?: string
}): Promise<{
  downloadUrl: string
  filename: string
}> => {
  return post('/system/logs/download', params)
}

// 獲取系統監控數據
export const getSystemMonitoring = (params: {
  metric: 'cpu' | 'memory' | 'disk' | 'network'
  period: 'hour' | 'day' | 'week' | 'month'
}): Promise<{
  data: Array<{
    timestamp: string
    value: number
    unit: string
  }>
  average: number
  peak: number
  current: number
}> => {
  return get('/system/monitoring', params)
}

// 獲取數據庫狀態
export const getDatabaseStatus = (): Promise<{
  connected: boolean
  version: string
  uptime: string
  connections: {
    current: number
    max: number
  }
  size: {
    total: string
    used: string
    free: string
  }
  performance: {
    queries: number
    slowQueries: number
    avgQueryTime: number
  }
}> => {
  return get('/system/database/status')
}

// 執行數據庫維護
export const runDatabaseMaintenance = (operations: {
  optimize?: boolean
  repair?: boolean
  analyze?: boolean
  cleanup?: boolean
}): Promise<{
  results: Array<{
    operation: string
    success: boolean
    message: string
    duration: number
  }>
}> => {
  return post('/system/database/maintenance', operations)
}

// 創建數據庫備份
export const createDatabaseBackup = (options: {
  includeBinaryLogs?: boolean
  compression?: 'gzip' | 'bzip2' | 'none'
  description?: string
}): Promise<{
  backupId: string
  filename: string
  size: number
  location: string
}> => {
  return post('/system/database/backup', options)
}

// 獲取數據庫備份列表
export const getDatabaseBackups = (): Promise<Array<{
  id: string
  filename: string
  size: number
  createdAt: string
  description?: string
  status: 'completed' | 'failed' | 'in_progress'
}>> => {
  return get('/system/database/backups')
}

// 恢復數據庫備份
export const restoreDatabaseBackup = (backupId: string): Promise<{
  success: boolean
  message: string
  duration: number
}> => {
  return post(`/system/database/backups/${backupId}/restore`)
}

// 刪除數據庫備份
export const deleteDatabaseBackup = (backupId: string): Promise<void> => {
  return del(`/system/database/backups/${backupId}`)
}

// 獲取系統設定
export const getSystemSettings = (): Promise<{
  maintenance: {
    enabled: boolean
    message: string
    startTime?: string
    endTime?: string
  }
  security: {
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSymbols: boolean
    }
    sessionTimeout: number
    maxLoginAttempts: number
    lockoutDuration: number
  }
  notifications: {
    email: {
      enabled: boolean
      smtp: {
        host: string
        port: number
        secure: boolean
        auth: {
          user: string
          // pass: string (隱藏)
        }
      }
    }
    webhook: {
      enabled: boolean
      url: string
      events: string[]
    }
  }
}> => {
  return get('/system/settings')
}

// 更新系統設定
export const updateSystemSettings = (settings: any): Promise<void> => {
  return put('/system/settings', settings)
}

// 重置系統設定
export const resetSystemSettings = (): Promise<void> => {
  return post('/system/settings/reset')
}

// 切換維護模式
export const toggleMaintenanceMode = (data: {
  enabled: boolean
  message?: string
  startTime?: string
  endTime?: string
}): Promise<void> => {
  return post('/system/maintenance', data)
}

// 發送測試通知
export const sendTestNotification = (type: 'email' | 'webhook', data: any): Promise<{
  success: boolean
  message: string
  details?: any
}> => {
  return post(`/system/notifications/test/${type}`, data)
}

// 獲取系統版本資訊
export const getSystemVersion = (): Promise<{
  version: string
  buildDate: string
  gitCommit: string
  environment: string
  dependencies: Record<string, string>
}> => {
  return get('/system/version')
}

// 檢查系統更新
export const checkSystemUpdates = (): Promise<{
  hasUpdates: boolean
  currentVersion: string
  latestVersion?: string
  releaseNotes?: string
  downloadUrl?: string
}> => {
  return get('/system/updates/check')
}

// 執行系統更新
export const performSystemUpdate = (): Promise<{
  success: boolean
  message: string
  newVersion: string
}> => {
  return post('/system/updates/perform')
}

// 獲取系統許可證資訊
export const getSystemLicense = (): Promise<{
  type: 'free' | 'professional' | 'enterprise'
  validUntil?: string
  features: string[]
  limits: {
    maxUsers: number
    maxResources: number
    maxStorage: number
  }
}> => {
  return get('/system/license')
}

// 更新系統許可證
export const updateSystemLicense = (licenseKey: string): Promise<{
  success: boolean
  message: string
  license: any
}> => {
  return post('/system/license', { licenseKey })
}

// 重啟系統服務
export const restartSystemService = (service: string): Promise<{
  success: boolean
  message: string
}> => {
  return post(`/system/services/${service}/restart`)
}

// 獲取系統服務狀態
export const getSystemServices = (): Promise<Array<{
  name: string
  status: 'running' | 'stopped' | 'error'
  uptime: string
  memory: number
  cpu: number
  restartCount: number
}>> => {
  return get('/system/services')
}

// 清理系統垃圾
export const cleanupSystem = (options: {
  logs?: boolean
  cache?: boolean
  temp?: boolean
  sessions?: boolean
}): Promise<{
  cleaned: Array<{
    type: string
    size: number
    count: number
  }>
  totalSize: number
  totalCount: number
}> => {
  return post('/system/cleanup', options)
}

// 獲取系統安全報告
export const getSystemSecurityReport = (): Promise<{
  score: number
  level: 'low' | 'medium' | 'high'
  checks: Array<{
    name: string
    status: 'pass' | 'fail' | 'warning'
    message: string
    severity: 'low' | 'medium' | 'high'
    recommendation?: string
  }>
  lastCheck: string
}> => {
  return get('/system/security/report')
}

// 執行系統安全掃描
export const runSecurityScan = (): Promise<{
  scanId: string
  status: 'started' | 'completed' | 'failed'
  progress: number
}> => {
  return post('/system/security/scan')
}

// 導出所有API
export default {
  getSystemHealth,
  getSystemConfig,
  getSystemStats,
  getRedisStatus,
  clearRedisCache,
  getRedisCacheStats,
  getSystemLogs,
  getAuditLogs,
  downloadSystemLogs,
  getSystemMonitoring,
  getDatabaseStatus,
  runDatabaseMaintenance,
  createDatabaseBackup,
  getDatabaseBackups,
  restoreDatabaseBackup,
  deleteDatabaseBackup,
  getSystemSettings,
  updateSystemSettings,
  resetSystemSettings,
  toggleMaintenanceMode,
  sendTestNotification,
  getSystemVersion,
  checkSystemUpdates,
  performSystemUpdate,
  getSystemLicense,
  updateSystemLicense,
  restartSystemService,
  getSystemServices,
  cleanupSystem,
  getSystemSecurityReport,
  runSecurityScan
}