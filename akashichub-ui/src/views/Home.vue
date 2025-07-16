<template>
  <div class="home-page">
    <div class="container">
      <h1>🎉 AkashicHub 啟動成功！</h1>
      <p>歡迎使用 AkashicHub - IT 內部資源檢索系統</p>
      
      <div class="quick-actions">
        <el-button type="primary" @click="goToDashboard">
          <el-icon><Odometer /></el-icon>
          前往儀表板
        </el-button>
        <el-button @click="goToResources">
          <el-icon><Service /></el-icon>
          資源管理
        </el-button>
        <el-button @click="goToUsers">
          <el-icon><User /></el-icon>
          用戶管理
        </el-button>
        <el-button v-if="!isAuthenticated" @click="goToLogin">
          <el-icon><User /></el-icon>
          登入系統
        </el-button>
        <el-button v-if="isAuthenticated" @click="goToProfile">
          <el-icon><UserFilled /></el-icon>
          個人資料
        </el-button>
      </div>
      
      <div class="system-info">
        <h3>系統資訊</h3>
        <ul>
          <li>應用版本: v1.0.0</li>
        <li>構建時間: {{ buildTime }}</li>
<li>環境: {{ MODE }}</li>
 <li>API 地址: {{ VITE_API_BASE_URL }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Odometer, Service, User, UserFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const { MODE, VITE_API_BASE_URL } = import.meta.env   // ✅ 取出環境變數
const buildTime = new Date().toLocaleString()         // ✅ 只計算一次

const router = useRouter()
const authStore = useAuthStore()

// 檢查用戶是否已登入
const isAuthenticated = computed(() => authStore.isAuthenticated)

const goToDashboard = () => {
  // 檢查用戶是否已登入
  const token = localStorage.getItem('akashichub_token')
  if (!token) {
    router.push('/login?redirect=/dashboard')
  } else {
    router.push('/dashboard')
  }
}

const goToResources = () => {
  router.push('/resources')
}

const goToUsers = () => {
  router.push('/users')
}

const goToLogin = () => {
  router.push('/login')
}

const goToProfile = () => {
  router.push('/profile')
}
</script>

<style scoped>
.home-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.container {
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5em;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

p {
  font-size: 1.2em;
  margin-bottom: 30px;
  opacity: 0.9;
}

.quick-actions {
  margin: 30px 0;
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.quick-actions .el-button {
  padding: 12px 24px;
  font-size: 16px;
}

.system-info {
  margin-top: 40px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  text-align: left;
}

.system-info h3 {
  margin: 0 0 15px 0;
  text-align: center;
}

.system-info ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.system-info li {
  padding: 5px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.system-info li:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .container {
    padding: 20px;
    margin: 20px;
  }
  
  h1 {
    font-size: 2em;
  }
  
  .quick-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .quick-actions .el-button {
    width: 200px;
  }
}
</style>