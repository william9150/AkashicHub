<template>
  <div class="app-tabs">
    <div class="tabs-nav">
      <ul class="nav nav-tabs nav-tabs-custom">
        <li
          v-for="tab in visitedViews"
          :key="tab.name"
          class="nav-item"
        >
          <a
            :class="['nav-link', { active: activeTab === tab.name }]"
            href="#"
            @click.prevent="handleTabClick(tab)"
          >
            <div class="tab-label">
              <i v-if="tab.icon" :class="tab.icon" class="tab-icon"></i>
              <span class="tab-title">{{ tab.title }}</span>
              <i
                v-if="tab.name !== 'Dashboard'"
                class="bi bi-x-lg tab-close"
                @click.stop="handleTabRemove(tab.name)"
              ></i>
            </div>
          </a>
        </li>
      </ul>
    </div>

    <!-- 右側操作按鈕 -->
    <div class="tabs-actions">
      <div class="dropdown">
        <button 
          class="btn btn-sm btn-outline-secondary action-btn dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i class="bi bi-three-dots"></i>
        </button>
        <ul class="dropdown-menu">
          <li>
            <a class="dropdown-item" href="#" @click.prevent="handleTabAction('refresh')">
              <i class="bi bi-arrow-clockwise me-2"></i>
              刷新當前頁面
            </a>
          </li>
          <li>
            <a 
              :class="['dropdown-item', { disabled: activeTab === 'Dashboard' }]"
              href="#"
              @click.prevent="handleTabAction('close-current')"
            >
              <i class="bi bi-x-lg me-2"></i>
              關閉當前標籤
            </a>
          </li>
          <li>
            <a class="dropdown-item" href="#" @click.prevent="handleTabAction('close-others')">
              <i class="bi bi-dash-circle me-2"></i>
              關閉其他標籤
            </a>
          </li>
          <li>
            <a class="dropdown-item" href="#" @click.prevent="handleTabAction('close-all')">
              <i class="bi bi-x-circle me-2"></i>
              關閉所有標籤
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { showAlert, showConfirm } from '@/utils/bootstrap-alerts'

// 狀態管理
const appStore = useAppStore()

// 路由
const route = useRoute()
const router = useRouter()

// 計算屬性
const activeTab = computed({
  get: () => route.name as string,
  set: (value: string) => {
    const targetView = visitedViews.value.find(view => view.name === value)
    if (targetView) {
      router.push(targetView.path)
    }
  }
})

const visitedViews = computed(() => {
  return appStore.visitedViews.map(view => ({
    ...view,
    icon: getRouteIcon(view.name)
  }))
})

// 獲取路由圖標
const getRouteIcon = (routeName: string) => {
  const iconMap: Record<string, string> = {
    'Dashboard': 'bi bi-house',
    'Resources': 'bi bi-server',
    'ResourcesList': 'bi bi-server',
    'ResourcesCreate': 'bi bi-server',
    'ResourcesDetail': 'bi bi-server',
    'ResourcesEdit': 'bi bi-server',
    'Tags': 'bi bi-tags',
    'TagsList': 'bi bi-tags',
    'TagsCreate': 'bi bi-tags',
    'TagsEdit': 'bi bi-tags',
    'Users': 'bi bi-person',
    'UsersList': 'bi bi-person',
    'UsersCreate': 'bi bi-person',
    'UsersDetail': 'bi bi-person',
    'UsersEdit': 'bi bi-person',
    'Logs': 'bi bi-file-text',
    'LogsSystem': 'bi bi-file-text',
    'LogsAudit': 'bi bi-file-text',
    'Search': 'bi bi-search',
    'Settings': 'bi bi-gear',
    'SettingsGeneral': 'bi bi-gear',
    'SettingsSecurity': 'bi bi-gear',
    'SettingsSystem': 'bi bi-gear',
    'About': 'bi bi-info-circle',
    'Profile': 'bi bi-person'
  }
  
  return iconMap[routeName] || 'bi bi-file-text'
}

// 處理標籤點擊
const handleTabClick = (tab: any) => {
  if (tab.name) {
    router.push(tab.path)
  }
}

// 處理標籤移除
const handleTabRemove = (targetName: string) => {
  // 不能關閉儀表板標籤
  if (targetName === 'Dashboard') {
    showAlert('儀表板標籤不能關閉', 'warning')
    return
  }
  
  // 如果關閉的是當前標籤，需要跳轉到其他標籤
  if (targetName === activeTab.value) {
    const currentIndex = visitedViews.value.findIndex(view => view.name === targetName)
    const nextTab = visitedViews.value[currentIndex + 1] || visitedViews.value[currentIndex - 1]
    
    if (nextTab) {
      router.push(nextTab.path)
    }
  }
  
  // 從store中移除
  appStore.removeVisitedView(targetName)
  appStore.removeCachedView(targetName)
}

// 處理標籤操作
const handleTabAction = async (command: string) => {
  switch (command) {
    case 'refresh':
      await handleRefresh()
      break
    case 'close-current':
      handleTabRemove(activeTab.value)
      break
    case 'close-others':
      await handleCloseOthers()
      break
    case 'close-all':
      await handleCloseAll()
      break
  }
}

// 刷新當前頁面
const handleRefresh = async () => {
  const currentView = visitedViews.value.find(view => view.name === activeTab.value)
  if (currentView) {
    // 先從緩存中移除
    appStore.removeCachedView(currentView.name)
    
    // 重新加載頁面
    await nextTick()
    
    // 重新添加到緩存
    appStore.addCachedView(currentView.name)
    
    showAlert('頁面已刷新', 'success')
  }
}

// 關閉其他標籤
const handleCloseOthers = async () => {
  try {
    const confirmed = await showConfirm(
      '確定要關閉其他所有標籤嗎？',
      '確認操作'
    )
    if (!confirmed) return
    
    const currentView = visitedViews.value.find(view => view.name === activeTab.value)
    const dashboardView = visitedViews.value.find(view => view.name === 'Dashboard')
    
    // 保留當前標籤和儀表板標籤
    const viewsToKeep = [dashboardView, currentView].filter(Boolean)
    
    // 清空所有訪問記錄和緩存
    appStore.clearVisitedViews()
    appStore.clearCachedViews()
    
    // 重新添加要保留的標籤
    viewsToKeep.forEach(view => {
      if (view) {
        appStore.addVisitedView(view.name, view.title, view.path)
        appStore.addCachedView(view.name)
      }
    })
    
    showAlert('已關閉其他標籤', 'success')
  } catch (error) {
    // 用戶取消操作
  }
}

// 關閉所有標籤
const handleCloseAll = async () => {
  try {
    const confirmed = await showConfirm(
      '確定要關閉所有標籤嗎？將會跳轉到儀表板。',
      '確認操作'
    )
    if (!confirmed) return
    
    // 跳轉到儀表板
    router.push('/dashboard')
    
    // 清空所有訪問記錄和緩存
    appStore.clearVisitedViews()
    appStore.clearCachedViews()
    
    // 重新添加儀表板
    appStore.addVisitedView('Dashboard', '儀表板', '/dashboard')
    appStore.addCachedView('Dashboard')
    
    showAlert('已關閉所有標籤', 'success')
  } catch (error) {
    // 用戶取消操作
  }
}

// 監聽路由變化，自動添加到標籤
watch(
  () => route,
  (newRoute) => {
    if (newRoute.name && newRoute.meta?.title) {
      appStore.addVisitedView(
        newRoute.name as string,
        newRoute.meta.title as string,
        newRoute.path
      )
      
      // 如果設置了keepAlive，也添加到緩存
      if (newRoute.meta?.keepAlive) {
        appStore.addCachedView(newRoute.name as string)
      }
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.app-tabs {
  display: flex;
  align-items: center;
  height: 100%;
  background: var(--bs-body-bg);
  border-bottom: 1px solid var(--bs-border-color);
  
  .tabs-nav {
    flex: 1;
    height: 100%;
    overflow-x: auto;
    
    .nav-tabs-custom {
      border-bottom: none;
      height: 100%;
      flex-wrap: nowrap;
      
      .nav-item {
        .nav-link {
          height: 40px;
          line-height: 40px;
          padding: 0 16px;
          border: none;
          border-right: 1px solid var(--bs-border-color);
          background: var(--bs-light);
          color: var(--bs-secondary);
          transition: all 0.3s ease;
          border-radius: 0;
          white-space: nowrap;
          
          &:hover {
            background: var(--bs-primary-bg-subtle);
            color: var(--bs-primary);
          }
          
          &.active {
            background: var(--bs-body-bg);
            color: var(--bs-primary);
            border-bottom: 2px solid var(--bs-primary);
          }
        }
      }
    }
  }
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
  
  .tab-icon {
    font-size: 14px;
  }
  
  .tab-title {
    font-size: 13px;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .tab-close {
    font-size: 12px;
    margin-left: 4px;
    padding: 2px;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: var(--bs-danger-bg-subtle);
      color: var(--bs-danger);
    }
  }
}

.tabs-actions {
  padding: 0 12px;
  border-left: 1px solid var(--bs-border-color);
  
  .action-btn {
    border: none;
    background: transparent;
    padding: 8px;
    
    &:hover {
      background: var(--bs-primary-bg-subtle);
    }
    
    i {
      font-size: 14px;
    }
  }
}

// 滾動條樣式
.tabs-nav {
  &::-webkit-scrollbar {
    height: 3px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bs-light);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--bs-border-color-translucent);
    border-radius: 2px;
    
    &:hover {
      background: var(--bs-border-color);
    }
  }
}

// 響應式設計
@media (max-width: 768px) {
  .app-tabs {
    .tabs-nav {
      .nav-tabs-custom {
        .nav-item {
          .nav-link {
            padding: 0 12px;
            
            .tab-label {
              .tab-title {
                max-width: 80px;
              }
            }
          }
        }
      }
    }
  }
  
  .tabs-actions {
    padding: 0 8px;
  }
}

@media (max-width: 480px) {
  .app-tabs {
    .tabs-nav {
      .nav-tabs-custom {
        .nav-item {
          .nav-link {
            padding: 0 8px;
            
            .tab-label {
              .tab-icon {
                display: none;
              }
              
              .tab-title {
                max-width: 60px;
              }
            }
          }
        }
      }
    }
  }
}

// 暗黑模式
[data-bs-theme="dark"] {
  .app-tabs {
    background: var(--bs-body-bg);
    border-bottom-color: var(--bs-border-color);
    
    .tabs-nav {
      .nav-tabs-custom {
        .nav-item {
          .nav-link {
            background: var(--bs-dark);
            border-right-color: var(--bs-border-color);
            
            &:hover {
              background: var(--bs-primary-bg-subtle);
            }
            
            &.active {
              background: var(--bs-body-bg);
            }
          }
        }
      }
    }
  }
  
  .tabs-actions {
    border-left-color: var(--bs-border-color);
    
    .action-btn {
      &:hover {
        background: var(--bs-primary-bg-subtle);
      }
    }
  }
}
</style>