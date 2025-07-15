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
    <el-menu
      :default-active="activeMenu"
      :collapse="appStore.sidebarCollapsed"
      :unique-opened="appStore.settings.uniqueOpened"
      :collapse-transition="false"
      class="sidebar-menu"
      router
    >
      <template v-for="item in menuItems" :key="item.id">
        <!-- 單層菜單 -->
        <el-menu-item
          v-if="!item.children || item.children.length === 0"
          :index="item.path"
          :disabled="item.disabled"
        >
          <el-icon v-if="item.icon">
            <component :is="item.icon" />
          </el-icon>
          <template #title>
            <span>{{ item.title }}</span>
          </template>
        </el-menu-item>

        <!-- 多層菜單 -->
        <el-sub-menu
          v-else
          :index="item.path"
          :disabled="item.disabled"
        >
          <template #title>
            <el-icon v-if="item.icon">
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.title }}</span>
          </template>
          
          <el-menu-item
            v-for="child in item.children"
            :key="child.id"
            :index="child.path"
            :disabled="child.disabled"
          >
            <el-icon v-if="child.icon">
              <component :is="child.icon" />
            </el-icon>
            <template #title>
              <span>{{ child.title }}</span>
            </template>
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>

    <!-- 側邊欄底部 -->
    <div class="sidebar-footer">
      <!-- 收起/展開按鈕 -->
      <el-button
        class="collapse-btn"
        :icon="appStore.sidebarCollapsed ? 'Expand' : 'Fold'"
        @click="toggleSidebar"
      >
        <template v-if="!appStore.sidebarCollapsed">
          {{ appStore.sidebarCollapsed ? '展開' : '收起' }}
        </template>
      </el-button>

      <!-- 用戶信息 -->
      <transition name="fade">
        <div v-if="!appStore.sidebarCollapsed" class="user-info">
          <el-dropdown trigger="click" @command="handleUserCommand">
            <div class="user-avatar">
              <el-avatar :size="32" :src="userInfo?.avatar">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
              <div class="user-details">
                <div class="user-name">{{ userInfo?.displayName }}</div>
                <div class="user-role">{{ userInfo?.role }}</div>
              </div>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  個人資料
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  設定
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  登出
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  House,
  Server,
  CollectionTag,
  User,
  UserFilled,
  Setting,
  Document,
  Search,
  InfoFilled,
  Expand,
  Fold,
  SwitchButton
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { routerUtils } from '@/router'

// 狀態管理
const appStore = useAppStore()
const authStore = useAuthStore()

// 路由
const route = useRoute()
const router = useRouter()

// 響應式數據
const activeMenu = ref('')

// 計算屬性
const userInfo = computed(() => authStore.userInfo)

// 菜單項
const menuItems = computed(() => {
  const items = [
    {
      id: 'dashboard',
      title: '儀表板',
      icon: 'House',
      path: '/dashboard',
      disabled: false
    },
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
          disabled: !authStore.isAdmin
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
          disabled: !authStore.isAdmin
        }
      ]
    },
    {
      id: 'users',
      title: '用戶管理',
      icon: 'User',
      path: '/users',
      disabled: !authStore.isAdmin,
      children: [
        {
          id: 'users-list',
          title: '用戶列表',
          path: '/users',
          disabled: !authStore.isAdmin
        },
        {
          id: 'users-create',
          title: '新增用戶',
          path: '/users/create',
          disabled: !authStore.isAdmin
        }
      ]
    },
    {
      id: 'logs',
      title: '日誌管理',
      icon: 'Document',
      path: '/logs',
      disabled: !authStore.isAdmin,
      children: [
        {
          id: 'logs-system',
          title: '系統日誌',
          path: '/logs/system',
          disabled: !authStore.isAdmin
        },
        {
          id: 'logs-audit',
          title: '審計日誌',
          path: '/logs/audit',
          disabled: !authStore.isAdmin
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
      disabled: !authStore.isAdmin,
      children: [
        {
          id: 'settings-general',
          title: '一般設定',
          path: '/settings/general',
          disabled: !authStore.isAdmin
        },
        {
          id: 'settings-security',
          title: '安全設定',
          path: '/settings/security',
          disabled: !authStore.isAdmin
        },
        {
          id: 'settings-system',
          title: '系統狀態',
          path: '/settings/system',
          disabled: !authStore.isAdmin
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
    if (item.disabled) return false
    return true
  })
})

// 切換側邊欄
const toggleSidebar = () => {
  appStore.toggleSidebar()
}

// 處理用戶命令
const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      if (authStore.isAdmin) {
        router.push('/settings')
      } else {
        ElMessage.warning('您沒有權限訪問系統設定')
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
    await ElMessageBox.confirm(
      '確定要登出嗎？',
      '確認登出',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await authStore.logout()
    ElMessage.success('登出成功')
    router.push('/login')
  } catch (error) {
    // 用戶取消登出
  }
}

// 更新活動菜單
const updateActiveMenu = () => {
  const currentPath = route.path
  
  // 精確匹配
  if (currentPath === '/dashboard') {
    activeMenu.value = '/dashboard'
    return
  }
  
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
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);
}

.sidebar-header {
  height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color);
  
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
      color: var(--el-color-primary);
      margin: 0;
      white-space: nowrap;
    }
  }
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;
  
  :deep(.el-menu-item) {
    height: 48px;
    line-height: 48px;
    
    &.is-active {
      background-color: var(--el-color-primary-light-9);
      border-right: 2px solid var(--el-color-primary);
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: var(--el-color-primary);
      }
    }
    
    &:hover {
      background-color: var(--el-color-primary-light-9);
    }
  }
  
  :deep(.el-sub-menu) {
    .el-sub-menu__title {
      height: 48px;
      line-height: 48px;
      
      &:hover {
        background-color: var(--el-color-primary-light-9);
      }
    }
  }
  
  :deep(.el-icon) {
    width: 20px;
    font-size: 18px;
  }
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
  
  .collapse-btn {
    width: 100%;
    margin-bottom: 12px;
    
    :deep(.el-icon) {
      margin-right: 8px;
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
      
      &:hover {
        background-color: var(--el-color-primary-light-9);
      }
      
      .user-details {
        flex: 1;
        min-width: 0;
        
        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .user-role {
          font-size: 12px;
          color: var(--el-text-color-regular);
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
:deep(.el-scrollbar) {
  .el-scrollbar__wrap {
    overflow-x: hidden;
  }
  
  .el-scrollbar__bar {
    &.is-vertical {
      right: 2px;
      width: 4px;
      
      .el-scrollbar__thumb {
        background: var(--el-border-color-darker);
        border-radius: 2px;
      }
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
.dark {
  .app-sidebar {
    background: var(--el-bg-color);
    border-right-color: var(--el-border-color);
  }
  
  .sidebar-header {
    border-bottom-color: var(--el-border-color);
  }
  
  .sidebar-footer {
    border-top-color: var(--el-border-color);
    background: var(--el-bg-color);
  }
}
</style>