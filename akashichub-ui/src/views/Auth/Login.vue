<template>
  <div class="login-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow">
            <div class="card-body p-4">
              <!-- 登入標題 -->
              <div class="text-center mb-4">
                <h1 class="h3 text-primary mb-2">
                  <i class="bi bi-shield-lock"></i>
                  登入 AkashicHub
                </h1>
                <p class="text-muted">IT 內部資源檢索系統</p>
              </div>

              <!-- 登入表單 -->
              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label for="loginAccount" class="form-label">帳號</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-person"></i>
                    </span>
                    <input
                      id="loginAccount"
                      v-model="loginForm.loginAccount"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.loginAccount }"
                      placeholder="請輸入帳號"
                      required
                    >
                    <div v-if="errors.loginAccount" class="invalid-feedback">
                      {{ errors.loginAccount }}
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">密碼</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-lock"></i>
                    </span>
                    <input
                      id="password"
                      v-model="loginForm.password"
                      type="password"
                      class="form-control"
                      :class="{ 'is-invalid': errors.password }"
                      placeholder="請輸入密碼"
                      required
                      @keyup.enter="handleLogin"
                    >
                    <div v-if="errors.password" class="invalid-feedback">
                      {{ errors.password }}
                    </div>
                  </div>
                </div>

                <div class="d-grid mb-3">
                  <button 
                    type="submit" 
                    class="btn btn-primary btn-lg"
                    :disabled="loading"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? '登入中...' : '登入' }}
                  </button>
                </div>
              </form>

              <!-- 底部資訊 -->
              <div class="text-center mt-4">
                <p class="text-muted small mb-2">預設帳號：admin / admin</p>
                <router-link to="/" class="text-decoration-none">
                  <i class="bi bi-arrow-left"></i>
                  返回首頁
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)
const errors = ref({
  loginAccount: '',
  password: ''
})

const loginForm = reactive({
  loginAccount: '',
  password: ''
})

const validateForm = () => {
  errors.value = {
    loginAccount: '',
    password: ''
  }
  
  let isValid = true
  
  if (!loginForm.loginAccount.trim()) {
    errors.value.loginAccount = '請輸入帳號'
    isValid = false
  }
  
  if (!loginForm.password.trim()) {
    errors.value.password = '請輸入密碼'
    isValid = false
  }
  
  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return

  try {
    loading.value = true

    await authStore.login(loginForm)
    
    // 顯示成功訊息
    showAlert('登入成功！', 'success')
    
    // 重定向到目標頁面或儀表板
    const redirect = route.query.redirect as string || '/resources'
    router.push(redirect)
    
  } catch (error: any) {
    console.error('Login failed:', error)
    showAlert(error.message || '登入失敗，請檢查帳號密碼', 'danger')
  } finally {
    loading.value = false
  }
}

const showAlert = (message: string, type: string) => {
  // 創建Bootstrap警告框
  const alertDiv = document.createElement('div')
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `
  
  // 插入到頁面頂部
  const container = document.querySelector('.login-page .container')
  if (container) {
    container.insertBefore(alertDiv, container.firstChild)
    
    // 3秒後自動消失
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv)
      }
    }, 3000)
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  padding: 2rem 0;
}

.card {
  border: none;
  border-radius: 1rem;
}

.card-body {
  padding: 2rem;
}

.input-group-text {
  background-color: #f8f9fa;
  border-right: none;
}

.form-control {
  border-left: none;
}

.form-control:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem;
  font-weight: 500;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #667eea 100%);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #6c757d;
  transform: none;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

@media (max-width: 576px) {
  .login-page {
    padding: 1rem;
  }
  
  .card-body {
    padding: 1.5rem;
  }
}
</style>