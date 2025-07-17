<template>
  <div class="app-layout">
    <!-- 主要佈局容器 -->
    <div class="layout-container d-flex">
      <!-- 側邊欄 -->
      <div
        class="layout-aside"
        :class="{ 'is-collapsed': appStore.sidebarCollapsed }"
        :style="{ width: sidebarWidth }"
      >
        <AppSidebar />
      </div>

      <!-- 主要內容區域 -->
      <div class="layout-main flex-grow-1 d-flex flex-column">
        <!-- 頂部導航 -->
        <header class="layout-header" :class="{ 'is-fixed': appStore.settings.fixedHeader }">
          <AppHeader />
        </header>

        <!-- 標籤頁導航 -->
        <div v-if="appStore.settings.showTabs" class="layout-tabs">
          <AppTabs />
        </div>

        <!-- 面包屑導航 -->
        <div v-if="appStore.settings.showBreadcrumb" class="layout-breadcrumb">
          <AppBreadcrumb />
        </div>

        <!-- 主要內容 -->
        <main class="layout-content flex-grow-1">
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
        </main>

        <!-- 底部 -->
        <footer v-if="appStore.settings.showFooter" class="layout-footer">
          <AppFooter />
        </footer>
      </div>
    </div>

    <!-- 設定面板 -->
    <AppSettings />

    <!-- 回到頂部 -->
    <button
      v-if="showBackToTop"
      type="button"
      class="btn btn-primary back-to-top"
      @click="scrollToTop"
    >
      <i class="bi bi-arrow-up"></i>
    </button>

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
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import AppSidebar from '@/components/Layout/AppSidebar.vue'
import AppHeader from '@/components/Layout/AppHeader.vue'
import AppTabs from '@/components/Layout/AppTabs.vue'
import AppBreadcrumb from '@/components/Layout/AppBreadcrumb.vue'
import AppFooter from '@/components/Layout/AppFooter.vue'
import AppSettings from '@/components/Layout/AppSettings.vue'

// 狀態管理
const appStore = useAppStore()

// 響應式數據
const showBackToTop = ref(false)

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

// 滾動處理
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
  showBackToTop.value = scrollTop > 300
}

// 回到頂部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 組件掛載
onMounted(() => {
  // 監聽視窗大小變化
  window.addEventListener('resize', handleResize)
  
  // 監聽滾動事件
  window.addEventListener('scroll', handleScroll)
  
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
  window.removeEventListener('scroll', handleScroll)
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
  border-right: 1px solid var(--bs-border-color);
  background: var(--bs-light);
  
  &.is-collapsed {
    width: 64px !important;
  }
}

.layout-main {
  position: relative;
  overflow: hidden;
}

.layout-header {
  position: relative;
  height: 60px;
  padding: 0;
  border-bottom: 1px solid var(--bs-border-color);
  background: var(--bs-light);
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
  background: var(--bs-light);
  border-bottom: 1px solid var(--bs-border-color);
}

.layout-breadcrumb {
  height: 40px;
  padding: 0 20px;
  background: var(--bs-gray-50);
  border-bottom: 1px solid var(--bs-border-color);
  display: flex;
  align-items: center;
}

.layout-content {
  position: relative;
  overflow: auto;
  background: var(--bs-gray-50);
  padding: 20px;
  
  .content-wrapper {
    min-height: 100%;
  }
}

.layout-footer {
  height: 50px;
  padding: 0 20px;
  background: var(--bs-light);
  border-top: 1px solid var(--bs-border-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

// 回到頂部按鈕
.back-to-top {
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 999;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  
  i {
    font-size: 16px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
  
  .back-to-top {
    bottom: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    
    i {
      font-size: 14px;
    }
  }
}

// 暗黑模式支援
@media (prefers-color-scheme: dark) {
  .layout-aside {
    background: var(--bs-dark);
    border-right-color: var(--bs-gray-700);
  }
  
  .layout-header {
    background: var(--bs-dark);
    border-bottom-color: var(--bs-gray-700);
  }
  
  .layout-tabs {
    background: var(--bs-dark);
    border-bottom-color: var(--bs-gray-700);
  }
  
  .layout-breadcrumb {
    background: var(--bs-gray-800);
    border-bottom-color: var(--bs-gray-700);
  }
  
  .layout-content {
    background: var(--bs-gray-800);
  }
  
  .layout-footer {
    background: var(--bs-dark);
    border-top-color: var(--bs-gray-700);
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