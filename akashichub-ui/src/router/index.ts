// 路由配置

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { setupRouterGuards } from './guards'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

// 路由記錄
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首頁',
      requiresAuth: false,
      layout: 'none'
    }
  },
  {
    path: '/test',
    name: 'Test',
    component: () => Promise.resolve({
      template: '<div style="padding: 20px; text-align: center;"><h1>🎉 Vue 應用正常運行！</h1><p>這是一個測試頁面，證明路由系統工作正常。</p></div>'
    }),
    meta: {
      title: '測試頁面',
      requiresAuth: false
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Auth/Login.vue'),
    meta: {
      title: '登入',
      requiresAuth: false,
      layout: 'auth'
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
     component: () => import('@/views/Dashboard/Index.vue'),
    // component: () => import('@/views/Dashboard/Simple.vue'),
    meta: {
      title: '儀表板',
      requiresAuth: true,
      icon: 'House',
      breadcrumb: [
        { title: '首頁', path: '/dashboard' }
      ]
    }
  },
  {
    path: '/resources',
    name: 'Resources',
    component: () => import('@/views/Resources/Index.vue'),
    meta: {
      title: '資源管理',
      requiresAuth: true,
      icon: 'Server',
      breadcrumb: [
        { title: '首頁', path: '/dashboard' },
        { title: '資源管理' }
      ]
    },
    children: [
      {
        path: '',
        name: 'ResourcesList',
        component: () => import('@/views/Resources/List.vue'),
        meta: {
          title: '資源列表',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'create',
        name: 'ResourcesCreate',
        component: () => import('@/views/Resources/Create.vue'),
        meta: {
          title: '新增資源',
          requiresAuth: true,
          requiresAdmin: true,
          breadcrumb: [
            { title: '首頁', path: '/dashboard' },
            { title: '資源管理', path: '/resources' },
            { title: '新增資源' }
          ]
        }
      },
      {
        path: ':id',
        name: 'ResourcesDetail',
        component: () => import('@/views/Resources/Detail.vue'),
        props: true,
        meta: {
          title: '資源詳情',
          requiresAuth: true,
          breadcrumb: [
            { title: '首頁', path: '/dashboard' },
            { title: '資源管理', path: '/resources' },
            { title: '資源詳情' }
          ]
        }
      },
      {
        path: ':id/edit',
        name: 'ResourcesEdit',
        component: () => import('@/views/Resources/Edit.vue'),
        props: true,
        meta: {
          title: '編輯資源',
          requiresAuth: true,
          requiresAdmin: true,
          breadcrumb: [
            { title: '首頁', path: '/dashboard' },
            { title: '資源管理', path: '/resources' },
            { title: '編輯資源' }
          ]
        }
      }
    ]
  },
  {
    path: '/tags',
    name: 'Tags',
    component: () => import('@/views/Tags/Index.vue'),
    meta: {
      title: '標籤管理',
      requiresAuth: true,
      icon: 'CollectionTag',
      breadcrumb: [
        { title: '首頁', path: '/dashboard' },
        { title: '標籤管理' }
      ]
    },
    children: [
      {
        path: '',
        name: 'TagsList',
        component: () => import('@/views/Tags/List.vue'),
        meta: {
          title: '標籤列表',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'create',
        name: 'TagsCreate',
        component: () => import('@/views/Tags/Create.vue'),
        meta: {
          title: '新增標籤',
          requiresAuth: true,
          requiresAdmin: true,
          breadcrumb: [
            { title: '首頁', path: '/dashboard' },
            { title: '標籤管理', path: '/tags' },
            { title: '新增標籤' }
          ]
        }
      },
      {
        path: ':id/edit',
        name: 'TagsEdit',
        component: () => import('@/views/Tags/Edit.vue'),
        props: true,
        meta: {
          title: '編輯標籤',
          requiresAuth: true,
          requiresAdmin: true,
          breadcrumb: [
            { title: '首頁', path: '/dashboard' },
            { title: '標籤管理', path: '/tags' },
            { title: '編輯標籤' }
          ]
        }
      }
    ]
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/views/Users/Index.vue'),
    meta: {
      title: '用戶管理',
      requiresAuth: true,
      requiresAdmin: true,
      icon: 'User',
      breadcrumb: [
        { title: '首頁', path: '/dashboard' },
        { title: '用戶管理' }
      ]
    },
    children: [
      {
        path: '',
        name: 'UsersList',
        component: () => import('@/views/Users/List.vue'),
        meta: {
          title: '用戶列表',
          requiresAuth: true,
          requiresAdmin: true,
          keepAlive: true
        }
      },
      {
        path: 'create',
        name: 'UsersCreate',
        component: () => import('@/views/Users/Create.vue'),
        meta: {
          title: '新增用戶',
          requiresAuth: true,
          requiresAdmin: true,
          breadcrumb: [
            { title: '首頁', path: '/dashboard' },
            { title: '用戶管理', path: '/users' },
            { title: '新增用戶' }
          ]
        }
      },
      {
        path: ':id',
        name: 'UsersDetail',
        component: () => import('@/views/Users/Detail.vue'),
        props: true,
        meta: {
          title: '用戶詳情',
          requiresAuth: true,
          requiresAdmin: true,
          breadcrumb: [
            { title: '首頁', path: '/dashboard' },
            { title: '用戶管理', path: '/users' },
            { title: '用戶詳情' }
          ]
        }
      },
      {
        path: ':id/edit',
        name: 'UsersEdit',
        component: () => import('@/views/Users/Edit.vue'),
        props: true,
        meta: {
          title: '編輯用戶',
          requiresAuth: true,
          requiresAdmin: true,
          breadcrumb: [
            { title: '首頁', path: '/dashboard' },
            { title: '用戶管理', path: '/users' },
            { title: '編輯用戶' }
          ]
        }
      }
    ]
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile/Index.vue'),
    meta: {
      title: '個人資料',
      requiresAuth: true,
      icon: 'UserFilled',
      breadcrumb: [
        { title: '首頁', path: '/dashboard' },
        { title: '個人資料' }
      ]
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings/Index.vue'),
    meta: {
      title: '系統設定',
      requiresAuth: true,
      requiresAdmin: true,
      icon: 'Setting',
      breadcrumb: [
        { title: '首頁', path: '/dashboard' },
        { title: '系統設定' }
      ]
    },
    children: [
      {
        path: '',
        redirect: '/settings/general'
      },
      {
        path: 'general',
        name: 'SettingsGeneral',
        component: () => import('@/views/Settings/General.vue'),
        meta: {
          title: '一般設定',
          requiresAuth: true,
          requiresAdmin: true,
          breadcrumb: [
            { title: '首頁', path: '/dashboard' },
            { title: '系統設定', path: '/settings' },
            { title: '一般設定' }
          ]
        }
      },
      {
        path: 'security',
        name: 'SettingsSecurity',
        component: () => import('@/views/Settings/Security.vue'),
        meta: {
          title: '安全設定',
          requiresAuth: true,
          requiresAdmin: true,
          breadcrumb: [
            { title: '首頁', path: '/dashboard' },
            { title: '系統設定', path: '/settings' },
            { title: '安全設定' }
          ]
        }
      },
      {
        path: 'system',
        name: 'SettingsSystem',
        component: () => import('@/views/Settings/System.vue'),
        meta: {
          title: '系統狀態',
          requiresAuth: true,
          requiresAdmin: true,
          breadcrumb: [
            { title: '首頁', path: '/dashboard' },
            { title: '系統設定', path: '/settings' },
            { title: '系統狀態' }
          ]
        }
      }
    ]
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import('@/views/Logs/Index.vue'),
    meta: {
      title: '日誌管理',
      requiresAuth: true,
      requiresAdmin: true,
      icon: 'Document',
      breadcrumb: [
        { title: '首頁', path: '/dashboard' },
        { title: '日誌管理' }
      ]
    },
    children: [
      {
        path: '',
        redirect: '/logs/system'
      },
      {
        path: 'system',
        name: 'LogsSystem',
        component: () => import('@/views/Logs/System.vue'),
        meta: {
          title: '系統日誌',
          requiresAuth: true,
          requiresAdmin: true,
          breadcrumb: [
            { title: '首頁', path: '/dashboard' },
            { title: '日誌管理', path: '/logs' },
            { title: '系統日誌' }
          ]
        }
      },
      {
        path: 'audit',
        name: 'LogsAudit',
        component: () => import('@/views/Logs/Audit.vue'),
        meta: {
          title: '審計日誌',
          requiresAuth: true,
          requiresAdmin: true,
          breadcrumb: [
            { title: '首頁', path: '/dashboard' },
            { title: '日誌管理', path: '/logs' },
            { title: '審計日誌' }
          ]
        }
      }
    ]
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search/Index.vue'),
    meta: {
      title: '搜尋',
      requiresAuth: true,
      icon: 'Search',
      breadcrumb: [
        { title: '首頁', path: '/dashboard' },
        { title: '搜尋' }
      ]
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About/Index.vue'),
    meta: {
      title: '關於系統',
      requiresAuth: true,
      icon: 'InfoFilled',
      breadcrumb: [
        { title: '首頁', path: '/dashboard' },
        { title: '關於系統' }
      ]
    }
  },
  // 錯誤頁面
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/Error/403.vue'),
    meta: {
      title: '權限不足',
      requiresAuth: false,
      layout: 'error'
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/Error/404.vue'),
    meta: {
      title: '頁面不存在',
      requiresAuth: false,
      layout: 'error'
    }
  },
  {
    path: '/500',
    name: 'ServerError',
    component: () => import('@/views/Error/500.vue'),
    meta: {
      title: '伺服器錯誤',
      requiresAuth: false,
      layout: 'error'
    }
  },
  // 維護頁面
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: () => import('@/views/Maintenance/Index.vue'),
    meta: {
      title: '系統維護',
      requiresAuth: false,
      layout: 'maintenance'
    }
  },
  // 404 捕獲
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

// 創建路由實例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置，則使用保存的位置
    if (savedPosition) {
      return savedPosition
    }
    
    // 如果有hash，則滾動到對應元素
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    
    // 否則滾動到頂部
    return { top: 0, behavior: 'smooth' }
  }
})

// 設置路由守衛
setupRouterGuards(router)

// 路由工具函數
export const routerUtils = {
  // 獲取當前路由面包屑
  getBreadcrumbs: (route: any) => {
    return route.meta?.breadcrumb || []
  },
  
  // 檢查路由是否需要認證
  requiresAuth: (route: any) => {
    return route.meta?.requiresAuth === true
  },
  
  // 檢查路由是否需要管理員權限
  requiresAdmin: (route: any) => {
    return route.meta?.requiresAdmin === true
  },
  
  // 檢查路由是否需要特定權限
  requiresPermission: (route: any, permission: string) => {
    const permissions = route.meta?.permissions || []
    return permissions.includes(permission)
  },
  
  // 檢查路由是否需要特定角色
  requiresRole: (route: any, role: string) => {
    const roles = route.meta?.roles || []
    return roles.includes(role)
  },
  
  // 獲取菜單項
  getMenuItems: () => {
    const authStore = useAuthStore()
    
    return routes
      .filter(route => {
        // 過濾掉不需要顯示在菜單中的路由
        if (route.meta?.hidden) return false
        if (route.path === '/' || route.path.startsWith('/:')) return false
        if (['Login', 'Forbidden', 'NotFound', 'ServerError', 'Maintenance'].includes(route.name as string)) return false
        
        // 檢查權限
        if (route.meta?.requiresAdmin && !authStore.isAdmin) return false
        if (route.meta?.roles && !authStore.hasAnyRole(route.meta.roles)) return false
        if (route.meta?.permissions && !authStore.hasAnyPermission(route.meta.permissions)) return false
        
        return true
      })
      .map(route => ({
        id: route.name as string,
        title: route.meta?.title || route.name as string,
        icon: route.meta?.icon,
        path: route.path,
        children: route.children?.map(child => ({
          id: child.name as string,
          title: child.meta?.title || child.name as string,
          path: child.path === '' ? route.path : `${route.path}/${child.path}`
        }))
      }))
  }
}

// 路由變化監聽
router.afterEach((to) => {
  const appStore = useAppStore()
  
  // 更新頁面標題
  appStore.setPageTitle(to.meta?.title as string || '')
  
  // 更新面包屑
  appStore.setBreadcrumbs(to.meta?.breadcrumb || [])
  
  // 添加到訪問記錄
  if (to.name && to.meta?.keepAlive) {
    appStore.addVisitedView(to.name as string)
  }
  
  // 添加到緩存
  if (to.name && to.meta?.keepAlive) {
    appStore.addCachedView(to.name as string)
  }
})

export default router
export { routes }