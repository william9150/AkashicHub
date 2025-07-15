<template>
  <div class="app-layout">
    <!-- 主要佈局容器 -->
    <el-container class="layout-container">
      <!-- 側邊欄 -->
      <el-aside
        :width="sidebarWidth"
        class="layout-aside"
        :class="{ 'is-collapsed': appStore.sidebarCollapsed }"
      >
        <AppSidebar />
      </el-aside>

      <!-- 主要內容區域 -->
      <el-container class="layout-main">
        <!-- 頂部導航 -->
        <el-header class="layout-header" :class="{ 'is-fixed': appStore.settings.fixedHeader }">
          <AppHeader />
        </el-header>

        <!-- 標籤頁導航 -->
        <div v-if="appStore.settings.showTabs" class="layout-tabs">
          <AppTabs />
        </div>

        <!-- 面包屑導航 -->
        <div v-if="appStore.settings.showBreadcrumb" class="layout-breadcrumb">
          <AppBreadcrumb />
        </div>

        <!-- 主要內容 -->
        <el-main class="layout-content">
          <div class="content-wrapper">
            <router-view v-slot="{ Component }">
              <transition
                :name="appStore.settings.animation"
                mode="out-in"
                appear
              >
                <keep-alive :include="appStore.cachedViews">
                  <component
                    :is="Component"
                    :key="$route.fullPath"
                  />
                </keep-alive>
              </transition>
            </router-view>
          </div>
        </el-main>

        <!-- 底部 -->
        <el-footer v-if="appStore.settings.showFooter" class="layout-footer">
          <AppFooter />
        </el-footer>
      </el-container>
    </el-container>

    <!-- 設定面板 -->
    <AppSettings />

    <!-- 回到頂部 -->
    <el-backtop :right="40" :bottom="40" />

    <!-- 水印 -->
    <div
      v-if="appStore.settings.enableWatermark"
      class="watermark"
      :style="watermarkStyle"
    >
      {{ appStore.settings.watermarkText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import AppSidebar from '@/components/Layout/AppSidebar.vue'
import AppHeader from '@/components/Layout/AppHeader.vue'
import AppTabs from '@/components/Layout/AppTabs.vue'
import AppBreadcrumb from '@/components/Layout/AppBreadcrumb.vue'
import AppFooter from '@/components/Layout/AppFooter.vue'
import AppSettings from '@/components/Layout/AppSettings.vue'

// 狀態管理
const appStore = useAppStore()

// 計算屬性
const sidebarWidth = computed(() => {
  return appStore.sidebarCollapsed ? '64px' : '250px'
})

const watermarkStyle = computed(() => {
  return {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: '24px',
    color: 'rgba(0, 0, 0, 0.1)',
    pointerEvents: 'none',
    zIndex: 9999,
    userSelect: 'none'
  }
})

// 響應式處理
const handleResize = () => {
  appStore.updateDeviceType()
}

// 組件掛載
onMounted(() => {
  // 監聽視窗大小變化
  window.addEventListener('resize', handleResize)
  
  // 初始化設備類型
  appStore.updateDeviceType()
  
  // 移動端自動收起側邊欄
  if (appStore.isMobile) {
    appStore.setSidebarCollapsed(true)
  }
})

// 組件卸載
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.app-layout {
  height: 100vh;
  overflow: hidden;
}

.layout-container {
  height: 100%;
}

.layout-aside {
  position: relative;
  transition: width 0.3s ease;
  border-right: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
  
  &.is-collapsed {
    width: 64px !important;
  }
}

.layout-main {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.layout-header {
  position: relative;
  height: 60px;
  padding: 0;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
  z-index: 999;
  
  &.is-fixed {
    position: fixed;
    top: 0;
    right: 0;
    left: v-bind(sidebarWidth);
    transition: left 0.3s ease;
  }
}

.layout-tabs {
  height: 40px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
}

.layout-breadcrumb {
  height: 40px;
  padding: 0 20px;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color);
  display: flex;
  align-items: center;
}

.layout-content {
  position: relative;
  flex: 1;
  overflow: auto;
  background: var(--el-bg-color-page);
  padding: 20px;
  
  .content-wrapper {
    min-height: 100%;
  }
}

.layout-footer {
  height: 50px;
  padding: 0 20px;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color);
  display: flex;
  align-items: center;
  justify-content: center;
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

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.3s ease;
}

.zoom-enter-from {
  transform: scale(0.95);
  opacity: 0;
}

.zoom-leave-to {
  transform: scale(1.05);
  opacity: 0;
}

// 響應式設計
@media (max-width: 768px) {
  .layout-content {
    padding: 12px;
  }
  
  .layout-header {
    &.is-fixed {
      left: 0;
    }
  }
}

// 暗黑模式
.dark {
  .layout-aside {
    background: var(--el-bg-color);
  }
  
  .layout-header {
    background: var(--el-bg-color);
  }
  
  .layout-tabs {
    background: var(--el-bg-color);
  }
  
  .layout-breadcrumb {
    background: var(--el-bg-color-page);
  }
  
  .layout-content {
    background: var(--el-bg-color-page);
  }
  
  .layout-footer {
    background: var(--el-bg-color);
  }
}

// 水印
.watermark {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 24px;
  color: rgba(0, 0, 0, 0.1);
  pointer-events: none;
  z-index: 9999;
  user-select: none;
}
</style>