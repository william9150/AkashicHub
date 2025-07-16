// 簡化的狀態管理
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 簡化的認證 Store
export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('akashichub_token'))
  const user = ref<any>(null)
  
  // 初始化時嘗試載入用戶資訊
  const userStr = localStorage.getItem('akashichub_user')
  if (userStr) {
    try {
      user.value = JSON.parse(userStr)
    } catch (e) {
      console.warn('Failed to parse user data:', e)
    }
  }

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'Admin')

  const login = async (credentials: { loginAccount: string, password: string }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      if (!response.ok) {
        throw new Error('登入失敗')
      }

      const data = await response.json()
      
      if (data.success) {
        token.value = data.data.token
        user.value = data.data.user || {
          id: data.data.id,
          loginAccount: credentials.loginAccount,
          displayName: data.data.displayName,
          role: data.data.role
        }
        
        localStorage.setItem('akashichub_token', token.value)
        localStorage.setItem('akashichub_user', JSON.stringify(user.value))
        
        return data.data
      } else {
        throw new Error(data.error?.message || '登入失敗')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('akashichub_token')
    localStorage.removeItem('akashichub_user')
  }

  const initialize = () => {
    // 初始化已在 store 創建時完成
    console.log('Auth store initialized')
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    initialize
  }
})

// 簡化的應用 Store
export const useAppStore = defineStore('app', () => {
  const loading = ref(false)
  const title = ref('AkashicHub')

  const setLoading = (state: boolean) => {
    loading.value = state
  }

  const setTitle = (newTitle: string) => {
    title.value = newTitle
    document.title = newTitle
  }

  const initializeApp = () => {
    console.log('App store initialized')
  }

  return {
    loading,
    title,
    setLoading,
    setTitle,
    initializeApp
  }
})