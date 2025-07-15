// 認證相關API

import { get, post } from '@/utils/request'
import type { LoginRequest, LoginResponse, UserInfo } from '@/types'

// 用戶登入
export const login = (credentials: LoginRequest): Promise<LoginResponse> => {
  return post('/auth/login', credentials)
}

// 獲取當前用戶資訊
export const getUserProfile = (): Promise<UserInfo> => {
  return get('/auth/me')
}

// 用戶登出
export const logout = (): Promise<void> => {
  return post('/auth/logout')
}

// 刷新Token
export const refreshToken = (): Promise<{ token: string }> => {
  return post('/auth/refresh')
}

// 修改密碼
export const changePassword = (data: {
  currentPassword: string
  newPassword: string
}): Promise<void> => {
  return post('/auth/change-password', data)
}

// 更新用戶資料
export const updateProfile = (data: Partial<UserInfo>): Promise<UserInfo> => {
  return post('/auth/profile', data)
}

// 驗證Token有效性
export const validateToken = (): Promise<{ valid: boolean }> => {
  return get('/auth/validate')
}

// 獲取用戶權限
export const getUserPermissions = (): Promise<string[]> => {
  return get('/auth/permissions')
}

// 檢查用戶是否有特定權限
export const checkPermission = (permission: string): Promise<boolean> => {
  return get(`/auth/check-permission/${permission}`)
}

// 獲取用戶會話資訊
export const getSessionInfo = (): Promise<{
  sessionId: string
  loginTime: string
  lastActivity: string
  ipAddress: string
  userAgent: string
}> => {
  return get('/auth/session')
}

// 終止其他會話
export const terminateOtherSessions = (): Promise<void> => {
  return post('/auth/terminate-sessions')
}

// 獲取登入歷史
export const getLoginHistory = (params?: {
  page?: number
  limit?: number
}): Promise<{
  items: Array<{
    id: string
    loginTime: string
    ipAddress: string
    userAgent: string
    success: boolean
  }>
  total: number
}> => {
  return get('/auth/login-history', params)
}

// 啟用兩步驟驗證
export const enableTwoFactor = (data: {
  code: string
  secret: string
}): Promise<{
  backupCodes: string[]
}> => {
  return post('/auth/2fa/enable', data)
}

// 停用兩步驟驗證
export const disableTwoFactor = (data: {
  code: string
}): Promise<void> => {
  return post('/auth/2fa/disable', data)
}

// 生成兩步驟驗證密鑰
export const generateTwoFactorSecret = (): Promise<{
  secret: string
  qrCode: string
}> => {
  return post('/auth/2fa/generate')
}

// 驗證兩步驟驗證碼
export const verifyTwoFactorCode = (data: {
  code: string
}): Promise<{ valid: boolean }> => {
  return post('/auth/2fa/verify', data)
}

// 使用備份碼
export const useBackupCode = (data: {
  code: string
}): Promise<{ valid: boolean }> => {
  return post('/auth/2fa/backup-code', data)
}

// 重新生成備份碼
export const regenerateBackupCodes = (): Promise<{
  backupCodes: string[]
}> => {
  return post('/auth/2fa/regenerate-backup-codes')
}

// 密碼重置請求
export const requestPasswordReset = (data: {
  email: string
}): Promise<void> => {
  return post('/auth/password-reset/request', data)
}

// 密碼重置確認
export const confirmPasswordReset = (data: {
  token: string
  newPassword: string
}): Promise<void> => {
  return post('/auth/password-reset/confirm', data)
}

// 帳號鎖定狀態
export const getAccountLockStatus = (): Promise<{
  locked: boolean
  lockTime?: string
  unlockTime?: string
  attempts: number
  maxAttempts: number
}> => {
  return get('/auth/lock-status')
}

// 解鎖帳號（管理員）
export const unlockAccount = (userId: number): Promise<void> => {
  return post(`/auth/unlock/${userId}`)
}

// 強制密碼修改
export const forcePasswordChange = (data: {
  newPassword: string
  reason: string
}): Promise<void> => {
  return post('/auth/force-password-change', data)
}

// 導出所有API
export default {
  login,
  getUserProfile,
  logout,
  refreshToken,
  changePassword,
  updateProfile,
  validateToken,
  getUserPermissions,
  checkPermission,
  getSessionInfo,
  terminateOtherSessions,
  getLoginHistory,
  enableTwoFactor,
  disableTwoFactor,
  generateTwoFactorSecret,
  verifyTwoFactorCode,
  useBackupCode,
  regenerateBackupCodes,
  requestPasswordReset,
  confirmPasswordReset,
  getAccountLockStatus,
  unlockAccount,
  forcePasswordChange
}