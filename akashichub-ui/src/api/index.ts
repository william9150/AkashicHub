// API 統一導出

// 導出所有API模組
export * from './auth'
export * from './resources'
export * from './tags'
export * from './users'
export * from './system'

// 導出默認模組
export { default as authApi } from './auth'
export { default as resourcesApi } from './resources'
export { default as tagsApi } from './tags'
export { default as usersApi } from './users'
export { default as systemApi } from './system'

// 統一的API錯誤處理
export const handleApiError = (error: any, context: string = 'API') => {
  console.error(`${context} Error:`, error)
  
  // 可以在這裡添加全域錯誤處理邏輯
  // 例如錯誤上報、用戶通知等
  
  return {
    code: error?.code || 'UNKNOWN_ERROR',
    message: error?.message || '未知錯誤',
    status: error?.status || 500,
    details: error?.details || null
  }
}

// API請求重試工具
export const withRetry = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await apiCall()
    } catch (error) {
      lastError = error
      
      if (i === maxRetries) {
        throw error
      }
      
      // 等待後重試
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
  
  throw lastError
}

// 批量API請求
export const batchRequest = async <T>(
  requests: Array<() => Promise<T>>,
  maxConcurrency: number = 5
): Promise<Array<T | Error>> => {
  const results: Array<T | Error> = []
  
  for (let i = 0; i < requests.length; i += maxConcurrency) {
    const batch = requests.slice(i, i + maxConcurrency)
    
    const batchResults = await Promise.allSettled(
      batch.map(request => request())
    )
    
    results.push(
      ...batchResults.map(result => 
        result.status === 'fulfilled' ? result.value : result.reason
      )
    )
  }
  
  return results
}

// API響應緩存
const apiCache = new Map<string, {
  data: any
  timestamp: number
  ttl: number
}>()

export const withCache = <T>(
  cacheKey: string,
  apiCall: () => Promise<T>,
  ttl: number = 300000 // 5分鐘
): Promise<T> => {
  const cached = apiCache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return Promise.resolve(cached.data)
  }
  
  return apiCall().then(data => {
    apiCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    })
    return data
  })
}

// 清除API緩存
export const clearApiCache = (pattern?: string) => {
  if (pattern) {
    const regex = new RegExp(pattern)
    for (const [key] of apiCache) {
      if (regex.test(key)) {
        apiCache.delete(key)
      }
    }
  } else {
    apiCache.clear()
  }
}

// API請求取消
export const createAbortController = () => {
  return new AbortController()
}

// 帶取消功能的API請求
export const withAbort = <T>(
  apiCall: (signal: AbortSignal) => Promise<T>,
  controller?: AbortController
): Promise<T> => {
  const abortController = controller || new AbortController()
  
  return apiCall(abortController.signal)
}

// API請求監控
export const withMonitoring = async <T>(
  apiCall: () => Promise<T>,
  endpoint: string
): Promise<T> => {
  const startTime = Date.now()
  
  try {
    const result = await apiCall()
    const duration = Date.now() - startTime
    
    // 記錄成功請求
    console.log(`API Success: ${endpoint} (${duration}ms)`)
    
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    
    // 記錄失敗請求
    console.error(`API Error: ${endpoint} (${duration}ms)`, error)
    
    throw error
  }
}

// 常用的API組合
export const apiCommons = {
  // 獲取初始化數據
  getInitialData: async () => {
    const [userInfo, systemConfig] = await Promise.all([
      authApi.getUserProfile(),
      systemApi.getSystemConfig()
    ])
    
    return {
      userInfo,
      systemConfig
    }
  },
  
  // 獲取儀表板數據
  getDashboardData: async () => {
    const [stats, recentResources, recentActivity] = await Promise.all([
      systemApi.getSystemStats(),
      resourcesApi.getResources({ limit: 5, sortBy: 'updatedAt' }),
      systemApi.getAuditLogs({ limit: 10 })
    ])
    
    return {
      stats,
      recentResources,
      recentActivity
    }
  },
  
  // 獲取資源詳情頁面數據
  getResourceDetailData: async (id: number) => {
    const [resource, relationships, activityLogs] = await Promise.all([
      resourcesApi.getResourceById(id),
      resourcesApi.getResourceRelationships(id),
      resourcesApi.getResourceActivityLogs(id, { limit: 10 })
    ])
    
    return {
      resource,
      relationships,
      activityLogs
    }
  },
  
  // 獲取用戶管理頁面數據
  getUserManagementData: async () => {
    const [users, roles, stats] = await Promise.all([
      usersApi.getUsers({ limit: 20 }),
      usersApi.getUserRoles(),
      usersApi.getUserStats()
    ])
    
    return {
      users,
      roles,
      stats
    }
  }
}

// 默認導出
export default {
  authApi,
  resourcesApi,
  tagsApi,
  usersApi,
  systemApi,
  handleApiError,
  withRetry,
  batchRequest,
  withCache,
  clearApiCache,
  createAbortController,
  withAbort,
  withMonitoring,
  apiCommons
}