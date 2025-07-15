// 認證工具函數

import type { UserInfo, JwtPayload } from '@/types'

// Token 存儲鍵
const TOKEN_KEY = 'akashichub_token'
const USER_KEY = 'akashichub_user'
const REFRESH_TOKEN_KEY = 'akashichub_refresh_token'

// 本地存儲工具
const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to remove from localStorage:', error)
    }
  },
  clear: () => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  },
}

// 會話存儲工具
const sessionStorage = {
  get: (key: string) => {
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  set: (key: string, value: any) => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Failed to save to sessionStorage:', error)
    }
  },
  remove: (key: string) => {
    try {
      window.sessionStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to remove from sessionStorage:', error)
    }
  },
}

// Token 管理
export const getToken = (): string | null => {
  return storage.get(TOKEN_KEY)
}

export const setToken = (token: string): void => {
  storage.set(TOKEN_KEY, token)
}

export const removeToken = (): void => {
  storage.remove(TOKEN_KEY)
}

// 刷新 Token 管理
export const getRefreshToken = (): string | null => {
  return storage.get(REFRESH_TOKEN_KEY)
}

export const setRefreshToken = (token: string): void => {
  storage.set(REFRESH_TOKEN_KEY, token)
}

export const removeRefreshToken = (): void => {
  storage.remove(REFRESH_TOKEN_KEY)
}

// 用戶資訊管理
export const getUserInfo = (): UserInfo | null => {
  return storage.get(USER_KEY)
}

export const setUserInfo = (user: UserInfo): void => {
  storage.set(USER_KEY, user)
}

export const removeUserInfo = (): void => {
  storage.remove(USER_KEY)
}

// 清除所有認證資訊
export const clearAuth = (): void => {
  removeToken()
  removeRefreshToken()
  removeUserInfo()
}

// JWT Token 解析
export const parseJwt = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to parse JWT:', error)
    return null
  }
}

// 檢查 Token 是否有效
export const isTokenValid = (token?: string): boolean => {
  const tokenToCheck = token || getToken()
  if (!tokenToCheck) return false

  const payload = parseJwt(tokenToCheck)
  if (!payload) return false

  // 檢查過期時間
  const now = Math.floor(Date.now() / 1000)
  return payload.exp > now
}

// 檢查 Token 是否即將過期
export const isTokenExpiringSoon = (token?: string, threshold: number = 300): boolean => {
  const tokenToCheck = token || getToken()
  if (!tokenToCheck) return false

  const payload = parseJwt(tokenToCheck)
  if (!payload) return false

  // 檢查是否在閾值時間內過期（默認5分鐘）
  const now = Math.floor(Date.now() / 1000)
  return payload.exp - now <= threshold
}

// 獲取 Token 剩餘時間
export const getTokenRemainingTime = (token?: string): number => {
  const tokenToCheck = token || getToken()
  if (!tokenToCheck) return 0

  const payload = parseJwt(tokenToCheck)
  if (!payload) return 0

  const now = Math.floor(Date.now() / 1000)
  return Math.max(0, payload.exp - now)
}

// 檢查用戶是否已認證
export const isAuthenticated = (): boolean => {
  const token = getToken()
  const user = getUserInfo()
  return !!(token && user && isTokenValid(token))
}

// 檢查用戶角色
export const hasRole = (role: string): boolean => {
  const user = getUserInfo()
  return user?.role === role
}

// 檢查用戶權限
export const hasPermission = (permission: string): boolean => {
  const user = getUserInfo()
  if (!user) return false

  // 管理員擁有所有權限
  if (user.role === 'Admin') return true

  // 這裡可以根據實際需求實現權限檢查邏輯
  // 例如從用戶資訊中獲取權限列表並檢查
  return false
}

// 檢查是否為管理員
export const isAdmin = (): boolean => {
  return hasRole('Admin')
}

// 檢查是否為一般用戶
export const isUser = (): boolean => {
  return hasRole('User')
}

// 獲取用戶角色
export const getUserRole = (): string | null => {
  const user = getUserInfo()
  return user?.role || null
}

// 獲取用戶ID
export const getUserId = (): number | null => {
  const user = getUserInfo()
  return user?.id || null
}

// 獲取用戶名稱
export const getUserName = (): string | null => {
  const user = getUserInfo()
  return user?.displayName || user?.loginAccount || null
}

// 活動時間管理
const ACTIVITY_KEY = 'akashichub_last_activity'

export const updateLastActivity = (): void => {
  const now = Date.now()
  sessionStorage.set(ACTIVITY_KEY, now)
}

export const getLastActivity = (): number => {
  return sessionStorage.get(ACTIVITY_KEY) || 0
}

export const isSessionExpired = (timeout: number = 30 * 60 * 1000): boolean => {
  const lastActivity = getLastActivity()
  if (!lastActivity) return true

  const now = Date.now()
  return now - lastActivity > timeout
}

// 記住登入狀態
const REMEMBER_KEY = 'akashichub_remember'

export const setRememberLogin = (remember: boolean): void => {
  storage.set(REMEMBER_KEY, remember)
}

export const getRememberLogin = (): boolean => {
  return storage.get(REMEMBER_KEY) || false
}

export const removeRememberLogin = (): void => {
  storage.remove(REMEMBER_KEY)
}

// 登入歷史記錄
const LOGIN_HISTORY_KEY = 'akashichub_login_history'

export const addLoginHistory = (account: string): void => {
  const history = getLoginHistory()
  const newHistory = [account, ...history.filter(h => h !== account)].slice(0, 5)
  storage.set(LOGIN_HISTORY_KEY, newHistory)
}

export const getLoginHistory = (): string[] => {
  return storage.get(LOGIN_HISTORY_KEY) || []
}

export const clearLoginHistory = (): void => {
  storage.remove(LOGIN_HISTORY_KEY)
}

// 安全相關
export const generateRandomString = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// 密碼強度檢查
export const checkPasswordStrength = (password: string): {
  score: number
  level: 'weak' | 'medium' | 'strong'
  suggestions: string[]
} => {
  let score = 0
  const suggestions: string[] = []

  // 長度檢查
  if (password.length >= 8) score += 1
  else suggestions.push('密碼至少需要8個字符')

  // 複雜度檢查
  if (/[a-z]/.test(password)) score += 1
  else suggestions.push('至少包含一個小寫字母')

  if (/[A-Z]/.test(password)) score += 1
  else suggestions.push('至少包含一個大寫字母')

  if (/[0-9]/.test(password)) score += 1
  else suggestions.push('至少包含一個數字')

  if (/[^A-Za-z0-9]/.test(password)) score += 1
  else suggestions.push('至少包含一個特殊字符')

  let level: 'weak' | 'medium' | 'strong' = 'weak'
  if (score >= 4) level = 'strong'
  else if (score >= 2) level = 'medium'

  return { score, level, suggestions }
}

// 導出所有工具函數
export default {
  // Token 管理
  getToken,
  setToken,
  removeToken,
  getRefreshToken,
  setRefreshToken,
  removeRefreshToken,
  
  // 用戶資訊管理
  getUserInfo,
  setUserInfo,
  removeUserInfo,
  clearAuth,
  
  // JWT 處理
  parseJwt,
  isTokenValid,
  isTokenExpiringSoon,
  getTokenRemainingTime,
  
  // 認證狀態
  isAuthenticated,
  hasRole,
  hasPermission,
  isAdmin,
  isUser,
  getUserRole,
  getUserId,
  getUserName,
  
  // 活動管理
  updateLastActivity,
  getLastActivity,
  isSessionExpired,
  
  // 記住登入
  setRememberLogin,
  getRememberLogin,
  removeRememberLogin,
  
  // 登入歷史
  addLoginHistory,
  getLoginHistory,
  clearLoginHistory,
  
  // 安全工具
  generateRandomString,
  hashPassword,
  checkPasswordStrength,
}