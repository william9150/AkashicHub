<template>
  <div class="app-header">
    <!-- 左側區域 -->
    <div class="header-left">
      <!-- 菜單切換按鈕 -->
      <el-button
        class="menu-toggle"
        :icon="appStore.sidebarCollapsed ? 'Expand' : 'Fold'"
        @click="toggleSidebar"
      />
      
      <!-- 面包屑導航 -->
      <div v-if="appStore.settings.showBreadcrumb" class="breadcrumb-container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item
            v-for="item in breadcrumbs"
            :key="item.title"
            :to="item.path"
          >
            {{ item.title }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <!-- 中間區域 -->
    <div class="header-center">
      <!-- 全局搜索 -->
      <GlobalSearch />
    </div>

    <!-- 右側區域 -->
    <div class="header-right">
      <!-- 快捷操作 -->
      <div class="quick-actions">
        <!-- 全屏切換 -->
        <el-tooltip content="全屏/退出全屏" placement="bottom">
          <el-button
            class="action-btn"
            :icon="isFullscreen ? 'Aim' : 'FullScreen'"
            @click="toggleFullscreen"
          />
        </el-tooltip>

        <!-- 刷新頁面 -->
        <el-tooltip content="刷新頁面" placement="bottom">
          <el-button
            class="action-btn"
            icon="Refresh"
            :loading="refreshing"
            @click="refreshPage"
          />
        </el-tooltip>

        <!-- 主題切換 -->
        <el-tooltip content="切換主題" placement="bottom">
          <el-button
            class="action-btn"
            :icon="appStore.isDarkMode ? 'Sunny' : 'Moon'"
            @click="toggleTheme"
          />
        </el-tooltip>

        <!-- 通知中心 -->
        <el-dropdown trigger="click" @command="handleNotificationCommand">
          <el-badge :value="unreadCount" :hidden="unreadCount === 0">
            <el-button class="action-btn" icon="Bell" />
          </el-badge>
          <template #dropdown>
            <el-dropdown-menu class="notification-dropdown">
              <div class="notification-header">
                <span>通知中心</span>
                <el-button
                  v-if="unreadCount > 0"
                  link
                  type="primary"
                  size="small"
                  @click="markAllAsRead"
                >
                  全部已讀
                </el-button>
              </div>
              <el-divider style="margin: 8px 0" />
              <div class="notification-list">
                <div
                  v-for="notification in notifications"
                  :key="notification.id"
                  class="notification-item"
                  :class="{ 'is-unread': !notification.read }"
                  @click="handleNotificationClick(notification)"
                >
                  <div class="notification-icon">
                    <el-icon :color="getNotificationColor(notification.type)">
                      <component :is="getNotificationIcon(notification.type)" />
                    </el-icon>
                  </div>
                  <div class="notification-content">
                    <div class="notification-title">{{ notification.title }}</div>
                    <div class="notification-message">{{ notification.message }}</div>
                    <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
                  </div>
                </div>
                <div v-if="notifications.length === 0" class="notification-empty">
                  <el-empty description="暫無通知" :image-size="60" />
                </div>
              </div>
              <el-divider style="margin: 8px 0" />
              <div class="notification-footer">
                <el-button link type="primary" @click="goToNotifications">
                  查看全部
                </el-button>
              </div>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 用戶菜單 -->
      <el-dropdown trigger="click" @command="handleUserCommand">
        <div class="user-menu">
          <el-avatar :size="32" :src="userInfo?.avatar">
            <el-icon><UserFilled /></el-icon>
          </el-avatar>
          <div class="user-info">
            <div class="user-name">{{ userInfo?.displayName }}</div>
            <div class="user-role">{{ userInfo?.role }}</div>
          </div>
          <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              個人資料
            </el-dropdown-item>
            <el-dropdown-item command="settings" :disabled="!authStore.isAdmin">
              <el-icon><Setting /></el-icon>
              系統設定
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              登出
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 設定面板觸發按鈕 -->
      <el-tooltip content="個人化設定" placement="bottom">
        <el-button
          class="action-btn settings-trigger"
          icon="Tools"
          @click="showSettings"
        />
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Expand,
  Fold,
  FullScreen,
  Aim,
  Refresh,
  Moon,
  Sunny,
  Bell,
  User,
  UserFilled,
  Setting,
  SwitchButton,
  ArrowDown,
  Tools,
  InfoFilled,
  WarningFilled,
  CircleCheckFilled,
  CircleCloseFilled
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import GlobalSearch from '@/components/Search/GlobalSearch.vue'

// 狀態管理
const appStore = useAppStore()
const authStore = useAuthStore()

// 路由
const route = useRoute()
const router = useRouter()

// 響應式數據
const refreshing = ref(false)
const isFullscreen = ref(false)
const notifications = ref([
  {
    id: 1,
    type: 'info',
    title: '系統通知',
    message: '歡迎使用阿卡西 IT 資源管理系統',
    read: false,
    createdAt: new Date()
  },
  {
    id: 2,
    type: 'success',
    title: '操作成功',
    message: '資源配置已更新完成',
    read: true,
    createdAt: new Date(Date.now() - 3600000)
  }
])

// 計算屬性
const userInfo = computed(() => authStore.userInfo)
const breadcrumbs = computed(() => appStore.breadcrumbs)
const unreadCount = computed(() => 
  notifications.value.filter(n => !n.read).length
)

// 切換側邊欄
const toggleSidebar = () => {
  appStore.toggleSidebar()
}


// 切換全屏
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 刷新頁面
const refreshPage = async () => {
  refreshing.value = true
  try {
    // 這裡可以調用當前頁面的刷新方法
    await new Promise(resolve => setTimeout(resolve, 1000))
    location.reload()
  } finally {
    refreshing.value = false
  }
}

// 切換主題
const toggleTheme = () => {
  appStore.toggleTheme()
}

// 顯示設定面板
const showSettings = () => {
  appStore.setSettingsVisible(true)
}

// 處理通知命令
const handleNotificationCommand = (command: string) => {
  console.log('Notification command:', command)
}

// 標記所有通知為已讀
const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true
  })
}

// 處理通知點擊
const handleNotificationClick = (notification: any) => {
  if (!notification.read) {
    notification.read = true
  }
  
  // 這裡可以根據通知類型進行不同的處理
  console.log('Notification clicked:', notification)
}

// 前往通知頁面
const goToNotifications = () => {
  router.push('/notifications')
}

// 獲取通知圖標
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return 'CircleCheckFilled'
    case 'warning':
      return 'WarningFilled'
    case 'error':
      return 'CircleCloseFilled'
    default:
      return 'InfoFilled'
  }
}

// 獲取通知顏色
const getNotificationColor = (type: string) => {
  switch (type) {
    case 'success':
      return '#67c23a'
    case 'warning':
      return '#e6a23c'
    case 'error':
      return '#f56c6c'
    default:
      return '#409eff'
  }
}

// 格式化時間
const formatTime = (time: Date) => {
  return formatDistanceToNow(time, { 
    addSuffix: true, 
    locale: zhTW 
  })
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

// 監聽全屏狀態變化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// 組件掛載
onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

// 組件卸載
onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style lang="scss" scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  
  .menu-toggle {
    padding: 8px;
    border: none;
    background: transparent;
    
    &:hover {
      background: var(--el-color-primary-light-9);
    }
  }
  
  .breadcrumb-container {
    :deep(.el-breadcrumb) {
      font-size: 14px;
      
      .el-breadcrumb__item {
        &:not(:last-child) {
          .el-breadcrumb__inner {
            color: var(--el-text-color-regular);
            
            &:hover {
              color: var(--el-color-primary);
            }
          }
        }
        
        &:last-child {
          .el-breadcrumb__inner {
            color: var(--el-text-color-primary);
            font-weight: 500;
          }
        }
      }
    }
  }
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 400px;
  
  .search-container {
    width: 100%;
    
    .search-input {
      :deep(.el-input__wrapper) {
        border-radius: 20px;
        background: var(--el-bg-color-page);
        border: 1px solid var(--el-border-color-lighter);
        
        &:hover {
          border-color: var(--el-border-color);
        }
        
        &.is-focus {
          border-color: var(--el-color-primary);
        }
      }
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .quick-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .action-btn {
      padding: 8px;
      border: none;
      background: transparent;
      
      &:hover {
        background: var(--el-color-primary-light-9);
      }
      
      &.settings-trigger {
        margin-left: 8px;
        border-left: 1px solid var(--el-border-color);
        padding-left: 16px;
      }
    }
  }
  
  .user-menu {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    
    &:hover {
      background: var(--el-color-primary-light-9);
    }
    
    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      
      .user-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        line-height: 1.2;
      }
      
      .user-role {
        font-size: 12px;
        color: var(--el-text-color-regular);
        line-height: 1.2;
      }
    }
    
    .dropdown-icon {
      font-size: 12px;
      color: var(--el-text-color-regular);
      transition: transform 0.3s ease;
    }
  }
}

// 通知下拉菜單樣式
.notification-dropdown {
  width: 320px;
  max-height: 400px;
  
  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
  
  .notification-list {
    max-height: 280px;
    overflow-y: auto;
    
    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      cursor: pointer;
      transition: background-color 0.3s ease;
      
      &:hover {
        background: var(--el-bg-color-page);
      }
      
      &.is-unread {
        background: var(--el-color-primary-light-9);
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: var(--el-color-primary);
        }
      }
      
      .notification-icon {
        flex-shrink: 0;
        margin-top: 2px;
      }
      
      .notification-content {
        flex: 1;
        min-width: 0;
        
        .notification-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }
        
        .notification-message {
          font-size: 13px;
          color: var(--el-text-color-regular);
          line-height: 1.4;
          margin-bottom: 4px;
          word-break: break-word;
        }
        
        .notification-time {
          font-size: 12px;
          color: var(--el-text-color-placeholder);
        }
      }
    }
    
    .notification-empty {
      padding: 20px;
      text-align: center;
    }
  }
  
  .notification-footer {
    padding: 12px 16px;
    text-align: center;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

// 響應式設計
@media (max-width: 768px) {
  .app-header {
    padding: 0 12px;
  }
  
  .header-left {
    gap: 8px;
    
    .breadcrumb-container {
      display: none;
    }
  }
  
  .header-center {
    max-width: 200px;
  }
  
  .header-right {
    gap: 8px;
    
    .quick-actions {
      gap: 4px;
      
      .action-btn {
        padding: 6px;
      }
    }
    
    .user-menu {
      padding: 4px 8px;
      
      .user-info {
        display: none;
      }
    }
  }
}

@media (max-width: 480px) {
  .header-center {
    display: none;
  }
  
  .quick-actions {
    .action-btn {
      &:not(:first-child):not(:last-child) {
        display: none;
      }
    }
  }
}

// 暗黑模式
.dark {
  .app-header {
    background: var(--el-bg-color);
    border-bottom-color: var(--el-border-color);
  }
  
  .header-left {
    .menu-toggle {
      &:hover {
        background: var(--el-color-primary-light-9);
      }
    }
  }
  
  .header-center {
    .search-input {
      :deep(.el-input__wrapper) {
        background: var(--el-bg-color-page);
        border-color: var(--el-border-color-lighter);
      }
    }
  }
  
  .header-right {
    .quick-actions {
      .action-btn {
        &:hover {
          background: var(--el-color-primary-light-9);
        }
      }
    }
    
    .user-menu {
      &:hover {
        background: var(--el-color-primary-light-9);
      }
    }
  }
}
</style>