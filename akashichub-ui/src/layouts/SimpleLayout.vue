<template>
  <div class="app-layout">
    <!-- 固定導航欄 -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
      <div class="container-fluid">
        <!-- 品牌標誌 -->
        <a class="navbar-brand" href="/">
          <i class="bi bi-folder2-open"></i>
          AkashicHub
        </a>

        <!-- 手機版切換按鈕 -->
        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- 導航菜單 -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link to="/" class="nav-link">首頁</router-link>
            </li>
            <li class="nav-item" v-if="isLoggedIn">
              <router-link to="/dashboard" class="nav-link">儀表板</router-link>
            </li>
            <li class="nav-item" v-if="isLoggedIn">
              <router-link to="/resources" class="nav-link">資源</router-link>
            </li>
            <li class="nav-item" v-if="isLoggedIn">
              <router-link to="/tags" class="nav-link">標籤</router-link>
            </li>
            <li class="nav-item" v-if="isLoggedIn && isSuperAdmin">
              <router-link to="/users" class="nav-link">管理</router-link>
            </li>
          </ul>

          <!-- 右側用戶資訊 -->
          <ul class="navbar-nav ms-auto">
            <!-- 未登入狀態 -->
            <li class="nav-item" v-if="!isLoggedIn">
              <router-link to="/login" class="nav-link">
                <i class="bi bi-box-arrow-in-right"></i>
                登入
              </router-link>
            </li>
            
            <!-- 已登入狀態 -->
            <template v-if="isLoggedIn">
              <li class="nav-item">
                <router-link to="/profile" class="nav-link">
                  <i class="bi bi-person"></i>
                  {{ currentUser?.DisplayName || currentUser?.LoginAccount || '用戶' }}
                </router-link>
              </li>
              <li class="nav-item">
                <button @click="logout" class="nav-link btn btn-link text-light">
                  <i class="bi bi-box-arrow-right"></i>
                  登出
                </button>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>

    <!-- 主要內容區域 -->
    <main class="main-content">
      <div class="container-fluid">
        <slot />
      </div>
    </main>

    <!-- 底部 -->
    <footer class="bg-dark text-light py-3 mt-5">
      <div class="container text-center">
        <p class="mb-0">&copy; 2024 AkashicHub - IT 資源管理系統</p>
      </div>
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

// 檢查是否為SuperAdmin
const isSuperAdmin = computed(() => {
  if (!currentUser.value) return false
  const role = currentUser.value.Role
  return role === 'SuperAdmin'
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

const logout = () => {
  if (confirm('確定要登出嗎？')) {
    localStorage.removeItem('akashichub_token')
    localStorage.removeItem('akashichub_user')
    currentUser.value = null
    router.push('/login')
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 80px; /* 為固定navbar留出空間 */
  min-height: calc(100vh - 140px);
}

.navbar-brand {
  font-weight: bold;
  font-size: 1.25rem;
}

.navbar-brand i {
  margin-right: 0.5rem;
}

/* 確保router-link-active樣式 */
.router-link-active {
  color: #fff !important;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
}

/* 按鈕樣式調整 */
.btn-link {
  border: none;
  background: none;
  padding: 0.5rem 1rem;
  text-decoration: none;
}

.btn-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .main-content {
    padding-top: 70px;
  }
  
  .navbar-nav .nav-link {
    padding: 0.75rem 1rem;
  }
}
</style>