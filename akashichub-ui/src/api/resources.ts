// 資源管理相關API

import { get, post, put, del } from '@/utils/request'
import type { 
  Resource, 
  ResourceCreateRequest,
  ResourceUpdateRequest,
  ResourceQueryParams,
  PaginationData,
  ResourceStats,
  ResourceActivityLog,
  PasswordDecryptResponse
} from '@/types'

// 獲取資源列表
export const getResources = (params: ResourceQueryParams = {}): Promise<PaginationData<Resource>> => {
  return get('/resources', params)
}

// 獲取資源詳情
export const getResourceById = (id: number): Promise<Resource> => {
  return get(`/resources/${id}`)
}

// 創建資源
export const createResource = (data: ResourceCreateRequest): Promise<Resource> => {
  return post('/resources', data)
}

// 更新資源
export const updateResource = (id: number, data: ResourceUpdateRequest): Promise<Resource> => {
  return put(`/resources/${id}`, data)
}

// 刪除資源
export const deleteResource = (id: number): Promise<void> => {
  return del(`/resources/${id}`)
}

// 批量刪除資源
export const batchDeleteResources = (ids: number[]): Promise<void> => {
  return post('/resources/batch-delete', { ids })
}

// 解密資源密碼
export const decryptPassword = (id: number): Promise<PasswordDecryptResponse> => {
  return post(`/resources/${id}/decrypt-password`)
}

// 測試資源連接
export const testResourceConnection = (id: number): Promise<{
  success: boolean
  message: string
  details?: any
}> => {
  return post(`/resources/${id}/test-connection`)
}

// 獲取資源統計
export const getResourceStats = (): Promise<ResourceStats> => {
  return get('/resources/stats')
}

// 獲取資源活動日誌
export const getResourceActivityLogs = (
  id: number,
  params: {
    page?: number
    limit?: number
    action?: string
    startDate?: string
    endDate?: string
  } = {}
): Promise<PaginationData<ResourceActivityLog>> => {
  return get(`/resources/${id}/activity-logs`, params)
}

// 獲取資源關係
export const getResourceRelationships = (id: number): Promise<{
  incoming: Array<{
    id: number
    sourceResource: Resource
    relationshipType: string
    description?: string
  }>
  outgoing: Array<{
    id: number
    targetResource: Resource
    relationshipType: string
    description?: string
  }>
}> => {
  return get(`/resources/${id}/relationships`)
}

// 創建資源關係
export const createResourceRelationship = (data: {
  sourceResourceId: number
  targetResourceId: number
  relationshipType: string
  description?: string
}): Promise<void> => {
  return post('/resources/relationships', data)
}

// 刪除資源關係
export const deleteResourceRelationship = (id: number): Promise<void> => {
  return del(`/resources/relationships/${id}`)
}

// 複製資源
export const duplicateResource = (id: number, data: {
  name: string
  copyRelationships?: boolean
  copyTags?: boolean
}): Promise<Resource> => {
  return post(`/resources/${id}/duplicate`, data)
}

// 批量更新資源
export const batchUpdateResources = (data: {
  ids: number[]
  updates: Partial<ResourceUpdateRequest>
}): Promise<void> => {
  return post('/resources/batch-update', data)
}

// 匯出資源
export const exportResources = (params: {
  ids?: number[]
  format: 'json' | 'csv' | 'xlsx'
  includePasswords?: boolean
  includeRelationships?: boolean
}): Promise<{
  downloadUrl: string
  filename: string
}> => {
  return post('/resources/export', params)
}

// 匯入資源
export const importResources = (file: File, options: {
  skipDuplicates?: boolean
  updateExisting?: boolean
  createTags?: boolean
}): Promise<{
  imported: number
  skipped: number
  errors: Array<{
    row: number
    message: string
  }>
}> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('options', JSON.stringify(options))
  
  return post('/resources/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 驗證資源資料
export const validateResourceData = (data: Partial<ResourceCreateRequest>): Promise<{
  valid: boolean
  errors: Array<{
    field: string
    message: string
  }>
}> => {
  return post('/resources/validate', data)
}

// 搜尋資源
export const searchResources = (params: {
  query: string
  type?: string
  tags?: string[]
  limit?: number
}): Promise<{
  resources: Resource[]
  total: number
  suggestions: string[]
}> => {
  return get('/resources/search', params)
}

// 獲取資源類型列表
export const getResourceTypes = (): Promise<Array<{
  value: string
  label: string
  icon: string
  count: number
}>> => {
  return get('/resources/types')
}

// 獲取資源狀態選項
export const getResourceStatuses = (): Promise<Array<{
  value: string
  label: string
  color: string
  count: number
}>> => {
  return get('/resources/statuses')
}

// 批量標記資源狀態
export const batchUpdateResourceStatus = (data: {
  ids: number[]
  status: string
}): Promise<void> => {
  return post('/resources/batch-status', data)
}

// 獲取資源備份
export const getResourceBackups = (id: number): Promise<Array<{
  id: string
  type: 'manual' | 'auto'
  status: string
  createdAt: string
  size: number
  location: string
}>> => {
  return get(`/resources/${id}/backups`)
}

// 創建資源備份
export const createResourceBackup = (id: number, data: {
  type: 'manual' | 'auto'
  description?: string
}): Promise<{ backupId: string }> => {
  return post(`/resources/${id}/backups`, data)
}

// 恢復資源備份
export const restoreResourceBackup = (id: number, backupId: string): Promise<void> => {
  return post(`/resources/${id}/backups/${backupId}/restore`)
}

// 刪除資源備份
export const deleteResourceBackup = (id: number, backupId: string): Promise<void> => {
  return del(`/resources/${id}/backups/${backupId}`)
}

// 獲取相關資源推薦
export const getResourceRecommendations = (id: number): Promise<Array<{
  resource: Resource
  score: number
  reason: string
}>> => {
  return get(`/resources/${id}/recommendations`)
}

// 獲取資源健康狀態
export const getResourceHealth = (id: number): Promise<{
  status: 'healthy' | 'warning' | 'error'
  checks: Array<{
    name: string
    status: 'ok' | 'warning' | 'error'
    message: string
  }>
  lastCheck: string
}> => {
  return get(`/resources/${id}/health`)
}

// 批量健康檢查
export const batchHealthCheck = (ids: number[]): Promise<Array<{
  id: number
  status: 'healthy' | 'warning' | 'error'
  message: string
}>> => {
  return post('/resources/batch-health-check', { ids })
}

// 獲取資源使用統計
export const getResourceUsageStats = (id: number, params: {
  period: 'day' | 'week' | 'month'
  metric: 'access' | 'password_decrypt' | 'connection_test'
}): Promise<Array<{
  date: string
  value: number
}>> => {
  return get(`/resources/${id}/usage-stats`, params)
}

// 標記資源為收藏
export const favoriteResource = (id: number): Promise<void> => {
  return post(`/resources/${id}/favorite`)
}

// 取消收藏資源
export const unfavoriteResource = (id: number): Promise<void> => {
  return del(`/resources/${id}/favorite`)
}

// 獲取收藏的資源
export const getFavoriteResources = (): Promise<Resource[]> => {
  return get('/resources/favorites')
}

// 導出所有API
export default {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  batchDeleteResources,
  decryptPassword,
  testResourceConnection,
  getResourceStats,
  getResourceActivityLogs,
  getResourceRelationships,
  createResourceRelationship,
  deleteResourceRelationship,
  duplicateResource,
  batchUpdateResources,
  exportResources,
  importResources,
  validateResourceData,
  searchResources,
  getResourceTypes,
  getResourceStatuses,
  batchUpdateResourceStatus,
  getResourceBackups,
  createResourceBackup,
  restoreResourceBackup,
  deleteResourceBackup,
  getResourceRecommendations,
  getResourceHealth,
  batchHealthCheck,
  getResourceUsageStats,
  favoriteResource,
  unfavoriteResource,
  getFavoriteResources
}