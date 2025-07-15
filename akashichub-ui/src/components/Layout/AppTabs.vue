<template>
  <div class="app-tabs">
    <el-tabs
      v-model="activeTab"
      type="card"
      closable
      @tab-click="handleTabClick"
      @tab-remove="handleTabRemove"
    >
      <el-tab-pane
        v-for="tab in visitedViews"
        :key="tab.name"
        :label="tab.title"
        :name="tab.name"
        :closable="tab.name !== 'Dashboard'"
      >
        <template #label>
          <div class="tab-label">
            <el-icon v-if="tab.icon" class="tab-icon">
              <component :is="tab.icon" />
            </el-icon>
            <span class="tab-title">{{ tab.title }}</span>
            <el-icon
              v-if="tab.name !== 'Dashboard'"
              class="tab-close"
              @click.stop="handleTabRemove(tab.name)"
            >
              <Close />
            </el-icon>
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 右側操作按鈕 -->
    <div class="tabs-actions">
      <el-dropdown trigger="click" @command="handleTabAction">
        <el-button class="action-btn" size="small">
          <el-icon><More /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="refresh">
              <el-icon><Refresh /></el-icon>
              刷新當前頁面
            </el-dropdown-item>
            <el-dropdown-item command="close-current" :disabled="activeTab === 'Dashboard'">
              <el-icon><Close /></el-icon>
              關閉當前標籤
            </el-dropdown-item>
            <el-dropdown-item command="close-others">
              <el-icon><RemoveFilled /></el-icon>
              關閉其他標籤
            </el-dropdown-item>
            <el-dropdown-item command="close-all">
              <el-icon><CircleCloseFilled /></el-icon>
              關閉所有標籤
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  House,
  Server,
  CollectionTag,
  User,
  Document,
  Search,
  Setting,
  InfoFilled,
  Close,
  More,
  Refresh,
  RemoveFilled,
  CircleCloseFilled
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'

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
    'Dashboard': 'House',
    'Resources': 'Server',
    'ResourcesList': 'Server',
    'ResourcesCreate': 'Server',
    'ResourcesDetail': 'Server',
    'ResourcesEdit': 'Server',
    'Tags': 'CollectionTag',
    'TagsList': 'CollectionTag',
    'TagsCreate': 'CollectionTag',
    'TagsEdit': 'CollectionTag',
    'Users': 'User',
    'UsersList': 'User',
    'UsersCreate': 'User',
    'UsersDetail': 'User',
    'UsersEdit': 'User',
    'Logs': 'Document',
    'LogsSystem': 'Document',
    'LogsAudit': 'Document',
    'Search': 'Search',
    'Settings': 'Setting',
    'SettingsGeneral': 'Setting',
    'SettingsSecurity': 'Setting',
    'SettingsSystem': 'Setting',
    'About': 'InfoFilled',
    'Profile': 'User'
  }
  
  return iconMap[routeName] || 'Document'
}

// 處理標籤點擊
const handleTabClick = (tab: any) => {
  const targetView = visitedViews.value.find(view => view.name === tab.paneName)
  if (targetView) {
    router.push(targetView.path)
  }
}

// 處理標籤移除
const handleTabRemove = (targetName: string) => {
  // 不能關閉儀表板標籤
  if (targetName === 'Dashboard') {
    ElMessage.warning('儀表板標籤不能關閉')
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
    
    ElMessage.success('頁面已刷新')
  }
}

// 關閉其他標籤
const handleCloseOthers = async () => {
  try {
    await ElMessageBox.confirm(
      '確定要關閉其他所有標籤嗎？',
      '確認操作',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
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
    
    ElMessage.success('已關閉其他標籤')
  } catch (error) {
    // 用戶取消操作
  }
}

// 關閉所有標籤
const handleCloseAll = async () => {
  try {
    await ElMessageBox.confirm(
      '確定要關閉所有標籤嗎？將會跳轉到儀表板。',
      '確認操作',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 跳轉到儀表板
    router.push('/dashboard')
    
    // 清空所有訪問記錄和緩存
    appStore.clearVisitedViews()
    appStore.clearCachedViews()
    
    // 重新添加儀表板
    appStore.addVisitedView('Dashboard', '儀表板', '/dashboard')
    appStore.addCachedView('Dashboard')
    
    ElMessage.success('已關閉所有標籤')
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
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  
  :deep(.el-tabs) {
    flex: 1;
    height: 100%;
    
    .el-tabs__header {
      margin: 0;
      border-bottom: none;
      
      .el-tabs__nav-wrap {
        &::after {
          display: none;
        }
      }
      
      .el-tabs__nav {
        border: none;
        
        .el-tabs__item {
          height: 40px;
          line-height: 40px;
          padding: 0 16px;
          border: none;
          border-right: 1px solid var(--el-border-color);
          background: var(--el-bg-color-page);
          color: var(--el-text-color-regular);
          transition: all 0.3s ease;
          
          &:hover {
            background: var(--el-color-primary-light-9);
            color: var(--el-text-color-primary);
          }
          
          &.is-active {
            background: var(--el-bg-color);
            color: var(--el-color-primary);
            border-bottom: 2px solid var(--el-color-primary);
          }
          
          &.is-closable {
            .el-tabs__item__close {
              width: 14px;
              height: 14px;
              margin-left: 8px;
              
              &:hover {
                background: var(--el-color-danger-light-9);
                color: var(--el-color-danger);
                border-radius: 50%;
              }
            }
          }
        }
      }
    }
    
    .el-tabs__content {
      display: none;
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
      background: var(--el-color-danger-light-9);
      color: var(--el-color-danger);
    }
  }
}

.tabs-actions {
  padding: 0 12px;
  border-left: 1px solid var(--el-border-color);
  
  .action-btn {
    border: none;
    background: transparent;
    padding: 8px;
    
    &:hover {
      background: var(--el-color-primary-light-9);
    }
    
    .el-icon {
      font-size: 14px;
    }
  }
}

// 滾動條樣式
:deep(.el-tabs__nav-wrap) {
  &.is-scrollable {
    .el-tabs__nav {
      &::-webkit-scrollbar {
        height: 3px;
      }
      
      &::-webkit-scrollbar-track {
        background: var(--el-bg-color-page);
      }
      
      &::-webkit-scrollbar-thumb {
        background: var(--el-border-color-darker);
        border-radius: 2px;
        
        &:hover {
          background: var(--el-border-color-dark);
        }
      }
    }
  }
}

// 右鍵菜單樣式
.contextmenu {
  position: fixed;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  
  .contextmenu-item {
    padding: 8px 16px;
    cursor: pointer;
    font-size: 13px;
    color: var(--el-text-color-primary);
    
    &:hover {
      background: var(--el-color-primary-light-9);
    }
    
    &.is-disabled {
      color: var(--el-text-color-disabled);
      cursor: not-allowed;
      
      &:hover {
        background: transparent;
      }
    }
    
    .el-icon {
      margin-right: 8px;
      font-size: 14px;
    }
  }
}

// 響應式設計
@media (max-width: 768px) {
  .app-tabs {
    :deep(.el-tabs) {
      .el-tabs__header {
        .el-tabs__nav {
          .el-tabs__item {
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
    :deep(.el-tabs) {
      .el-tabs__header {
        .el-tabs__nav {
          .el-tabs__item {
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
.dark {
  .app-tabs {
    background: var(--el-bg-color);
    border-bottom-color: var(--el-border-color);
    
    :deep(.el-tabs) {
      .el-tabs__header {
        .el-tabs__nav {
          .el-tabs__item {
            background: var(--el-bg-color-page);
            border-right-color: var(--el-border-color);
            
            &:hover {
              background: var(--el-color-primary-light-9);
            }
            
            &.is-active {
              background: var(--el-bg-color);
            }
          }
        }
      }
    }
  }
  
  .tabs-actions {
    border-left-color: var(--el-border-color);
    
    .action-btn {
      &:hover {
        background: var(--el-color-primary-light-9);
      }
    }
  }
}
</style>