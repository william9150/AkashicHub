import request from './request'

export interface DashboardStats {
  totalResources: number
  totalUsers: number
  totalTags: number
  activeResources: number
  resourcesTrend: number
  usersTrend: number
  tagsTrend: number
  activeTrend: number
  resourceTypeDistribution: Array<{
    ResourceType: string
    count: number
  }>
  userRoleDistribution: Array<{
    Role: string
    count: number
  }>
  recentResources: Array<{
    Id: number
    Name: string
    ResourceType: string
    IpAddress: string
    CreatedAt: string
  }>
}

export interface SystemStatus {
  system: string
  database: string
  memoryUsage: number
  diskUsage: number
  onlineUsers: number
  uptime: string
  apiRequests: number
  errorRate: number
}

// 獲取儀表板統計資料
export const getDashboardStats = (): Promise<DashboardStats> => {
  return request.get('/api/dashboard/stats')
}

// 獲取系統狀態
export const getSystemStatus = (): Promise<SystemStatus> => {
  return request.get('/api/dashboard/system-status')
}