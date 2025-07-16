<template>
  <div class="simple-dashboard">
    <h1>🎯 儀表板</h1>
    <p>歡迎來到 AkashicHub 儀表板！</p>
    
    <div class="dashboard-content">
      <el-card>
        <h2>系統狀態</h2>
        <p>✅ 系統運行正常</p>
        <p>📊 資源總數: 156</p>
        <p>👥 用戶總數: 24</p>
      </el-card>
      
      <el-card style="margin-top: 20px;">
        <h2>快速操作</h2>
        <el-button type="primary" @click="goToResources">管理資源</el-button>
        <el-button type="success" @click="goToUsers">管理用戶</el-button>
        <el-button type="info" @click="goToTags">管理標籤</el-button>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToResources = () => {
  router.push('/resources')
}

const goToUsers = () => {
  router.push('/users')
}

const goToTags = () => {
  router.push('/tags')
}
</script>

<style scoped>
.simple-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #409eff;
  text-align: center;
  margin-bottom: 20px;
}

.dashboard-content {
  margin-top: 20px;
}

.el-button {
  margin-right: 10px;
}
</style>