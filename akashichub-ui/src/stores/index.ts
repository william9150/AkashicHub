// 狀態管理統一導出

// 導出所有 store
export { useAuthStore } from './auth'
export { useAppStore } from './app'
export { useResourcesStore } from './resources'

// 導出類型
export type { AuthStore } from './auth'
export type { AppStore } from './app'
export type { ResourcesStore } from './resources'

// 重置所有狀態的工具函數
export const resetAllStores = () => {
  // 這個函數可以在登出或需要重置所有狀態時使用
  const authStore = useAuthStore()
  const appStore = useAppStore()
  const resourcesStore = useResourcesStore()
  
  // 重置各個 store 的狀態
  authStore.logout()
  resourcesStore.resetState()
  
  // 保持 app store 的某些狀態（如主題設定）
  // appStore.resetSettings() // 如果需要重置 app 設定
}

// 統一的錯誤處理
export const handleStoreError = (error: any, storeName: string) => {
  console.error(`${storeName} Store Error:`, error)
  
  // 可以在這裡添加全域錯誤處理邏輯
  // 例如顯示通知、記錄錯誤等
}

// 狀態持久化工具
export const persistState = (key: string, state: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to persist state:', error)
  }
}

export const loadPersistedState = (key: string) => {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.error('Failed to load persisted state:', error)
    return null
  }
}

// 默認導出
export default {
  useAuthStore,
  useAppStore,
  useResourcesStore,
  resetAllStores,
  handleStoreError,
  persistState,
  loadPersistedState
}