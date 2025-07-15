<template>
  <router-view v-slot="{ Component }">
    <transition name="fade-transform" mode="out-in">
      <keep-alive :include="cachedViews">
        <component :is="Component" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'

// 獲取應用狀態
const appStore = useAppStore()

// 計算需要緩存的視圖
const cachedViews = computed(() => appStore.cachedViews)

// 初始化應用
onMounted(() => {
  appStore.initializeApp()
})
</script>

<style lang="scss">
// 全域樣式重置
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--el-text-color-primary);
  background-color: var(--el-bg-color);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100vh;
  overflow: hidden;
}

// 頁面切換動畫
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

// 滾動條樣式
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--el-bg-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 4px;
  
  &:hover {
    background: var(--el-border-color-darker);
  }
}

// 響應式斷點
@media (max-width: 768px) {
  html {
    font-size: 14px;
  }
  
  body {
    font-size: 13px;
  }
}

// 暗黑模式支援
html.dark {
  color-scheme: dark;
  
  body {
    background-color: var(--el-bg-color);
    color: var(--el-text-color-primary);
  }
}

// 印刷樣式
@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
}
</style>