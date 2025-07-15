<template>
  <div class="settings-page">
    <div class="page-header">
      <h1>系統設定</h1>
      <p>管理系統的各項設定和配置</p>
    </div>

    <router-view />
  </div>
</template>

<script setup lang="ts">
// 設定頁面的容器組件
</script>

<style scoped>
.settings-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #666;
}
</style>