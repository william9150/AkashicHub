// 簡化的路由配置
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 路由記錄 - 只保留核心功能
const routes: RouteRecordRaw[] = [
  // 首頁
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首頁' }
  },
  
  // 登入
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Auth/Login.simple.vue'),
    meta: { title: '登入' }
  },
  
  // 儀表板
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard/Simple.vue'),
    meta: { title: '儀表板', requiresAuth: true }
  },
  
  // 資源管理
  {
    path: '/resources',
    name: 'Resources',
    component: () => import('@/views/Resources/List.simple.vue'),
    meta: { title: '資源管理', requiresAuth: true }
  },
  
  // 標籤管理
  {
    path: '/tags',
    name: 'Tags',
    component: () => import('@/views/Tags/List.vue'),
    meta: { title: '標籤管理', requiresAuth: true }
  },
  
  // 用戶管理
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/views/Users/List.simple.vue'),
    meta: { title: '用戶管理', requiresAuth: true }
  },
  
  // 個人資料
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile/Index.simple.vue'),
    meta: { title: '個人資料', requiresAuth: true }
  },
  
  // 測試頁面
  {
    path: '/test',
    name: 'Test',
    component: () => Promise.resolve({
      template: '<div style="padding: 20px; text-align: center;"><h1>🎉 Vue 應用正常運行！</h1><p>路由系統工作正常</p><router-link to="/">返回首頁</router-link></div>'
    }),
    meta: { title: '測試頁面' }
  },
  
  // 404 處理
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => Promise.resolve({
      template: '<div style="padding: 20px; text-align: center;"><h1>404</h1><p>頁面不存在</p><router-link to="/">返回首頁</router-link></div>'
    }),
    meta: { title: '頁面不存在' }
  }
]

// 創建路由實例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 簡化的路由守衛 - 只處理基本認證
router.beforeEach((to, from, next) => {
  console.log('📍 導航到:', to.path)
  
  // 檢查是否需要認證
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('akashichub_token')
    if (!token) {
      console.log('❌ 需要登入，重定向到登入頁面')
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }
  
  // 更新頁面標題
  if (to.meta.title) {
    document.title = `${to.meta.title} - AkashicHub`
  }
  
  next()
})

router.afterEach((to) => {
  console.log('✅ 導航完成:', to.path)
})

export default router