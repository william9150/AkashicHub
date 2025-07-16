<template>
  <div class="simple-layout">
    <!-- 簡單頂部導航 -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <h2>🗂️ AkashicHub</h2>
        </div>
        <nav class="nav">
          <router-link to="/">首頁</router-link>
          <router-link to="/dashboard" v-if="isLoggedIn">儀表板</router-link>
          <router-link to="/resources" v-if="isLoggedIn">資源</router-link>
          <router-link to="/tags" v-if="isLoggedIn">標籤</router-link>
          <router-link to="/users" v-if="isLoggedIn && canEditUsers">用戶群</router-link>
          
          <!-- 未登入狀態 -->
          <router-link to="/login" v-if="!isLoggedIn" class="login-btn">登入</router-link>
          
          <!-- 已登入狀態 -->
          <template v-if="isLoggedIn">
            <router-link to="/profile" class="profile-link">
              {{ currentUser?.DisplayName || currentUser?.LoginAccount || '用戶' }}
            </router-link>
            <button @click="logout" class="logout-btn">登出</button>
          </template>
        </nav>
      </div>
    </header>

    <!-- 主要內容 -->
    <main class="main-content">
      <slot />
    </main>

    <!-- 簡單底部 -->
    <footer class="footer">
      <p>&copy; 2024 AkashicHub - IT 資源管理系統</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentUser = ref(null)

// 簡單的登入狀態檢查
const isLoggedIn = computed(() => {
  return !!localStorage.getItem('akashichub_token')
})

// 檢查用戶權限
const canEditUsers = computed(() => {
  if (!currentUser.value) return false
  const role = currentUser.value.Role
  return role === 'SuperAdmin' || role === 'ITManager'
})

// 載入用戶資訊
const loadUserInfo = () => {
  try {
    const userStr = localStorage.getItem('akashichub_user')
    if (userStr) {
      currentUser.value = JSON.parse(userStr)
    }
  } catch (error) {
    console.warn('Failed to parse user info:', error)
  }
}

const goToProfile = () => {
  router.push('/profile')
}

const logout = () => {
  localStorage.removeItem('akashichub_token')
  localStorage.removeItem('akashichub_user')
  currentUser.value = null
  router.push('/login')
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.simple-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #409eff;
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.logo h2 {
  margin: 0;
  color: white;
}

.nav {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav a,
.nav .profile-link {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background 0.3s;
}

.nav a:hover,
.nav a.router-link-active,
.nav .profile-link:hover {
  background: rgba(255, 255, 255, 0.2);
}

.login-btn {
  background: #67c23a;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background 0.3s;
}

.login-btn:hover {
  background: #85ce61;
}

.logout-btn {
  background: #f56c6c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: #f78989;
}

.profile-link {
  font-weight: 500;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.main-content {
  flex: 1;
  background: #f5f5f5;
  min-height: calc(100vh - 120px);
}

.footer {
  background: #303133;
  color: white;
  text-align: center;
  padding: 20px;
}

.footer p {
  margin: 0;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 10px 0;
  }
  
  .nav {
    margin-top: 10px;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .main-content {
    min-height: calc(100vh - 140px);
  }
}
</style>