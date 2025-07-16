<template>
  <div class="login-container">
    <div class="login-card">
      <!-- 系統標題 -->
      <div class="login-header">
        <div class="logo">
          <img src="/favicon.ico" alt="Logo" class="logo-image" />
          <h1 class="logo-text">{{ appTitle }}</h1>
        </div>
        <p class="subtitle">IT資源管理系統</p>
      </div>

      <!-- 登入表單 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        size="large"
        :disabled="loading"
      >
        <el-form-item prop="loginAccount">
          <el-input
            v-model="loginForm.loginAccount"
            placeholder="請輸入帳號"
            prefix-icon="User"
            clearable
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="請輸入密碼"
            prefix-icon="Lock"
            show-password
            clearable
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="loginForm.remember">
              記住登入狀態
            </el-checkbox>
            <el-link type="primary" @click="handleForgotPassword">
              忘記密碼？
            </el-link>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登入中...' : '登入' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 登入歷史 -->
      <div v-if="loginHistory.length > 0" class="login-history">
        <el-divider>最近登入</el-divider>
        <div class="history-list">
          <div
            v-for="account in loginHistory"
            :key="account"
            class="history-item"
            @click="fillAccount(account)"
          >
            <el-icon><UserFilled /></el-icon>
            <span>{{ account }}</span>
          </div>
        </div>
      </div>

      <!-- 系統資訊 -->
      <div class="system-info">
        <div class="info-item">
          <el-icon><Monitor /></el-icon>
          <span>系統狀態：正常</span>
        </div>
        <div class="info-item">
          <el-icon><Clock /></el-icon>
          <span>{{ currentTime }}</span>
        </div>
      </div>
    </div>

    <!-- 忘記密碼對話框 -->
    <el-dialog
      v-model="forgotPasswordVisible"
      title="忘記密碼"
      width="400px"
      :before-close="handleCloseForgotPassword"
    >
      <el-form
        ref="forgotPasswordFormRef"
        :model="forgotPasswordForm"
        :rules="forgotPasswordRules"
        label-width="80px"
      >
        <el-form-item label="帳號" prop="loginAccount">
          <el-input
            v-model="forgotPasswordForm.loginAccount"
            placeholder="請輸入登入帳號"
            clearable
          />
        </el-form-item>
        <el-form-item label="信箱" prop="email">
          <el-input
            v-model="forgotPasswordForm.email"
            placeholder="請輸入註冊信箱"
            clearable
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="forgotPasswordVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="forgotPasswordLoading"
            @click="handleSubmitForgotPassword"
          >
            發送重置郵件
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { User, Lock, UserFilled, Monitor, Clock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { getLoginHistory, addLoginHistory, setRememberLogin } from '@/utils/auth'
import type { FormInstance, FormRules } from 'element-plus'

// 組件引用
const loginFormRef = ref<FormInstance>()
const forgotPasswordFormRef = ref<FormInstance>()

// 路由
const router = useRouter()
const route = useRoute()

// 狀態管理
const authStore = useAuthStore()
const appStore = useAppStore()

// 響應式數據
const loading = ref(false)
const forgotPasswordVisible = ref(false)
const forgotPasswordLoading = ref(false)
const currentTime = ref('')
const loginHistory = ref<string[]>([])

// 表單數據
const loginForm = reactive({
  loginAccount: '',
  password: '',
  remember: false
})

const forgotPasswordForm = reactive({
  loginAccount: '',
  email: ''
})

// 表單驗證規則
const loginRules: FormRules = {
  loginAccount: [
    { required: true, message: '請輸入帳號', trigger: 'blur' },
    { min: 3, max: 50, message: '帳號長度在 3 到 50 個字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度至少 6 個字符', trigger: 'blur' }
  ]
}

const forgotPasswordRules: FormRules = {
  loginAccount: [
    { required: true, message: '請輸入登入帳號', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '請輸入信箱', trigger: 'blur' },
    { type: 'email', message: '請輸入有效的信箱格式', trigger: 'blur' }
  ]
}

// 計算屬性
const appTitle = computed(() => appStore.appTitle)

// 處理登入
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    // 執行登入
    await authStore.login({
      loginAccount: loginForm.loginAccount,
      password: loginForm.password
    })
    
    // 設置記住登入狀態
    setRememberLogin(loginForm.remember)
    
    // 添加到登入歷史
    addLoginHistory(loginForm.loginAccount)
    
    // 登入成功提示
    ElMessage.success('登入成功！')
    
    // 等待下一個tick確保狀態已更新
    await nextTick()
    
    // 重定向到目標頁面
    const redirectPath = (route.query.redirect as string) || '/dashboard'
    await router.push(redirectPath)
    
  } catch (error: any) {
    console.error('Login error:', error)
    ElMessage.error(error.message || '登入失敗，請檢查帳號密碼')
  } finally {
    loading.value = false
  }
}

// 處理忘記密碼
const handleForgotPassword = () => {
  forgotPasswordVisible.value = true
  forgotPasswordForm.loginAccount = loginForm.loginAccount
}

// 關閉忘記密碼對話框
const handleCloseForgotPassword = () => {
  forgotPasswordVisible.value = false
  forgotPasswordForm.loginAccount = ''
  forgotPasswordForm.email = ''
  forgotPasswordFormRef.value?.clearValidate()
}

// 提交忘記密碼
const handleSubmitForgotPassword = async () => {
  if (!forgotPasswordFormRef.value) return
  
  try {
    await forgotPasswordFormRef.value.validate()
    forgotPasswordLoading.value = true
    
    // 這裡調用忘記密碼API
    // await requestPasswordReset(forgotPasswordForm)
    
    ElNotification({
      title: '郵件已發送',
      message: '密碼重置郵件已發送到您的信箱，請檢查收信',
      type: 'success',
      duration: 5000
    })
    
    handleCloseForgotPassword()
    
  } catch (error: any) {
    ElMessage.error(error.message || '發送重置郵件失敗')
  } finally {
    forgotPasswordLoading.value = false
  }
}

// 填入帳號
const fillAccount = (account: string) => {
  loginForm.loginAccount = account
}

// 更新時間
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 定時器
let timeInterval: NodeJS.Timeout

// 組件掛載
onMounted(() => {
  // 如果已經登入，重定向到首頁
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
    return
  }
  
  // 載入登入歷史
  loginHistory.value = getLoginHistory()
  
  // 開始更新時間
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  
  // 重置登入錯誤
  authStore.resetLoginError()
})

// 組件卸載
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

// 監聽鍵盤事件
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleLogin()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
  
  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 8px;
    
    .logo-image {
      width: 40px;
      height: 40px;
    }
    
    .logo-text {
      font-size: 24px;
      font-weight: 600;
      color: #409eff;
      margin: 0;
    }
  }
  
  .subtitle {
    color: #666;
    font-size: 14px;
    margin: 0;
  }
}

.login-form {
  .el-form-item {
    margin-bottom: 24px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  
  .el-checkbox {
    color: #666;
  }
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
}

.login-history {
  margin-top: 24px;
  
  .el-divider {
    margin: 16px 0;
  }
  
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .history-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
    color: #666;
    font-size: 14px;
    
    &:hover {
      background-color: #f5f7fa;
    }
    
    .el-icon {
      font-size: 16px;
    }
  }
}

.system-info {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #999;
    font-size: 12px;
    
    .el-icon {
      font-size: 14px;
    }
  }
}

// 響應式設計
@media (max-width: 480px) {
  .login-container {
    padding: 12px;
  }
  
  .login-card {
    padding: 24px;
  }
  
  .login-header {
    .logo {
      .logo-text {
        font-size: 20px;
      }
    }
  }
}

// 對話框樣式
:deep(.el-dialog) {
  .el-dialog__header {
    padding: 20px 20px 0;
    
    .el-dialog__title {
      font-weight: 600;
    }
  }
  
  .el-dialog__body {
    padding: 20px;
  }
  
  .el-dialog__footer {
    padding: 0 20px 20px;
  }
}

// 表單樣式增強
:deep(.el-form-item) {
  .el-form-item__label {
    font-weight: 500;
  }
  
  .el-input {
    .el-input__wrapper {
      border-radius: 8px;
    }
  }
}

// 載入狀態樣式
:deep(.el-loading-spinner) {
  .el-loading-text {
    color: #409eff;
  }
}
</style>