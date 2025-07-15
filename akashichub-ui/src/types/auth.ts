// 認證相關類型定義

// 用戶角色
export type UserRole = 'Admin' | 'User'

// 登入請求
export interface LoginRequest {
  loginAccount: string
  password: string
}

// 登入回應
export interface LoginResponse {
  token: string
  user: UserInfo
}

// 用戶資訊
export interface UserInfo {
  id: number
  loginAccount: string
  displayName: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

// JWT Token 負載
export interface JwtPayload {
  id: number
  loginAccount: string
  role: UserRole
  iat: number
  exp: number
}

// 認證狀態
export interface AuthState {
  isAuthenticated: boolean
  user: UserInfo | null
  token: string | null
  permissions: string[]
  lastActivity: number
}

// 權限
export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
}

// 登入表單
export interface LoginForm {
  loginAccount: string
  password: string
  remember: boolean
}

// 密碼修改
export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// 用戶資料更新
export interface UserUpdateRequest {
  displayName?: string
  email?: string
  avatar?: string
}

// 用戶創建
export interface UserCreateRequest {
  loginAccount: string
  displayName: string
  password: string
  role: UserRole
}

// 用戶列表項
export interface UserListItem {
  id: number
  loginAccount: string
  displayName: string
  role: UserRole
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

// 會話資訊
export interface SessionInfo {
  sessionId: string
  userId: number
  loginTime: string
  lastActivity: string
  ipAddress: string
  userAgent: string
  isActive: boolean
}

// 認證錯誤
export interface AuthError {
  code: string
  message: string
  field?: string
}

// 導出類型
export type {
  UserRole,
  LoginRequest,
  LoginResponse,
  UserInfo,
  JwtPayload,
  AuthState,
  Permission,
  LoginForm,
  PasswordChangeRequest,
  UserUpdateRequest,
  UserCreateRequest,
  UserListItem,
  SessionInfo,
  AuthError
}