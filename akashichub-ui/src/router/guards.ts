// 路由守衛

import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'

// 設置路由守衛
export function setupRouterGuards(router: Router) {
  // 全域前置守衛
  router.beforeEach(async (to, from, next) => {
    // 開始進度條
    NProgress.start()
    
    const authStore = useAuthStore()
    const appStore = useAppStore()
    
    // 設置載入狀態
    appStore.setLoading(true)
    
    try {
      // 簡化版本：暫時跳過複雜的檢查
      console.log('Router guard: navigating to', to.path)
      
      // 初始化認證狀態（只在需要時）
      if (!authStore.isAuthenticated && to.meta.requiresAuth !== false) {
        authStore.checkAuth()
      }
      
      // 暫時跳過維護模式檢查
      // if (to.name !== 'Maintenance' && await checkMaintenanceMode()) {
      //   next({ name: 'Maintenance' })
      //   return
      // }
      
      // 檢查認證要求
      if (to.meta?.requiresAuth !== false) {
        if (!authStore.isAuthenticated) {
          // 未登入，重定向到登入頁面
          next({
            name: 'Login',
            query: { redirect: to.fullPath }
          })
          return
        }
        
        // 檢查Token是否即將過期
        if (authStore.checkTokenExpiry()) {
          // 可以在這裡實現Token自動刷新
          console.warn('Token will expire soon')
        }
        
        // 更新用戶活動時間
        authStore.trackActivity()
      }
      
      // 檢查管理員權限
      if (to.meta?.requiresAdmin && !authStore.isAdmin) {
        ElMessage.error('需要管理員權限才能訪問此頁面')
        next({ name: 'Forbidden' })
        return
      }
      
      // 檢查角色權限
      if (to.meta?.roles && !authStore.hasAnyRole(to.meta.roles)) {
        ElMessage.error('您沒有足夠的權限訪問此頁面')
        next({ name: 'Forbidden' })
        return
      }
      
      // 檢查特定權限
      if (to.meta?.permissions && !authStore.hasAnyPermission(to.meta.permissions)) {
        ElMessage.error('您沒有足夠的權限訪問此頁面')
        next({ name: 'Forbidden' })
        return
      }
      
      // 如果已登入用戶訪問登入頁面，重定向到首頁
      if (to.name === 'Login' && authStore.isAuthenticated) {
        next({ name: 'Dashboard' })
        return
      }
      
      // 檢查路由是否存在
      if (to.matched.length === 0) {
        next({ name: 'NotFound' })
        return
      }
      
      // 繼續導航
      next()
      
    } catch (error) {
      console.error('Route guard error:', error)
      
      // 如果是認證錯誤，重定向到登入頁面
      if (error.status === 401) {
        authStore.logout()
        next({
          name: 'Login',
          query: { redirect: to.fullPath }
        })
      } else {
        // 其他錯誤重定向到500頁面
        next({ name: 'ServerError' })
      }
    }
  })
  
  // 全域後置守衛
  router.afterEach((to, from, failure) => {
    const appStore = useAppStore()
    
    // 結束進度條
    NProgress.done()
    
    // 關閉載入狀態
    appStore.setLoading(false)
    
    // 如果導航失敗
    if (failure) {
      console.error('Navigation failed:', failure)
      return
    }
    
    // 記錄頁面訪問（用於統計）
    logPageVisit(to)
    
    // 在移動設備上自動收起側邊欄
    if (appStore.isMobile) {
      appStore.setSidebarCollapsed(true)
    }
  })
  
  // 全域解析守衛
  router.beforeResolve(async (to, from, next) => {
    // 可以在這裡進行組件載入前的最後檢查
    next()
  })
  
  // 導航錯誤處理
  router.onError((error) => {
    console.error('Router error:', error)
    
    // 停止進度條
    NProgress.done()
    
    // 關閉載入狀態
    const appStore = useAppStore()
    appStore.setLoading(false)
    
    // 顯示錯誤訊息
    ElMessage.error('頁面載入失敗，請重試')
  })
}

// 檢查維護模式
async function checkMaintenanceMode(): Promise<boolean> {
  try {
    // 這裡可以調用API檢查維護模式狀態
    // const response = await systemApi.getMaintenanceStatus()
    // return response.enabled
    return false
  } catch (error) {
    console.error('Failed to check maintenance mode:', error)
    return false
  }
}

// 記錄頁面訪問
function logPageVisit(route: any) {
  // 只在生產環境記錄
  if (import.meta.env.PROD) {
    const visitData = {
      path: route.path,
      name: route.name,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer
    }
    
    // 這裡可以發送統計資料到後端
    console.log('Page visit:', visitData)
  }
}

// 權限檢查輔助函數
export const permissionGuard = (permission: string) => {
  return (to: any, from: any, next: any) => {
    const authStore = useAuthStore()
    
    if (!authStore.hasPermission(permission)) {
      ElMessage.error(`需要 ${permission} 權限才能訪問此頁面`)
      next({ name: 'Forbidden' })
      return
    }
    
    next()
  }
}

// 角色檢查輔助函數
export const roleGuard = (role: string) => {
  return (to: any, from: any, next: any) => {
    const authStore = useAuthStore()
    
    if (!authStore.hasRole(role)) {
      ElMessage.error(`需要 ${role} 角色才能訪問此頁面`)
      next({ name: 'Forbidden' })
      return
    }
    
    next()
  }
}

// 管理員檢查輔助函數
export const adminGuard = (to: any, from: any, next: any) => {
  const authStore = useAuthStore()
  
  if (!authStore.isAdmin) {
    ElMessage.error('需要管理員權限才能訪問此頁面')
    next({ name: 'Forbidden' })
    return
  }
  
  next()
}

// 認證檢查輔助函數
export const authGuard = (to: any, from: any, next: any) => {
  const authStore = useAuthStore()
  
  if (!authStore.isAuthenticated) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  next()
}

// 訪客檢查輔助函數（只允許未登入用戶訪問）
export const guestGuard = (to: any, from: any, next: any) => {
  const authStore = useAuthStore()
  
  if (authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }
  
  next()
}

// 路由元信息類型擴展
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    requiresAuth?: boolean
    requiresAdmin?: boolean
    roles?: string[]
    permissions?: string[]
    keepAlive?: boolean
    hidden?: boolean
    breadcrumb?: Array<{ title: string; path?: string }>
    layout?: 'default' | 'auth' | 'error' | 'maintenance'
    activeMenu?: string
  }
}

// 導出所有守衛
export default {
  setupRouterGuards,
  permissionGuard,
  roleGuard,
  adminGuard,
  authGuard,
  guestGuard
}