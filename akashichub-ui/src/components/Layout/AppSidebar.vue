<template>
  <div class="app-sidebar">
    <!-- 側邊欄標題 -->
    <div class="sidebar-header">
      <div class="logo" :class="{ 'is-collapsed': appStore.sidebarCollapsed }">
        <img src="/favicon.ico" alt="Logo" class="logo-image" />
        <transition name="fade">
          <h1 v-if="!appStore.sidebarCollapsed" class="logo-text">
            {{ appStore.appTitle }}
          </h1>
        </transition>
      </div>
    </div>

    <!-- 菜單導航 -->
    <div class="sidebar-menu" :class="{ 'collapsed': appStore.sidebarCollapsed }">
      <div class="menu-list">
        <div v-for="item in menuItems" :key="item.id" class="menu-item">
          <!-- 單層菜單 -->
          <router-link
            v-if="!item.children || item.children.length === 0"
            :to="item.path"
            class="menu-link"
            :class="{ 'active': activeMenu === item.path, 'disabled': item.disabled }"
            @click="!item.disabled && handleMenuClick(item)"
          >
            <i v-if="item.icon" class="menu-icon" :class="getIconClass(item.icon)"></i>
            <span v-if="!appStore.sidebarCollapsed" class="menu-title">{{ item.title }}</span>
            <span v-if="appStore.sidebarCollapsed" class="menu-tooltip" :title="item.title"></span>
          </router-link>

          <!-- 多層菜單 -->
          <div v-else class="menu-group">
            <div
              class="menu-group-header"
              :class="{ 'active': isGroupActive(item) }"
              @click="toggleGroup(item.id)"
            >
              <i v-if="item.icon" class="menu-icon" :class="getIconClass(item.icon)"></i>
              <span v-if="!appStore.sidebarCollapsed" class="menu-title">{{ item.title }}</span>
              <i v-if="!appStore.sidebarCollapsed" class="menu-arrow bi"
                 :class="expandedGroups.includes(item.id) ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
            </div>
            
            <div v-if="!appStore.sidebarCollapsed" class="menu-group-content"
                 :class="{ 'expanded': expandedGroups.includes(item.id) }">
              <router-link
                v-for="child in item.children"
                :key="child.id"
                :to="child.path"
                class="menu-sublink"
                :class="{ 'active': activeMenu === child.path, 'disabled': child.disabled }"
                @click="!child.disabled && handleMenuClick(child)"
              >
                <i v-if="child.icon" class="menu-subicon" :class="getIconClass(child.icon)"></i>
                <span class="menu-subtitle">{{ child.title }}</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 側邊欄底部 -->
    <div class="sidebar-footer">
      <!-- 收起/展開按鈕 -->
      <button
        type="button"
        class="btn btn-outline-secondary collapse-btn"
        @click="toggleSidebar"
      >
        <i class="bi" :class="appStore.sidebarCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'"></i>
        <span v-if="!appStore.sidebarCollapsed" class="ms-2">
          {{ appStore.sidebarCollapsed ? '展開' : '收起' }}
        </span>
      </button>

      <!-- 用戶信息 -->
      <transition name="fade">
        <div v-if="!appStore.sidebarCollapsed" class="user-info">
          <div class="dropdown">
            <div class="user-avatar dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
              <div class="user-avatar-img">
                <img v-if="userInfo?.avatar" :src="userInfo.avatar" class="avatar-img" alt="用戶頭像">
                <i v-else class="bi bi-person-circle avatar-placeholder"></i>
              </div>
              <div class="user-details">
                <div class="user-name">{{ userInfo?.displayName }}</div>
                <div class="user-role">{{ userInfo?.role }}</div>
              </div>
            </div>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <a class="dropdown-item" href="#" @click.prevent="handleUserCommand('profile')">
                  <i class="bi bi-person me-2"></i>
                  個人資料
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="handleUserCommand('settings')">
                  <i class="bi bi-gear me-2"></i>
                  設定
                </a>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item text-danger" href="#" @click.prevent="handleUserCommand('logout')">
                  <i class="bi bi-box-arrow-right me-2"></i>
                  登出
                </a>
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showAlert, showConfirm } from '@/utils/bootstrap-alerts'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

// 狀態管理
const appStore = useAppStore()
const authStore = useAuthStore()

// 路由
const route = useRoute()
const router = useRouter()

// 響應式數據
const activeMenu = ref('')
const expandedGroups = ref<string[]>(['resources', 'tags', 'users'])

// 計算屬性
const userInfo = computed(() => authStore.userInfo)

// 菜單項
const menuItems = computed(() => {
  const items = [
    {
      id: 'resources',
      title: '資源管理',
      icon: 'Server',
      path: '/resources',
      disabled: false,
      children: [
        {
          id: 'resources-list',
          title: '資源列表',
          path: '/resources',
          disabled: false
        },
        {
          id: 'resources-create',
          title: '新增資源',
          path: '/resources/create',
          disabled: !authStore.canEditITData
        }
      ]
    },
    {
      id: 'tags',
      title: '標籤管理',
      icon: 'CollectionTag',
      path: '/tags',
      disabled: false,
      children: [
        {
          id: 'tags-list',
          title: '標籤列表',
          path: '/tags',
          disabled: false
        },
        {
          id: 'tags-create',
          title: '新增標籤',
          path: '/tags/create',
          disabled: !authStore.canEditITData
        }
      ]
    },
    {
      id: 'users',
      title: '用戶群',
      icon: 'User',
      path: '/users',
      disabled: !authStore.canEditUsers,
      children: [
        {
          id: 'users-list',
          title: '用戶列表',
          path: '/users',
          disabled: !authStore.canEditUsers
        },
        {
          id: 'users-create',
          title: '新增用戶',
          path: '/users/create',
          disabled: !authStore.canEditUsers
        }
      ]
    },
    {
      id: 'logs',
      title: '日誌管理',
      icon: 'Document',
      path: '/logs',
      disabled: !authStore.isSuperAdmin,
      children: [
        {
          id: 'logs-system',
          title: '系統日誌',
          path: '/logs/system',
          disabled: !authStore.isSuperAdmin
        },
        {
          id: 'logs-audit',
          title: '審計日誌',
          path: '/logs/audit',
          disabled: !authStore.isSuperAdmin
        }
      ]
    },
    {
      id: 'search',
      title: '搜尋',
      icon: 'Search',
      path: '/search',
      disabled: false
    },
    {
      id: 'settings',
      title: '系統設定',
      icon: 'Setting',
      path: '/settings',
      disabled: !authStore.isSuperAdmin,
      children: [
        {
          id: 'settings-general',
          title: '一般設定',
          path: '/settings/general',
          disabled: !authStore.isSuperAdmin
        },
        {
          id: 'settings-security',
          title: '安全設定',
          path: '/settings/security',
          disabled: !authStore.isSuperAdmin
        },
        {
          id: 'settings-system',
          title: '系統狀態',
          path: '/settings/system',
          disabled: !authStore.isSuperAdmin
        }
      ]
    },
    {
      id: 'about',
      title: '關於系統',
      icon: 'InfoFilled',
      path: '/about',
      disabled: false
    }
  ]

  // 根據權限過濾菜單
  return items.filter(item => {
    // 如果菜單項被禁用，則不顯示
    if (item.disabled) return false
    
    // 對於用戶管理，只有有權限的用戶才能看到
    if (item.id === 'users' && !authStore.canEditUsers) return false
    
    // 對於日誌管理，只有超級管理員才能看到
    if (item.id === 'logs' && !authStore.isSuperAdmin) return false
    
    // 對於系統設定，只有超級管理員才能看到
    if (item.id === 'settings' && !authStore.isSuperAdmin) return false
    
    return true
  })
})

// 切換側邊欄
const toggleSidebar = () => {
  appStore.toggleSidebar()
}

// 獲取圖標類別
const getIconClass = (icon: string) => {
  return icon
}

// 切換群組展開
const toggleGroup = (groupId: string) => {
  const index = expandedGroups.value.indexOf(groupId)
  if (index > -1) {
    expandedGroups.value.splice(index, 1)
  } else {
    expandedGroups.value.push(groupId)
  }
}

// 檢查群組是否活動
const isGroupActive = (item: any) => {
  if (!item.children) return false
  return item.children.some((child: any) => activeMenu.value === child.path)
}

// 處理菜單點擊
const handleMenuClick = (item: any) => {
  if (item.disabled) return
  // 在移動設備上點擊菜單後收起側邊欄
  if (appStore.isMobile) {
    appStore.setSidebarCollapsed(true)
  }
}

// 處理用戶命令
const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      if (authStore.isSuperAdmin) {
        router.push('/settings')
      } else {
        showAlert('您沒有權限訪問系統設定', 'warning')
      }
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 處理登出
const handleLogout = async () => {
  try {
    const confirmed = await showConfirm(
      '確定要登出嗎？',
      '確認登出',
      {
        confirmText: '確定',
        cancelText: '取消',
        type: 'warning'
      }
    )
    
    if (!confirmed) return
    
    await authStore.logout()
    showAlert('登出成功', 'success')
    router.push('/login')
  } catch (error) {
    showAlert('登出失敗', 'error')
  }
}

// 更新活動菜單
const updateActiveMenu = () => {
  const currentPath = route.path
  
  // 資源管理
  if (currentPath.startsWith('/resources')) {
    if (currentPath === '/resources' || currentPath === '/resources/') {
      activeMenu.value = '/resources'
    } else if (currentPath === '/resources/create') {
      activeMenu.value = '/resources/create'
    } else {
      activeMenu.value = '/resources'
    }
    return
  }
  
  // 標籤管理
  if (currentPath.startsWith('/tags')) {
    if (currentPath === '/tags' || currentPath === '/tags/') {
      activeMenu.value = '/tags'
    } else if (currentPath === '/tags/create') {
      activeMenu.value = '/tags/create'
    } else {
      activeMenu.value = '/tags'
    }
    return
  }
  
  // 用戶管理
  if (currentPath.startsWith('/users')) {
    if (currentPath === '/users' || currentPath === '/users/') {
      activeMenu.value = '/users'
    } else if (currentPath === '/users/create') {
      activeMenu.value = '/users/create'
    } else {
      activeMenu.value = '/users'
    }
    return
  }
  
  // 日誌管理
  if (currentPath.startsWith('/logs')) {
    if (currentPath === '/logs/system') {
      activeMenu.value = '/logs/system'
    } else if (currentPath === '/logs/audit') {
      activeMenu.value = '/logs/audit'
    } else {
      activeMenu.value = '/logs/system'
    }
    return
  }
  
  // 系統設定
  if (currentPath.startsWith('/settings')) {
    if (currentPath === '/settings/general') {
      activeMenu.value = '/settings/general'
    } else if (currentPath === '/settings/security') {
      activeMenu.value = '/settings/security'
    } else if (currentPath === '/settings/system') {
      activeMenu.value = '/settings/system'
    } else {
      activeMenu.value = '/settings/general'
    }
    return
  }
  
  // 其他頁面
  activeMenu.value = currentPath
}

// 監聽路由變化
watch(
  () => route.path,
  () => {
    updateActiveMenu()
  },
  { immediate: true }
)

// 監聽側邊欄狀態變化
watch(
  () => appStore.sidebarCollapsed,
  (collapsed) => {
    // 在移動設備上收起時，可以執行一些額外的邏輯
    if (collapsed && appStore.isMobile) {
      // 移動設備收起側邊欄後的處理
    }
  }
)
</script>

<style lang="scss" scoped>
.app-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bs-light);
  border-right: 1px solid var(--bs-border-color);
}

.sidebar-header {
  height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--bs-border-color);
  
  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.3s ease;
    
    &.is-collapsed {
      justify-content: center;
    }
    
    .logo-image {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }
    
    .logo-text {
      font-size: 18px;
      font-weight: 600;
      color: var(--bs-primary);
      margin: 0;
      white-space: nowrap;
    }
  }
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
  
  &.collapsed {
    .menu-group-content {
      display: none;
    }
  }
  
  .menu-list {
    padding: 0;
    margin: 0;
    
    .menu-item {
      margin-bottom: 0.25rem;
      
      .menu-link {
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
        color: var(--bs-gray-700);
        text-decoration: none;
        border-radius: 0.375rem;
        margin: 0 0.5rem;
        transition: all 0.15s ease-in-out;
        position: relative;
        
        &:hover {
          background-color: var(--bs-primary-bg-subtle);
          color: var(--bs-primary);
        }
        
        &.active {
          background-color: var(--bs-primary);
          color: var(--bs-white);
          
          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 60%;
            background: var(--bs-white);
            border-radius: 0 2px 2px 0;
          }
        }
        
        &.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .menu-icon {
          width: 20px;
          font-size: 18px;
          margin-right: 0.75rem;
          text-align: center;
        }
        
        .menu-title {
          font-weight: 500;
          flex: 1;
        }
      }
      
      .menu-group {
        .menu-group-header {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          color: var(--bs-gray-700);
          cursor: pointer;
          border-radius: 0.375rem;
          margin: 0 0.5rem;
          transition: all 0.15s ease-in-out;
          
          &:hover {
            background-color: var(--bs-primary-bg-subtle);
            color: var(--bs-primary);
          }
          
          &.active {
            background-color: var(--bs-primary-bg-subtle);
            color: var(--bs-primary);
          }
          
          .menu-icon {
            width: 20px;
            font-size: 18px;
            margin-right: 0.75rem;
            text-align: center;
          }
          
          .menu-title {
            font-weight: 500;
            flex: 1;
          }
          
          .menu-arrow {
            font-size: 12px;
            transition: transform 0.15s ease-in-out;
          }
        }
        
        .menu-group-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-in-out;
          
          &.expanded {
            max-height: 300px;
          }
          
          .menu-sublink {
            display: flex;
            align-items: center;
            padding: 0.5rem 1rem 0.5rem 3rem;
            color: var(--bs-gray-600);
            text-decoration: none;
            border-radius: 0.375rem;
            margin: 0 0.5rem;
            transition: all 0.15s ease-in-out;
            
            &:hover {
              background-color: var(--bs-primary-bg-subtle);
              color: var(--bs-primary);
            }
            
            &.active {
              background-color: var(--bs-primary);
              color: var(--bs-white);
            }
            
            &.disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
            
            .menu-subicon {
              width: 16px;
              font-size: 14px;
              margin-right: 0.5rem;
              text-align: center;
            }
            
            .menu-subtitle {
              font-size: 0.875rem;
            }
          }
        }
      }
    }
  }
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--bs-border-color);
  background: var(--bs-light);
  
  .collapse-btn {
    width: 100%;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    
    i {
      font-size: 16px;
    }
  }
  
  .user-info {
    .user-avatar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
      
      &:hover {
        background-color: var(--bs-primary-bg-subtle);
      }
      
      .user-avatar-img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--bs-gray-200);
        
        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .avatar-placeholder {
          font-size: 20px;
          color: var(--bs-gray-500);
        }
      }
      
      .user-details {
        flex: 1;
        min-width: 0;
        
        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--bs-gray-800);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .user-role {
          font-size: 12px;
          color: var(--bs-gray-600);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}

// 動畫效果
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 滾動條樣式
.sidebar-menu {
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--bs-gray-300);
    border-radius: 2px;
    
    &:hover {
      background: var(--bs-gray-400);
    }
  }
}

// 響應式設計
@media (max-width: 768px) {
  .sidebar-header {
    padding: 0 16px;
  }
  
  .sidebar-footer {
    padding: 12px;
  }
}

// 暗黑模式
@media (prefers-color-scheme: dark) {
  .app-sidebar {
    background: var(--bs-dark);
    border-right-color: var(--bs-gray-700);
  }
  
  .sidebar-header {
    border-bottom-color: var(--bs-gray-700);
  }
  
  .sidebar-footer {
    border-top-color: var(--bs-gray-700);
    background: var(--bs-dark);
  }
  
  .menu-link {
    color: var(--bs-gray-300);
    
    &:hover {
      color: var(--bs-white);
    }
  }
}
</style>