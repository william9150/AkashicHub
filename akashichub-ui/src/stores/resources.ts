// 資源管理狀態

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Resource, 
  ResourceListItem, 
  ResourceQueryParams, 
  PaginationConfig, 
  Tag,
  ResourceStats 
} from '@/types'
import { 
  getResources, 
  getResourceById, 
  createResource, 
  updateResource, 
  deleteResource,
  decryptPassword
} from '@/api/resources'

export const useResourcesStore = defineStore('resources', () => {
  // 狀態
  const resources = ref<ResourceListItem[]>([])
  const currentResource = ref<Resource | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const pagination = ref<PaginationConfig>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const queryParams = ref<ResourceQueryParams>({
    page: 1,
    limit: 20,
    keyword: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  })
  const selectedResources = ref<number[]>([])
  const stats = ref<ResourceStats>({
    totalCount: 0,
    byType: {
      '伺服器': 0,
      '資料庫': 0,
      '網站': 0,
      '應用程式': 0,
      '其他': 0
    },
    byStatus: {
      'active': 0,
      'inactive': 0,
      'maintenance': 0,
      'unknown': 0
    },
    withPasswords: 0,
    withRelationships: 0,
    createdThisMonth: 0,
    updatedThisWeek: 0
  })

  // 計算屬性
  const hasResources = computed(() => resources.value.length > 0)
  const hasSelection = computed(() => selectedResources.value.length > 0)
  const selectionCount = computed(() => selectedResources.value.length)
  const isAllSelected = computed(() => {
    return resources.value.length > 0 && selectedResources.value.length === resources.value.length
  })
  const hasNextPage = computed(() => pagination.value.page < pagination.value.totalPages)
  const hasPrevPage = computed(() => pagination.value.page > 1)

  // 按類型分組的資源
  const resourcesByType = computed(() => {
    const groups = resources.value.reduce((acc, resource) => {
      const type = resource.resourceType
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(resource)
      return acc
    }, {} as Record<string, ResourceListItem[]>)
    
    return Object.entries(groups).map(([type, items]) => ({
      type,
      count: items.length,
      resources: items
    }))
  })

  // 動作
  const fetchResources = async (params: Partial<ResourceQueryParams> = {}) => {
    try {
      loading.value = true
      error.value = null
      
      const mergedParams = { ...queryParams.value, ...params }
      queryParams.value = mergedParams
      
      const response = await getResources(mergedParams)
      
      resources.value = response.resources || []
      pagination.value = response.pagination
      total.value = response.pagination.totalItems
      
      return response
    } catch (err: any) {
      error.value = err.message || '獲取資源列表失敗'
      resources.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchResourceById = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      
      const resource = await getResourceById(id)
      currentResource.value = resource
      
      return resource
    } catch (err: any) {
      error.value = err.message || '獲取資源詳情失敗'
      currentResource.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  const addResource = async (resourceData: any) => {
    try {
      loading.value = true
      error.value = null
      
      const newResource = await createResource(resourceData)
      
      // 重新載入資源列表
      await fetchResources()
      
      return newResource
    } catch (err: any) {
      error.value = err.message || '創建資源失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  const editResource = async (id: number, resourceData: any) => {
    try {
      loading.value = true
      error.value = null
      
      const updatedResource = await updateResource(id, resourceData)
      
      // 更新本地狀態
      const index = resources.value.findIndex(r => r.id === id)
      if (index !== -1) {
        resources.value[index] = { ...resources.value[index], ...updatedResource }
      }
      
      if (currentResource.value?.id === id) {
        currentResource.value = { ...currentResource.value, ...updatedResource }
      }
      
      return updatedResource
    } catch (err: any) {
      error.value = err.message || '更新資源失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  const removeResource = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      
      await deleteResource(id)
      
      // 從本地狀態中移除
      resources.value = resources.value.filter(r => r.id !== id)
      
      if (currentResource.value?.id === id) {
        currentResource.value = null
      }
      
      // 從選擇中移除
      selectedResources.value = selectedResources.value.filter(rId => rId !== id)
      
      // 更新統計
      total.value -= 1
      pagination.value.totalItems -= 1
      
    } catch (err: any) {
      error.value = err.message || '刪除資源失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  const batchDeleteResources = async (ids: number[]) => {
    try {
      loading.value = true
      error.value = null
      
      // 批量刪除
      await Promise.all(ids.map(id => deleteResource(id)))
      
      // 從本地狀態中移除
      resources.value = resources.value.filter(r => !ids.includes(r.id))
      
      // 清空選擇
      selectedResources.value = []
      
      // 更新統計
      total.value -= ids.length
      pagination.value.totalItems -= ids.length
      
    } catch (err: any) {
      error.value = err.message || '批量刪除資源失敗'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getResourcePassword = async (id: number) => {
    try {
      const response = await decryptPassword(id)
      return response.password
    } catch (err: any) {
      error.value = err.message || '獲取密碼失敗'
      throw err
    }
  }

  // 搜尋和篩選
  const searchResources = async (keyword: string) => {
    return fetchResources({ keyword, page: 1 })
  }

  const filterByType = async (resourceType: string) => {
    return fetchResources({ resourceType, page: 1 })
  }

  const filterByTags = async (tags: string[]) => {
    return fetchResources({ tags, page: 1 })
  }

  const sortResources = async (sortBy: string, sortOrder: 'ASC' | 'DESC') => {
    return fetchResources({ sortBy, sortOrder, page: 1 })
  }

  // 分頁
  const nextPage = async () => {
    if (hasNextPage.value) {
      return fetchResources({ page: pagination.value.page + 1 })
    }
  }

  const prevPage = async () => {
    if (hasPrevPage.value) {
      return fetchResources({ page: pagination.value.page - 1 })
    }
  }

  const goToPage = async (page: number) => {
    if (page >= 1 && page <= pagination.value.totalPages) {
      return fetchResources({ page })
    }
  }

  const changePageSize = async (limit: number) => {
    return fetchResources({ limit, page: 1 })
  }

  // 選擇管理
  const selectResource = (id: number) => {
    if (!selectedResources.value.includes(id)) {
      selectedResources.value.push(id)
    }
  }

  const unselectResource = (id: number) => {
    const index = selectedResources.value.indexOf(id)
    if (index > -1) {
      selectedResources.value.splice(index, 1)
    }
  }

  const toggleResourceSelection = (id: number) => {
    if (selectedResources.value.includes(id)) {
      unselectResource(id)
    } else {
      selectResource(id)
    }
  }

  const selectAllResources = () => {
    selectedResources.value = resources.value.map(r => r.id)
  }

  const clearSelection = () => {
    selectedResources.value = []
  }

  const toggleAllSelection = () => {
    if (isAllSelected.value) {
      clearSelection()
    } else {
      selectAllResources()
    }
  }

  // 統計
  const updateStats = () => {
    const typeStats = resources.value.reduce((acc, resource) => {
      acc[resource.resourceType] = (acc[resource.resourceType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    stats.value.byType = {
      '伺服器': typeStats['伺服器'] || 0,
      '資料庫': typeStats['資料庫'] || 0,
      '網站': typeStats['網站'] || 0,
      '應用程式': typeStats['應用程式'] || 0,
      '其他': typeStats['其他'] || 0
    }

    stats.value.totalCount = resources.value.length
  }

  // 重置狀態
  const resetState = () => {
    resources.value = []
    currentResource.value = null
    selectedResources.value = []
    error.value = null
    pagination.value = {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    }
    queryParams.value = {
      page: 1,
      limit: 20,
      keyword: '',
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    }
  }

  const refreshResources = async () => {
    return fetchResources()
  }

  const clearError = () => {
    error.value = null
  }

  // 返回狀態和方法
  return {
    // 狀態
    resources: readonly(resources),
    currentResource: readonly(currentResource),
    loading: readonly(loading),
    error: readonly(error),
    total: readonly(total),
    pagination: readonly(pagination),
    queryParams: readonly(queryParams),
    selectedResources: readonly(selectedResources),
    stats: readonly(stats),
    
    // 計算屬性
    hasResources,
    hasSelection,
    selectionCount,
    isAllSelected,
    hasNextPage,
    hasPrevPage,
    resourcesByType,
    
    // 動作
    fetchResources,
    fetchResourceById,
    addResource,
    editResource,
    removeResource,
    batchDeleteResources,
    getResourcePassword,
    searchResources,
    filterByType,
    filterByTags,
    sortResources,
    nextPage,
    prevPage,
    goToPage,
    changePageSize,
    selectResource,
    unselectResource,
    toggleResourceSelection,
    selectAllResources,
    clearSelection,
    toggleAllSelection,
    updateStats,
    resetState,
    refreshResources,
    clearError
  }
})

// 類型定義
export type ResourcesStore = ReturnType<typeof useResourcesStore>