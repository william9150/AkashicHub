<template>
  <div id="app">
    <router-view v-slot="{ Component, route }">
      <!-- 根據路由決定是否使用佈局 -->
      <SimpleLayout v-if="shouldUseLayout(route)">
        <component :is="Component" />
      </SimpleLayout>
      <component v-else :is="Component" />
    </router-view>
  </div>
</template>

<script setup lang="ts">
import SimpleLayout from '@/layouts/SimpleLayout.vue'

// 決定是否使用佈局
const shouldUseLayout = (route: any) => {
  // 這些頁面不使用佈局
  const noLayoutPages = ['Login', 'Test', 'NotFound']
  return !noLayoutPages.includes(route.name)
}
</script>

<style>
/* 全域樣式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
  background: #f5f5f5;
}

#app {
  min-height: 100vh;
}

/* Element Plus 的一些樣式調整 */
.el-button {
  border-radius: 4px;
}

.el-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>