// 認證狀態管理

import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { UserInfo, LoginRequest, AuthState } from '@/types'
import { 
  getToken, 
  setToken, 
  removeToken, 
  getUserInfo, 
  setUserInfo, 
  removeUserInfo,
  clearAuth,
  isTokenValid,
  isTokenExpiringSoon,
  updateLastActivity,
  addLoginHistory
} from '@/utils/auth'
import { login as loginApi, getUserProfile } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  // 狀態
  const token = ref<string | null>(getToken())
  const user = ref<UserInfo | null>(getUserInfo())
  const isLoading = ref(false)
  const loginError = ref<string | null>(null)

  // 計算屬性
  const isAuthenticated = computed(() => {
    return !!(token.value && user.value && isTokenValid(token.value))
  })

  const isAdmin = computed(() => {
    return user.value?.role === 'Admin'
  })

  const isUser = computed(() => {
    return user.value?.role === 'User'
  })

  const userName = computed(() => {
    return user.value?.displayName || user.value?.loginAccount || ''
  })

  const userRole = computed(() => {
    return user.value?.role || null
  })

  const userInfo = computed(() => user.value)

  const permissions = computed(() => {
    // 根據角色返回權限列表
    if (user.value?.role === 'Admin') {
      return [
        'user:read',
        'user:write',
        'user:delete',
        'resource:read',
        'resource:write',
        'resource:delete',
        'tag:read',
        'tag:write',
        'tag:delete',
        'system:read',
        'system:write'
      ]
    } else if (user.value?.role === 'User') {
      return [
        'resource:read',
        'tag:read',
        'profile:read',
        'profile:write'
      ]
    }
    return []
  })

  // 動作
  const login = async (credentials: LoginRequest) => {
    try {
      isLoading.value = true
      loginError.value = null

      const response = await loginApi(credentials)
      
      // 保存認證資訊
      token.value = response.token
      user.value = response.user
      
      setToken(response.token)
      setUserInfo(response.user)
      
      // 記錄登入歷史
      addLoginHistory(credentials.loginAccount)
      
      // 更新活動時間
      updateLastActivity()

      return response
    } catch (error: any) {
      loginError.value = error.message || '登入失敗'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      // 清除本地認證資訊
      token.value = null
      user.value = null
      clearAuth()
      
      // 可以在這裡調用後端登出API
      // await logoutApi()
      
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const refreshUserInfo = async () => {
    try {
      if (!token.value) return

      const userInfo = await getUserProfile()
      user.value = userInfo
      setUserInfo(userInfo)
    } catch (error) {
      console.error('Failed to refresh user info:', error)
      // 如果獲取用戶資訊失敗，可能是token無效
      if (error.status === 401) {
        await logout()
      }
    }
  }

  const checkAuth = () => {
    const savedToken = getToken()
    const savedUser = getUserInfo()
    
    if (savedToken && savedUser && isTokenValid(savedToken)) {
      token.value = savedToken
      user.value = savedUser
      updateLastActivity()
      return true
    } else {
      // 清除無效的認證資訊
      clearAuth()
      token.value = null
      user.value = null
      return false
    }
  }

  const checkTokenExpiry = () => {
    if (!token.value) return false
    
    if (!isTokenValid(token.value)) {
      // Token已過期，自動登出
      logout()
      return false
    }
    
    if (isTokenExpiringSoon(token.value)) {
      // Token即將過期，可以在這裡實現自動刷新
      console.warn('Token will expire soon')
      return true
    }
    
    return false
  }

  const hasPermission = (permission: string): boolean => {
    return permissions.value.includes(permission)
  }

  const hasRole = (role: string): boolean => {
    return user.value?.role === role
  }

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => user.value?.role === role)
  }

  const hasAnyPermission = (perms: string[]): boolean => {
    return perms.some(permission => permissions.value.includes(permission))
  }

  const hasAllPermissions = (perms: string[]): boolean => {
    return perms.every(permission => permissions.value.includes(permission))
  }

  const updateProfile = async (profileData: Partial<UserInfo>) => {
    try {
      isLoading.value = true
      
      // 調用更新API
      // const updatedUser = await updateUserProfile(profileData)
      
      // 更新本地狀態
      if (user.value) {
        user.value = { ...user.value, ...profileData }
        setUserInfo(user.value)
      }
      
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      isLoading.value = true
      
      // 調用修改密碼API
      // await changePasswordApi({ currentPassword, newPassword })
      
      // 修改密碼成功後可能需要重新登入
      return true
    } catch (error) {
      console.error('Failed to change password:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const resetLoginError = () => {
    loginError.value = null
  }

  // 初始化認證狀態
  const initialize = () => {
    checkAuth()
  }

  // 活動監聽
  const trackActivity = () => {
    if (isAuthenticated.value) {
      updateLastActivity()
    }
  }

  // 返回狀態和方法
  return {
    // 狀態
    token: readonly(token),
    user: readonly(user),
    isLoading: readonly(isLoading),
    loginError: readonly(loginError),
    
    // 計算屬性
    isAuthenticated,
    isAdmin,
    isUser,
    userName,
    userRole,
    userInfo,
    permissions,
    
    // 動作
    login,
    logout,
    refreshUserInfo,
    checkAuth,
    checkTokenExpiry,
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAnyPermission,
    hasAllPermissions,
    updateProfile,
    changePassword,
    resetLoginError,
    initialize,
    trackActivity
  }
})

// 類型定義
export type AuthStore = ReturnType<typeof useAuthStore>