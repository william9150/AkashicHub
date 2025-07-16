// 路由守衛

import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'

// 設置路由守衛
export function setupRouterGuards(router: Router) {
  // 全域前置守衛 - 簡化版本用於診斷
  router.beforeEach(async (to, from, next) => {
    // 開始進度條
    NProgress.start()
    
    console.log('🚀 Router guard: navigating to', to.path, to.name)
    
    try {
      // 暫時跳過所有複雜檢查，直接放行
      if (to.path === '/test' || to.path === '/' || to.name === 'Home' || to.name === 'Test') {
        console.log('✅ Allowing navigation to:', to.path)
        next()
        return
      }
      
      // 對於其他路由，暫時也直接放行
      console.log('✅ Allowing navigation to other routes:', to.path)
      next()
      
    } catch (error) {
      console.error('❌ Route guard error:', error)
      next()
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