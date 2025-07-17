<template>
  <div class="app-header">
    <!-- 左側區域 -->
    <div class="header-left">
      <!-- 菜單切換按鈕 -->
      <button
        type="button"
        class="btn btn-link menu-toggle p-2"
        @click="toggleSidebar"
      >
        <i :class="appStore.sidebarCollapsed ? 'bi bi-arrow-bar-right' : 'bi bi-arrow-bar-left'"></i>
      </button>
      
      <!-- 面包屑導航 -->
      <div v-if="appStore.settings.showBreadcrumb" class="breadcrumb-container">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li
              v-for="(item, index) in breadcrumbs"
              :key="item.title"
              class="breadcrumb-item"
              :class="{ active: index === breadcrumbs.length - 1 }"
            >
              <router-link
                v-if="index < breadcrumbs.length - 1"
                :to="item.path"
                class="text-decoration-none"
              >
                {{ item.title }}
              </router-link>
              <span v-else>{{ item.title }}</span>
            </li>
          </ol>
        </nav>
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
        <button
          type="button"
          class="btn btn-link action-btn p-2"
          data-bs-toggle="tooltip"
          data-bs-placement="bottom"
          title="全屏/退出全屏"
          @click="toggleFullscreen"
        >
          <i :class="isFullscreen ? 'bi bi-arrows-angle-contract' : 'bi bi-arrows-fullscreen'"></i>
        </button>

        <!-- 刷新頁面 -->
        <button
          type="button"
          class="btn btn-link action-btn p-2"
          data-bs-toggle="tooltip"
          data-bs-placement="bottom"
          title="刷新頁面"
          :disabled="refreshing"
          @click="refreshPage"
        >
          <i class="bi bi-arrow-clockwise" :class="{ 'spinner-border spinner-border-sm': refreshing }"></i>
        </button>

        <!-- 主題切換 -->
        <button
          type="button"
          class="btn btn-link action-btn p-2"
          data-bs-toggle="tooltip"
          data-bs-placement="bottom"
          title="切換主題"
          @click="toggleTheme"
        >
          <i :class="appStore.isDarkMode ? 'bi bi-sun' : 'bi bi-moon'"></i>
        </button>

        <!-- 通知中心 -->
        <div class="dropdown">
          <button
            type="button"
            class="btn btn-link action-btn p-2 position-relative"
            data-bs-toggle="dropdown"
            data-bs-placement="bottom"
            title="通知中心"
          >
            <i class="bi bi-bell"></i>
            <span
              v-if="unreadCount > 0"
              class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            >
              {{ unreadCount }}
            </span>
          </button>
          <div class="dropdown-menu dropdown-menu-end notification-dropdown">
            <div class="notification-header">
              <span>通知中心</span>
              <button
                v-if="unreadCount > 0"
                type="button"
                class="btn btn-link btn-sm p-0"
                @click="markAllAsRead"
              >
                全部已讀
              </button>
            </div>
            <hr class="dropdown-divider" />
            <div class="notification-list">
              <div
                v-for="notification in notifications"
                :key="notification.id"
                class="notification-item"
                :class="{ 'is-unread': !notification.read }"
                @click="handleNotificationClick(notification)"
              >
                <div class="notification-icon">
                  <i :class="getNotificationIconClass(notification.type)" :style="{ color: getNotificationColor(notification.type) }"></i>
                </div>
                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-message">{{ notification.message }}</div>
                  <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
                </div>
              </div>
              <div v-if="notifications.length === 0" class="notification-empty">
                <div class="text-center py-4">
                  <i class="bi bi-bell text-muted" style="font-size: 2rem;"></i>
                  <p class="text-muted mt-2">暫無通知</p>
                </div>
              </div>
            </div>
            <hr class="dropdown-divider" />
            <div class="notification-footer">
              <button type="button" class="btn btn-link btn-sm" @click="goToNotifications">
                查看全部
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 用戶菜單 -->
      <div class="dropdown">
        <div class="user-menu" data-bs-toggle="dropdown" data-bs-placement="bottom">
          <div class="user-avatar">
            <img
              v-if="userInfo?.avatar"
              :src="userInfo.avatar"
              class="avatar-img"
              alt="用戶頭像"
            />
            <div v-else class="avatar-placeholder">
              <i class="bi bi-person-fill"></i>
            </div>
          </div>
          <div class="user-info">
            <div class="user-name">{{ userInfo?.displayName }}</div>
            <div class="user-role">{{ userInfo?.role }}</div>
          </div>
          <i class="bi bi-chevron-down dropdown-icon"></i>
        </div>
        <ul class="dropdown-menu dropdown-menu-end">
          <li>
            <button type="button" class="dropdown-item" @click="handleUserCommand('profile')">
              <i class="bi bi-person me-2"></i>
              個人資料
            </button>
          </li>
          <li>
            <button
              type="button"
              class="dropdown-item"
              :disabled="!authStore.isAdmin"
              @click="handleUserCommand('settings')"
            >
              <i class="bi bi-gear me-2"></i>
              系統設定
            </button>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li>
            <button type="button" class="dropdown-item" @click="handleUserCommand('logout')">
              <i class="bi bi-box-arrow-right me-2"></i>
              登出
            </button>
          </li>
        </ul>
      </div>

      <!-- 設定面板觸發按鈕 -->
      <button
        type="button"
        class="btn btn-link action-btn settings-trigger p-2"
        data-bs-toggle="tooltip"
        data-bs-placement="bottom"
        title="個人化設定"
        @click="showSettings"
      >
        <i class="bi bi-tools"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showAlert, showConfirm } from '@/utils/bootstrap-alerts'
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

// 獲取通知圖標類別
const getNotificationIconClass = (type: string) => {
  switch (type) {
    case 'success':
      return 'bi bi-check-circle-fill'
    case 'warning':
      return 'bi bi-exclamation-triangle-fill'
    case 'error':
      return 'bi bi-x-circle-fill'
    default:
      return 'bi bi-info-circle-fill'
  }
}

// 獲取通知顏色
const getNotificationColor = (type: string) => {
  switch (type) {
    case 'success':
      return '#198754'
    case 'warning':
      return '#ffc107'
    case 'error':
      return '#dc3545'
    default:
      return '#0d6efd'
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
      'warning'
    )
    
    if (confirmed) {
      await authStore.logout()
      showAlert('登出成功', 'success')
      router.push('/login')
    }
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
  background: var(--bs-light);
  border-bottom: 1px solid var(--bs-border-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  
  .menu-toggle {
    border: none;
    background: transparent;
    color: var(--bs-gray-600);
    
    &:hover {
      background: var(--bs-primary-bg-subtle);
      color: var(--bs-primary);
    }
  }
  
  .breadcrumb-container {
    .breadcrumb {
      font-size: 14px;
      
      .breadcrumb-item {
        a {
          color: var(--bs-gray-600);
          
          &:hover {
            color: var(--bs-primary);
          }
        }
        
        &.active {
          color: var(--bs-gray-900);
          font-weight: 500;
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
      border: none;
      background: transparent;
      color: var(--bs-gray-600);
      
      &:hover {
        background: var(--bs-primary-bg-subtle);
        color: var(--bs-primary);
      }
      
      &.settings-trigger {
        margin-left: 8px;
        border-left: 1px solid var(--bs-border-color);
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
      background: var(--bs-primary-bg-subtle);
    }
    
    .user-avatar {
      .avatar-img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
      }
      
      .avatar-placeholder {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--bs-gray-300);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--bs-gray-600);
        font-size: 16px;
      }
    }
    
    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      
      .user-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--bs-gray-900);
        line-height: 1.2;
      }
      
      .user-role {
        font-size: 12px;
        color: var(--bs-gray-600);
        line-height: 1.2;
      }
    }
    
    .dropdown-icon {
      font-size: 12px;
      color: var(--bs-gray-600);
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
    color: var(--bs-gray-900);
  }
  
  .notification-list {
    max-height: 280px;
    overflow-y: auto;
    
    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--bs-border-color);
      cursor: pointer;
      transition: background-color 0.3s ease;
      position: relative;
      
      &:hover {
        background: var(--bs-gray-50);
      }
      
      &.is-unread {
        background: var(--bs-primary-bg-subtle);
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: var(--bs-primary);
        }
      }
      
      .notification-icon {
        flex-shrink: 0;
        margin-top: 2px;
        font-size: 16px;
      }
      
      .notification-content {
        flex: 1;
        min-width: 0;
        
        .notification-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--bs-gray-900);
          margin-bottom: 4px;
        }
        
        .notification-message {
          font-size: 13px;
          color: var(--bs-gray-600);
          line-height: 1.4;
          margin-bottom: 4px;
          word-break: break-word;
        }
        
        .notification-time {
          font-size: 12px;
          color: var(--bs-gray-500);
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
    border-top: 1px solid var(--bs-border-color);
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

// 暗黑模式支援
@media (prefers-color-scheme: dark) {
  .app-header {
    background: var(--bs-dark);
    border-bottom-color: var(--bs-gray-700);
  }
  
  .header-left {
    .menu-toggle {
      color: var(--bs-gray-300);
      
      &:hover {
        background: var(--bs-primary-bg-subtle);
        color: var(--bs-primary);
      }
    }
  }
  
  .header-right {
    .quick-actions {
      .action-btn {
        color: var(--bs-gray-300);
        
        &:hover {
          background: var(--bs-primary-bg-subtle);
          color: var(--bs-primary);
        }
      }
    }
    
    .user-menu {
      &:hover {
        background: var(--bs-primary-bg-subtle);
      }
      
      .user-info {
        .user-name {
          color: var(--bs-gray-100);
        }
      }
    }
  }
}
</style>