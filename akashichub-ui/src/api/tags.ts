// 標籤管理相關API

import { get, post, put, del } from '@/utils/request'
import type { 
  Tag, 
  TagCreateRequest,
  TagUpdateRequest,
  TagQueryParams,
  TagCategory
} from '@/types'

// 獲取所有標籤
export const getTags = (params: TagQueryParams = {}): Promise<Tag[]> => {
  return get('/tags', params)
}

// 獲取標籤詳情
export const getTagById = (id: number): Promise<Tag> => {
  return get(`/tags/${id}`)
}

// 創建標籤
export const createTag = (data: TagCreateRequest): Promise<Tag> => {
  return post('/tags', data)
}

// 更新標籤
export const updateTag = (id: number, data: TagUpdateRequest): Promise<Tag> => {
  return put(`/tags/${id}`, data)
}

// 刪除標籤
export const deleteTag = (id: number): Promise<void> => {
  return del(`/tags/${id}`)
}

// 批量刪除標籤
export const batchDeleteTags = (ids: number[]): Promise<void> => {
  return post('/tags/batch-delete', { ids })
}

// 獲取標籤分類
export const getTagCategories = (): Promise<TagCategory[]> => {
  return get('/tags/categories')
}

// 創建標籤分類
export const createTagCategory = (data: {
  name: string
  description?: string
  color?: string
}): Promise<TagCategory> => {
  return post('/tags/categories', data)
}

// 更新標籤分類
export const updateTagCategory = (name: string, data: {
  description?: string
  color?: string
}): Promise<TagCategory> => {
  return put(`/tags/categories/${name}`, data)
}

// 刪除標籤分類
export const deleteTagCategory = (name: string): Promise<void> => {
  return del(`/tags/categories/${name}`)
}

// 獲取標籤使用統計
export const getTagStats = (): Promise<{
  totalTags: number
  totalCategories: number
  mostUsedTags: Array<{
    tag: Tag
    resourceCount: number
  }>
  categoryStats: Array<{
    category: string
    tagCount: number
    resourceCount: number
  }>
}> => {
  return get('/tags/stats')
}

// 搜尋標籤
export const searchTags = (query: string, params: {
  category?: string
  limit?: number
}): Promise<{
  tags: Tag[]
  total: number
  suggestions: string[]
}> => {
  return get('/tags/search', { query, ...params })
}

// 獲取標籤建議
export const getTagSuggestions = (params: {
  resourceType?: string
  resourceName?: string
  limit?: number
}): Promise<{
  suggested: Tag[]
  similar: Tag[]
  popular: Tag[]
}> => {
  return get('/tags/suggestions', params)
}

// 合併標籤
export const mergeTags = (data: {
  sourceTagIds: number[]
  targetTagId: number
  deleteSource?: boolean
}): Promise<{
  mergedTag: Tag
  affectedResources: number
}> => {
  return post('/tags/merge', data)
}

// 批量添加標籤到資源
export const batchAddTagsToResources = (data: {
  tagIds: number[]
  resourceIds: number[]
}): Promise<{
  affected: number
  skipped: number
}> => {
  return post('/tags/batch-add-to-resources', data)
}

// 批量從資源移除標籤
export const batchRemoveTagsFromResources = (data: {
  tagIds: number[]
  resourceIds: number[]
}): Promise<{
  affected: number
}> => {
  return post('/tags/batch-remove-from-resources', data)
}

// 獲取標籤的資源
export const getTagResources = (id: number, params: {
  page?: number
  limit?: number
  resourceType?: string
}): Promise<{
  resources: Array<{
    id: number
    name: string
    resourceType: string
    description?: string
    createdAt: string
  }>
  total: number
  pagination: {
    page: number
    limit: number
    totalPages: number
  }
}> => {
  return get(`/tags/${id}/resources`, params)
}

// 獲取未使用的標籤
export const getUnusedTags = (): Promise<Tag[]> => {
  return get('/tags/unused')
}

// 清理未使用的標籤
export const cleanupUnusedTags = (): Promise<{
  deletedCount: number
  deletedTags: Tag[]
}> => {
  return post('/tags/cleanup-unused')
}

// 匯出標籤
export const exportTags = (params: {
  categoryIds?: string[]
  format: 'json' | 'csv' | 'xlsx'
  includeResources?: boolean
}): Promise<{
  downloadUrl: string
  filename: string
}> => {
  return post('/tags/export', params)
}

// 匯入標籤
export const importTags = (file: File, options: {
  skipDuplicates?: boolean
  updateExisting?: boolean
  createCategories?: boolean
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
  
  return post('/tags/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 驗證標籤資料
export const validateTagData = (data: Partial<TagCreateRequest>): Promise<{
  valid: boolean
  errors: Array<{
    field: string
    message: string
  }>
}> => {
  return post('/tags/validate', data)
}

// 獲取標籤顏色建議
export const getTagColorSuggestions = (): Promise<Array<{
  name: string
  hex: string
  rgb: string
  category: string
}>> => {
  return get('/tags/color-suggestions')
}

// 批量更新標籤顏色
export const batchUpdateTagColors = (data: {
  tagIds: number[]
  color: string
}): Promise<void> => {
  return post('/tags/batch-update-colors', data)
}

// 重新計算標籤統計
export const recalculateTagStats = (): Promise<{
  updated: number
  message: string
}> => {
  return post('/tags/recalculate-stats')
}

// 獲取標籤層次結構
export const getTagHierarchy = (): Promise<Array<{
  category: string
  tags: Tag[]
  count: number
}>> => {
  return get('/tags/hierarchy')
}

// 獲取相關標籤
export const getRelatedTags = (id: number, limit: number = 10): Promise<Array<{
  tag: Tag
  score: number
  reason: string
}>> => {
  return get(`/tags/${id}/related`, { limit })
}

// 獲取標籤趨勢
export const getTagTrends = (params: {
  period: 'day' | 'week' | 'month'
  limit?: number
}): Promise<Array<{
  tag: Tag
  growth: number
  trend: 'up' | 'down' | 'stable'
  usage: Array<{
    date: string
    count: number
  }>
}>> => {
  return get('/tags/trends', params)
}

// 標記標籤為熱門
export const markTagAsPopular = (id: number): Promise<void> => {
  return post(`/tags/${id}/mark-popular`)
}

// 取消標籤熱門標記
export const unmarkTagAsPopular = (id: number): Promise<void> => {
  return del(`/tags/${id}/mark-popular`)
}

// 獲取熱門標籤
export const getPopularTags = (limit: number = 20): Promise<Tag[]> => {
  return get('/tags/popular', { limit })
}

// 獲取最近使用的標籤
export const getRecentlyUsedTags = (limit: number = 10): Promise<Tag[]> => {
  return get('/tags/recently-used', { limit })
}

// 導出所有API
export default {
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  batchDeleteTags,
  getTagCategories,
  createTagCategory,
  updateTagCategory,
  deleteTagCategory,
  getTagStats,
  searchTags,
  getTagSuggestions,
  mergeTags,
  batchAddTagsToResources,
  batchRemoveTagsFromResources,
  getTagResources,
  getUnusedTags,
  cleanupUnusedTags,
  exportTags,
  importTags,
  validateTagData,
  getTagColorSuggestions,
  batchUpdateTagColors,
  recalculateTagStats,
  getTagHierarchy,
  getRelatedTags,
  getTagTrends,
  markTagAsPopular,
  unmarkTagAsPopular,
  getPopularTags,
  getRecentlyUsedTags
}