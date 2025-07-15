// 用戶管理相關API

import { get, post, put, del } from '@/utils/request'
import type { 
  UserInfo, 
  UserCreateRequest, 
  UserUpdateRequest,
  UserQueryParams,
  PaginationData
} from '@/types'

// 獲取用戶列表（管理員）
export const getUsers = (params: UserQueryParams = {}): Promise<PaginationData<UserInfo>> => {
  return get('/admin/users', params)
}

// 獲取用戶詳情（管理員）
export const getUserById = (id: number): Promise<UserInfo> => {
  return get(`/admin/users/${id}`)
}

// 創建用戶（管理員）
export const createUser = (data: UserCreateRequest): Promise<UserInfo> => {
  return post('/admin/users', data)
}

// 更新用戶（管理員）
export const updateUser = (id: number, data: UserUpdateRequest): Promise<UserInfo> => {
  return put(`/admin/users/${id}`, data)
}

// 刪除用戶（管理員）
export const deleteUser = (id: number): Promise<void> => {
  return del(`/admin/users/${id}`)
}

// 批量刪除用戶（管理員）
export const batchDeleteUsers = (ids: number[]): Promise<void> => {
  return post('/admin/users/batch-delete', { ids })
}

// 重置用戶密碼（管理員）
export const resetUserPassword = (id: number, data: {
  newPassword: string
  forceChange?: boolean
}): Promise<void> => {
  return post(`/admin/users/${id}/reset-password`, data)
}

// 啟用/停用用戶（管理員）
export const toggleUserStatus = (id: number, active: boolean): Promise<void> => {
  return post(`/admin/users/${id}/toggle-status`, { active })
}

// 批量啟用/停用用戶（管理員）
export const batchToggleUserStatus = (ids: number[], active: boolean): Promise<void> => {
  return post('/admin/users/batch-toggle-status', { ids, active })
}

// 獲取用戶角色列表
export const getUserRoles = (): Promise<Array<{
  value: string
  label: string
  description: string
  permissions: string[]
}>> => {
  return get('/admin/users/roles')
}

// 更新用戶角色（管理員）
export const updateUserRole = (id: number, role: string): Promise<void> => {
  return post(`/admin/users/${id}/role`, { role })
}

// 批量更新用戶角色（管理員）
export const batchUpdateUserRole = (ids: number[], role: string): Promise<void> => {
  return post('/admin/users/batch-update-role', { ids, role })
}

// 獲取用戶權限（管理員）
export const getUserPermissions = (id: number): Promise<{
  permissions: string[]
  roles: string[]
  groups: string[]
}> => {
  return get(`/admin/users/${id}/permissions`)
}

// 更新用戶權限（管理員）
export const updateUserPermissions = (id: number, data: {
  permissions: string[]
  roles?: string[]
  groups?: string[]
}): Promise<void> => {
  return post(`/admin/users/${id}/permissions`, data)
}

// 獲取用戶活動日誌
export const getUserActivityLogs = (
  id: number,
  params: {
    page?: number
    limit?: number
    action?: string
    startDate?: string
    endDate?: string
  } = {}
): Promise<PaginationData<{
  id: string
  userId: number
  action: string
  resource: string
  details: any
  timestamp: string
  ipAddress: string
  userAgent: string
}>> => {
  return get(`/admin/users/${id}/activity-logs`, params)
}

// 獲取用戶會話列表（管理員）
export const getUserSessions = (id: number): Promise<Array<{
  sessionId: string
  userId: number
  loginTime: string
  lastActivity: string
  ipAddress: string
  userAgent: string
  isActive: boolean
}>> => {
  return get(`/admin/users/${id}/sessions`)
}

// 終止用戶會話（管理員）
export const terminateUserSession = (id: number, sessionId: string): Promise<void> => {
  return post(`/admin/users/${id}/sessions/${sessionId}/terminate`)
}

// 終止用戶所有會話（管理員）
export const terminateAllUserSessions = (id: number): Promise<void> => {
  return post(`/admin/users/${id}/sessions/terminate-all`)
}

// 獲取用戶統計
export const getUserStats = (): Promise<{
  totalUsers: number
  activeUsers: number
  adminUsers: number
  regularUsers: number
  lockedUsers: number
  recentRegistrations: number
  usersByRole: Record<string, number>
  loginStats: Array<{
    date: string
    count: number
  }>
}> => {
  return get('/admin/users/stats')
}

// 搜尋用戶
export const searchUsers = (params: {
  query: string
  role?: string
  active?: boolean
  limit?: number
}): Promise<{
  users: UserInfo[]
  total: number
  suggestions: string[]
}> => {
  return get('/admin/users/search', params)
}

// 匯出用戶
export const exportUsers = (params: {
  ids?: number[]
  format: 'json' | 'csv' | 'xlsx'
  includePermissions?: boolean
  includeActivity?: boolean
}): Promise<{
  downloadUrl: string
  filename: string
}> => {
  return post('/admin/users/export', params)
}

// 匯入用戶
export const importUsers = (file: File, options: {
  skipDuplicates?: boolean
  updateExisting?: boolean
  sendWelcomeEmail?: boolean
}): Promise<{
  imported: number
  skipped: number
  errors: Array<{
    row: number
    message: string
  }>
}> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('options', JSON.stringify(options))
  
  return post('/admin/users/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 驗證用戶資料
export const validateUserData = (data: Partial<UserCreateRequest>): Promise<{
  valid: boolean
  errors: Array<{
    field: string
    message: string
  }>
}> => {
  return post('/admin/users/validate', data)
}

// 檢查用戶名是否可用
export const checkUsernameAvailability = (username: string): Promise<{
  available: boolean
  suggestions?: string[]
}> => {
  return get(`/admin/users/check-username/${username}`)
}

// 檢查電子郵件是否可用
export const checkEmailAvailability = (email: string): Promise<{
  available: boolean
}> => {
  return get(`/admin/users/check-email/${email}`)
}

// 發送歡迎郵件
export const sendWelcomeEmail = (id: number): Promise<void> => {
  return post(`/admin/users/${id}/send-welcome-email`)
}

// 發送密碼重置郵件
export const sendPasswordResetEmail = (id: number): Promise<void> => {
  return post(`/admin/users/${id}/send-password-reset-email`)
}

// 獲取用戶最近活動
export const getUserRecentActivity = (id: number, limit: number = 10): Promise<Array<{
  id: string
  action: string
  resource: string
  timestamp: string
  description: string
}>> => {
  return get(`/admin/users/${id}/recent-activity`, { limit })
}

// 獲取用戶偏好設定
export const getUserPreferences = (id: number): Promise<{
  theme: string
  language: string
  timezone: string
  notifications: Record<string, boolean>
  dashboard: Record<string, any>
}> => {
  return get(`/admin/users/${id}/preferences`)
}

// 更新用戶偏好設定
export const updateUserPreferences = (id: number, preferences: any): Promise<void> => {
  return post(`/admin/users/${id}/preferences`, preferences)
}

// 獲取用戶群組
export const getUserGroups = (): Promise<Array<{
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
}>> => {
  return get('/admin/users/groups')
}

// 創建用戶群組
export const createUserGroup = (data: {
  name: string
  description?: string
  permissions: string[]
}): Promise<{
  id: string
  name: string
  description: string
  permissions: string[]
}> => {
  return post('/admin/users/groups', data)
}

// 更新用戶群組
export const updateUserGroup = (id: string, data: {
  name?: string
  description?: string
  permissions?: string[]
}): Promise<void> => {
  return put(`/admin/users/groups/${id}`, data)
}

// 刪除用戶群組
export const deleteUserGroup = (id: string): Promise<void> => {
  return del(`/admin/users/groups/${id}`)
}

// 添加用戶到群組
export const addUserToGroup = (userId: number, groupId: string): Promise<void> => {
  return post(`/admin/users/${userId}/groups/${groupId}`)
}

// 從群組移除用戶
export const removeUserFromGroup = (userId: number, groupId: string): Promise<void> => {
  return del(`/admin/users/${userId}/groups/${groupId}`)
}

// 獲取用戶的群組
export const getUserGroupMemberships = (id: number): Promise<Array<{
  id: string
  name: string
  description: string
  joinedAt: string
}>> => {
  return get(`/admin/users/${id}/groups`)
}

// 批量操作用戶群組
export const batchUpdateUserGroups = (data: {
  userIds: number[]
  groupIds: string[]
  action: 'add' | 'remove'
}): Promise<void> => {
  return post('/admin/users/batch-update-groups', data)
}

// 獲取用戶登入歷史
export const getUserLoginHistory = (
  id: number,
  params: {
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
  } = {}
): Promise<PaginationData<{
  id: string
  userId: number
  loginTime: string
  logoutTime?: string
  ipAddress: string
  userAgent: string
  success: boolean
  failureReason?: string
}>> => {
  return get(`/admin/users/${id}/login-history`, params)
}

// 鎖定用戶帳號
export const lockUserAccount = (id: number, reason: string): Promise<void> => {
  return post(`/admin/users/${id}/lock`, { reason })
}

// 解鎖用戶帳號
export const unlockUserAccount = (id: number): Promise<void> => {
  return post(`/admin/users/${id}/unlock`)
}

// 導出所有API
export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  batchDeleteUsers,
  resetUserPassword,
  toggleUserStatus,
  batchToggleUserStatus,
  getUserRoles,
  updateUserRole,
  batchUpdateUserRole,
  getUserPermissions,
  updateUserPermissions,
  getUserActivityLogs,
  getUserSessions,
  terminateUserSession,
  terminateAllUserSessions,
  getUserStats,
  searchUsers,
  exportUsers,
  importUsers,
  validateUserData,
  checkUsernameAvailability,
  checkEmailAvailability,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  getUserRecentActivity,
  getUserPreferences,
  updateUserPreferences,
  getUserGroups,
  createUserGroup,
  updateUserGroup,
  deleteUserGroup,
  addUserToGroup,
  removeUserFromGroup,
  getUserGroupMemberships,
  batchUpdateUserGroups,
  getUserLoginHistory,
  lockUserAccount,
  unlockUserAccount
}