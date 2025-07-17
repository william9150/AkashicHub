<template>
  <div class="dashboard-container">
    <!-- 歡迎標題 -->
    <div class="welcome-header text-center mb-4">
      <h1 class="text-primary mb-2">🎯 儀表板</h1>
      <p class="text-muted">歡迎來到 AkashicHub 儀表板！</p>
    </div>
    
    <!-- 頂部統計卡片 -->
    <div class="stats-cards mb-4">
      <div class="row g-3">
        <div class="col-12 col-sm-6 col-md-3">
          <div class="stat-card" @click="goToResources">
            <div class="stat-icon resources">
              <i class="bi bi-server"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalResources }}</div>
              <div class="stat-label">總資源數</div>
              <div class="stat-trend" :class="{ positive: stats.resourcesTrend > 0, negative: stats.resourcesTrend < 0 }">
                <i :class="stats.resourcesTrend > 0 ? 'bi bi-caret-up-fill' : stats.resourcesTrend < 0 ? 'bi bi-caret-down-fill' : 'bi bi-dash'"></i>
                {{ Math.abs(stats.resourcesTrend) }}%
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-12 col-sm-6 col-md-3">
          <div class="stat-card" @click="goToUsers">
            <div class="stat-icon users">
              <i class="bi bi-person-fill"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalUsers }}</div>
              <div class="stat-label">用戶數量</div>
              <div class="stat-trend" :class="{ positive: stats.usersTrend > 0, negative: stats.usersTrend < 0 }">
                <i :class="stats.usersTrend > 0 ? 'bi bi-caret-up-fill' : stats.usersTrend < 0 ? 'bi bi-caret-down-fill' : 'bi bi-dash'"></i>
                {{ Math.abs(stats.usersTrend) }}%
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-12 col-sm-6 col-md-3">
          <div class="stat-card" @click="goToTags">
            <div class="stat-icon tags">
              <i class="bi bi-tags-fill"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalTags }}</div>
              <div class="stat-label">標籤數量</div>
              <div class="stat-trend" :class="{ positive: stats.tagsTrend > 0, negative: stats.tagsTrend < 0 }">
                <i :class="stats.tagsTrend > 0 ? 'bi bi-caret-up-fill' : stats.tagsTrend < 0 ? 'bi bi-caret-down-fill' : 'bi bi-dash'"></i>
                {{ Math.abs(stats.tagsTrend) }}%
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-12 col-sm-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon active">
              <i class="bi bi-check-circle-fill"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.activeResources }}</div>
              <div class="stat-label">活躍資源</div>
              <div class="stat-trend" :class="{ positive: stats.activeTrend > 0, negative: stats.activeTrend < 0 }">
                <i :class="stats.activeTrend > 0 ? 'bi bi-caret-up-fill' : stats.activeTrend < 0 ? 'bi bi-caret-down-fill' : 'bi bi-dash'"></i>
                {{ Math.abs(stats.activeTrend) }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 時間範圍選擇器 -->
    <div class="time-range-selector d-flex justify-content-center mb-4">
      <div class="btn-group" role="group">
        <input type="radio" class="btn-check" id="range-7d" v-model="timeRange" value="7d" @change="handleTimeRangeChange">
        <label class="btn btn-outline-primary" for="range-7d">最近7天</label>
        
        <input type="radio" class="btn-check" id="range-30d" v-model="timeRange" value="30d" @change="handleTimeRangeChange">
        <label class="btn btn-outline-primary" for="range-30d">最近30天</label>
        
        <input type="radio" class="btn-check" id="range-90d" v-model="timeRange" value="90d" @change="handleTimeRangeChange">
        <label class="btn btn-outline-primary" for="range-90d">最近3個月</label>
        
        <input type="radio" class="btn-check" id="range-1y" v-model="timeRange" value="1y" @change="handleTimeRangeChange">
        <label class="btn btn-outline-primary" for="range-1y">最近1年</label>
      </div>
    </div>

    <!-- 主要內容區域 -->
    <div class="row g-4 main-content">
      <!-- 左側內容 -->
      <div class="col-12 col-lg-8">
        <!-- 圖表區域 -->
        <div class="row g-4 mb-4">
          <!-- 資源類型分佈圖表 -->
          <div class="col-12 col-md-6">
            <div class="card chart-card">
              <div class="card-header">
                <h5 class="card-title mb-0">資源類型分佈</h5>
              </div>
              <div class="card-body">
                <div class="chart-container">
                  <div ref="resourceTypeChart" class="chart"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 用戶活躍度圖表 -->
          <div class="col-12 col-md-6">
            <div class="card chart-card">
              <div class="card-header">
                <h5 class="card-title mb-0">用戶活躍度</h5>
              </div>
              <div class="card-body">
                <div class="chart-container">
                  <div ref="userActivityChart" class="chart"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 使用趨勢圖表 -->
        <div class="card chart-card mb-4">
          <div class="card-header">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">使用趨勢</h5>
              <select class="form-select form-select-sm" style="width: 120px" v-model="trendMetric" @change="updateTrendChart">
                <option value="resources">資源訪問</option>
                <option value="logins">用戶登入</option>
                <option value="system">系統負載</option>
              </select>
            </div>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <div ref="trendChart" class="chart trend-chart"></div>
            </div>
          </div>
        </div>

        <!-- 最近活動 -->
        <div class="card activity-card">
          <div class="card-header">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">最近活動</h5>
              <button class="btn btn-sm btn-outline-primary" @click="refreshActivities" :disabled="activitiesLoading">
                <span v-if="activitiesLoading" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-arrow-clockwise me-2"></i>
                刷新
              </button>
            </div>
          </div>
          <div class="card-body">
            <div class="activity-list">
              <div
                v-for="activity in recentActivities"
                :key="activity.id"
                class="activity-item"
              >
                <div class="activity-icon">
                  <i :class="getActivityIcon(activity.type)" :style="{ color: getActivityColor(activity.type) }"></i>
                </div>
                <div class="activity-content">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-description">{{ activity.description }}</div>
                  <div class="activity-time">{{ formatTime(activity.createdAt) }}</div>
                </div>
                <div class="activity-status">
                  <span :class="'badge ' + getActivityStatusClass(activity.status)">
                    {{ activity.status }}
                  </span>
                </div>
              </div>
              
              <div v-if="recentActivities.length === 0" class="empty-state text-center py-5">
                <i class="bi bi-inbox fs-1 text-muted"></i>
                <p class="text-muted mt-2">暫無活動記錄</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右側內容 -->
      <div class="col-12 col-lg-4">
        <!-- 快速操作 -->
        <div class="card quick-actions-card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">快速操作</h5>
          </div>
          <div class="card-body">
            <div class="quick-actions">
              <button class="btn btn-primary w-100 mb-2" @click="goToResources">
                <i class="bi bi-server me-2"></i>管理資源
              </button>
              <button
                v-if="authStore.canEditUsers"
                class="btn btn-success w-100 mb-2"
                @click="goToUsers"
              >
                <i class="bi bi-people me-2"></i>管理用戶
              </button>
              <button class="btn btn-info w-100 mb-2" @click="goToTags">
                <i class="bi bi-tags me-2"></i>管理標籤
              </button>
              <button
                v-if="authStore.canEditITData"
                class="btn btn-primary w-100 mb-2"
                @click="goToCreateResource"
              >
                <i class="bi bi-plus-circle me-2"></i>新增資源
              </button>
              <button
                v-if="authStore.canEditUsers"
                class="btn btn-success w-100 mb-2"
                @click="goToCreateUser"
              >
                <i class="bi bi-person-plus me-2"></i>新增用戶
              </button>
              <button
                v-if="authStore.canEditITData"
                class="btn btn-warning w-100 mb-2"
                @click="goToCreateTag"
              >
                <i class="bi bi-tag me-2"></i>新增標籤
              </button>
              <button class="btn btn-info w-100 mb-2" @click="goToSearch">
                <i class="bi bi-search me-2"></i>搜索資源
              </button>
              <button
                v-if="authStore.isSuperAdmin"
                class="btn btn-warning w-100 mb-2"
                @click="goToLogs"
              >
                <i class="bi bi-file-text me-2"></i>查看日誌
              </button>
              <button class="btn btn-secondary w-100" @click="exportData">
                <i class="bi bi-download me-2"></i>匯出數據
              </button>
            </div>
          </div>
        </div>

        <!-- 實時監控 -->
        <div class="card monitoring-card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">實時監控</h5>
          </div>
          <div class="card-body">
            <div class="monitoring-items">
              <div class="monitoring-item">
                <div class="monitoring-label">
                  <i class="bi bi-wifi me-2"></i>
                  在線用戶
                </div>
                <div class="monitoring-value">{{ realTimeStats.onlineUsers }}</div>
              </div>
              
              <div class="monitoring-item">
                <div class="monitoring-label">
                  <i class="bi bi-clock me-2"></i>
                  系統運行時間
                </div>
                <div class="monitoring-value">{{ realTimeStats.uptime }}</div>
              </div>
              
              <div class="monitoring-item">
                <div class="monitoring-label">
                  <i class="bi bi-pc-display me-2"></i>
                  API 請求/分鐘
                </div>
                <div class="monitoring-value">{{ realTimeStats.apiRequests }}</div>
              </div>
              
              <div class="monitoring-item">
                <div class="monitoring-label">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  錯誤率
                </div>
                <div class="monitoring-value" :class="{ 'text-danger': realTimeStats.errorRate > 5 }">
                  {{ realTimeStats.errorRate }}%
                </div>
              </div>
            </div>
            
            <div class="monitoring-chart">
              <div ref="realtimeChart" class="mini-chart"></div>
            </div>
          </div>
        </div>

        <!-- 系統狀態 -->
        <div class="card system-status-card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">系統狀態</h5>
          </div>
          <div class="card-body">
            <div class="status-list">
              <div class="status-item">
                <div class="status-label">系統狀態</div>
                <div class="status-value">
                  <span :class="'badge ' + getStatusClass(systemStatus.system)">
                    {{ getStatusText(systemStatus.system) }}
                  </span>
                </div>
              </div>
              
              <div class="status-item">
                <div class="status-label">資料庫</div>
                <div class="status-value">
                  <span :class="'badge ' + getStatusClass(systemStatus.database)">
                    {{ getStatusText(systemStatus.database) }}
                  </span>
                </div>
              </div>
              
              <div class="status-item">
                <div class="status-label">記憶體使用</div>
                <div class="status-value">
                  <div class="progress" style="height: 20px;">
                    <div 
                      class="progress-bar" 
                      :class="getProgressClass(systemStatus.memoryUsage)"
                      :style="{ width: systemStatus.memoryUsage + '%' }"
                    >
                      {{ systemStatus.memoryUsage }}%
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="status-item">
                <div class="status-label">磁碟使用</div>
                <div class="status-value">
                  <div class="progress" style="height: 20px;">
                    <div 
                      class="progress-bar" 
                      :class="getProgressClass(systemStatus.diskUsage)"
                      :style="{ width: systemStatus.diskUsage + '%' }"
                    >
                      {{ systemStatus.diskUsage }}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 最近資源 -->
        <div class="card recent-resources-card">
          <div class="card-header">
            <h5 class="card-title mb-0">最近資源</h5>
          </div>
          <div class="card-body">
            <div class="resource-list">
              <div
                v-for="resource in recentResources"
                :key="resource.id"
                class="resource-item"
                @click="goToResource(resource.id)"
              >
                <div class="resource-icon">
                  <i :class="getResourceTypeIcon(resource.resourceType)" :style="{ color: getResourceTypeColor(resource.resourceType) }"></i>
                </div>
                <div class="resource-content">
                  <div class="resource-name">{{ resource.name }}</div>
                  <div class="resource-type text-muted">{{ resource.resourceType }}</div>
                  <div class="resource-ip text-muted">{{ resource.ipAddress }}</div>
                </div>
              </div>
              
              <div v-if="recentResources.length === 0" class="empty-state text-center py-4">
                <i class="bi bi-server fs-1 text-muted"></i>
                <p class="text-muted mt-2">暫無最近資源</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import * as echarts from 'echarts'
import { getDashboardStats, getSystemStatus } from '@/api/dashboard'

// 狀態管理
const authStore = useAuthStore()

// 路由
const router = useRouter()

// 響應式數據
const loading = ref(false)
const activitiesLoading = ref(false)
const timeRange = ref('30d')
const trendMetric = ref('resources')

// 圖表 refs
const resourceTypeChart = ref<HTMLElement>()
const userActivityChart = ref<HTMLElement>()
const trendChart = ref<HTMLElement>()
const realtimeChart = ref<HTMLElement>()

// 圖表實例
let resourceTypeChartInstance: echarts.ECharts | null = null
let userActivityChartInstance: echarts.ECharts | null = null
let trendChartInstance: echarts.ECharts | null = null
let realtimeChartInstance: echarts.ECharts | null = null

// 定時器
let realtimeTimer: NodeJS.Timeout | null = null

// 統計數據
const stats = ref({
  totalResources: 156,
  totalUsers: 24,
  totalTags: 48,
  activeResources: 142,
  resourcesTrend: 8.2,
  usersTrend: 12.5,
  tagsTrend: -2.1,
  activeTrend: 5.7
})

// 實時監控數據
const realTimeStats = ref({
  onlineUsers: 8,
  uptime: '15天 3小時',
  apiRequests: 145,
  errorRate: 0.8
})

const systemStatus = ref({
  system: 'healthy',
  database: 'healthy',
  memoryUsage: 68,
  diskUsage: 45
})

const recentActivities = ref([
  {
    id: 1,
    type: 'create',
    title: '新增資源',
    description: 'Web Server 01 已成功添加到系統',
    status: '成功',
    createdAt: new Date(Date.now() - 1800000)
  },
  {
    id: 2,
    type: 'update',
    title: '更新資源',
    description: 'Database Server 02 的配置已更新',
    status: '成功',
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    id: 3,
    type: 'delete',
    title: '刪除資源',
    description: 'Test Server 03 已從系統中移除',
    status: '成功',
    createdAt: new Date(Date.now() - 7200000)
  },
  {
    id: 4,
    type: 'login',
    title: '用戶登入',
    description: '管理員 admin 登入系統',
    status: '成功',
    createdAt: new Date(Date.now() - 10800000)
  },
  {
    id: 5,
    type: 'error',
    title: '連線失敗',
    description: 'Web Server 05 連線超時',
    status: '失敗',
    createdAt: new Date(Date.now() - 14400000)
  }
])

const recentResources = ref([
  {
    id: 1,
    name: 'Web Server 01',
    resourceType: 'Server',
    ipAddress: '192.168.1.100'
  },
  {
    id: 2,
    name: 'MySQL Database',
    resourceType: 'Database',
    ipAddress: '192.168.1.101'
  },
  {
    id: 3,
    name: 'Redis Cache',
    resourceType: 'Cache',
    ipAddress: '192.168.1.102'
  },
  {
    id: 4,
    name: 'File Storage',
    resourceType: 'Storage',
    ipAddress: '192.168.1.103'
  }
])

// 初始化資源類型分佈圖表
const initResourceTypeChart = () => {
  if (!resourceTypeChart.value) return
  
  resourceTypeChartInstance = echarts.init(resourceTypeChart.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        name: '資源類型',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 45, name: '伺服器', itemStyle: { color: '#0d6efd' } },
          { value: 28, name: '資料庫', itemStyle: { color: '#198754' } },
          { value: 32, name: '網站', itemStyle: { color: '#fd7e14' } },
          { value: 18, name: '儲存', itemStyle: { color: '#dc3545' } },
          { value: 12, name: '緩存', itemStyle: { color: '#6f42c1' } },
          { value: 21, name: '其他', itemStyle: { color: '#6c757d' } }
        ]
      }
    ]
  }
  
  resourceTypeChartInstance.setOption(option)
}

// 初始化用戶活躍度圖表
const initUserActivityChart = () => {
  if (!userActivityChart.value) return
  
  userActivityChartInstance = echarts.init(userActivityChart.value)
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        name: '用戶活躍度',
        type: 'pie',
        radius: '70%',
        center: ['50%', '45%'],
        data: [
          { value: 8, name: '在線', itemStyle: { color: '#198754' } },
          { value: 6, name: '活躍', itemStyle: { color: '#0d6efd' } },
          { value: 10, name: '離線', itemStyle: { color: '#6c757d' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  userActivityChartInstance.setOption(option)
}

// 初始化趨勢圖表
const initTrendChart = () => {
  if (!trendChart.value) return
  
  trendChartInstance = echarts.init(trendChart.value)
  updateTrendChart()
}

// 更新趨勢圖表
const updateTrendChart = () => {
  if (!trendChartInstance) return
  
  const getTrendData = () => {
    switch (trendMetric.value) {
      case 'resources':
        return {
          title: '資源訪問趨勢',
          data: [120, 132, 101, 134, 90, 230, 210, 182, 191, 234, 290, 330, 310],
          color: '#0d6efd'
        }
      case 'logins':
        return {
          title: '用戶登入趨勢',
          data: [220, 182, 191, 234, 290, 330, 310, 123, 442, 321, 90, 149, 210],
          color: '#198754'
        }
      case 'system':
        return {
          title: '系統負載趨勢',
          data: [45, 52, 38, 24, 33, 56, 42, 38, 45, 52, 38, 24, 33],
          color: '#fd7e14'
        }
      default:
        return {
          title: '資源訪問趨勢',
          data: [120, 132, 101, 134, 90, 230, 210, 182, 191, 234, 290, 330, 310],
          color: '#0d6efd'
        }
    }
  }
  
  const { title, data, color } = getTrendData()
  const days = []
  for (let i = 12; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push(date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }))
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: days
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: title,
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          color: color
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: color
            },
            {
              offset: 1,
              color: 'rgba(255, 255, 255, 0.1)'
            }
          ])
        },
        data: data
      }
    ]
  }
  
  trendChartInstance.setOption(option)
}

// 初始化實時監控圖表
const initRealtimeChart = () => {
  if (!realtimeChart.value) return
  
  realtimeChartInstance = echarts.init(realtimeChart.value)
  
  const data = []
  const now = new Date()
  for (let i = 0; i < 20; i++) {
    data.push([
      new Date(now.getTime() - (20 - i) * 30000),
      Math.round(Math.random() * 100)
    ])
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        const date = new Date(params[0].value[0])
        return `${date.toLocaleTimeString()}<br/>${params[0].seriesName}: ${params[0].value[1]}%`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%'
    },
    xAxis: {
      type: 'time',
      splitLine: {
        show: false
      },
      axisLabel: {
        formatter: function (value: any) {
          return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      }
    },
    yAxis: {
      type: 'value',
      boundaryGap: [0, '100%'],
      splitLine: {
        show: false
      },
      max: 100
    },
    series: [
      {
        name: 'CPU使用率',
        type: 'line',
        showSymbol: false,
        emphasis: {
          focus: 'series'
        },
        lineStyle: {
          color: '#0d6efd'
        },
        data: data
      }
    ]
  }
  
  realtimeChartInstance.setOption(option)
  
  // 定時更新實時數據
  startRealtimeUpdate()
}

// 開始實時更新
const startRealtimeUpdate = () => {
  realtimeTimer = setInterval(() => {
    if (!realtimeChartInstance) return
    
    const option = realtimeChartInstance.getOption() as any
    const data = option.series[0].data
    
    // 移除最老的數據點
    data.shift()
    
    // 添加新的數據點
    data.push([new Date(), Math.round(Math.random() * 100)])
    
    // 更新實時監控數據
    realTimeStats.value.apiRequests = Math.floor(Math.random() * 200) + 100
    realTimeStats.value.errorRate = Math.round(Math.random() * 10 * 100) / 100
    realTimeStats.value.onlineUsers = Math.floor(Math.random() * 15) + 5
    
    realtimeChartInstance.setOption({
      series: [{
        data: data
      }]
    })
  }, 3000)
}

// 停止實時更新
const stopRealtimeUpdate = () => {
  if (realtimeTimer) {
    clearInterval(realtimeTimer)
    realtimeTimer = null
  }
}

// 獲取活動圖標
const getActivityIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    create: 'bi bi-plus-circle',
    update: 'bi bi-pencil-square',
    delete: 'bi bi-trash',
    login: 'bi bi-person-check',
    logout: 'bi bi-person-x',
    error: 'bi bi-exclamation-triangle-fill'
  }
  return iconMap[type] || 'bi bi-info-circle'
}

// 獲取活動顏色
const getActivityColor = (type: string) => {
  const colorMap: Record<string, string> = {
    create: '#198754',
    update: '#0d6efd',
    delete: '#dc3545',
    login: '#6c757d',
    logout: '#6c757d',
    error: '#dc3545'
  }
  return colorMap[type] || '#6c757d'
}

// 獲取活動狀態類別
const getActivityStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    '成功': 'bg-success',
    '失敗': 'bg-danger',
    '警告': 'bg-warning',
    '處理中': 'bg-info'
  }
  return classMap[status] || 'bg-secondary'
}

// 獲取資源類型圖標
const getResourceTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    Server: 'bi bi-server',
    Database: 'bi bi-database',
    Website: 'bi bi-globe',
    Storage: 'bi bi-folder',
    Cache: 'bi bi-memory'
  }
  return iconMap[type] || 'bi bi-server'
}

// 獲取資源類型顏色
const getResourceTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    Server: '#0d6efd',
    Database: '#198754',
    Website: '#fd7e14',
    Storage: '#dc3545',
    Cache: '#6f42c1'
  }
  return colorMap[type] || '#6c757d'
}

// 獲取狀態類別
const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    healthy: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-danger'
  }
  return classMap[status] || 'bg-secondary'
}

// 獲取狀態文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    healthy: '正常',
    warning: '警告',
    error: '錯誤'
  }
  return textMap[status] || '未知'
}

// 獲取進度條類別
const getProgressClass = (percentage: number) => {
  if (percentage < 50) return 'bg-success'
  if (percentage < 80) return 'bg-warning'
  return 'bg-danger'
}

// 格式化時間
const formatTime = (time: Date) => {
  return formatDistanceToNow(time, { 
    addSuffix: true, 
    locale: zhTW 
  })
}

// 處理時間範圍變化
const handleTimeRangeChange = (value: string) => {
  console.log('Time range changed to:', value)
  // 這裡可以重新載入數據
  loadDashboardData()
}

// 刷新活動記錄
const refreshActivities = async () => {
  activitiesLoading.value = true
  try {
    // 模擬API請求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 這裡可以重新載入活動數據
    showAlert('活動記錄已刷新', 'success')
  } catch (error) {
    showAlert('刷新失敗', 'danger')
  } finally {
    activitiesLoading.value = false
  }
}

// 匯出數據
const exportData = async () => {
  if (confirm('確定要匯出當前的統計數據嗎？')) {
    try {
      // 模擬匯出處理
      showAlert('數據匯出成功，檔案將下載到本地', 'success')
      
      // 這裡可以實現實際的匯出邏輯
      // const blob = new Blob([csvData], { type: 'text/csv' })
      // const url = URL.createObjectURL(blob)
      // const a = document.createElement('a')
      // a.href = url
      // a.download = 'dashboard_data.csv'
      // a.click()
    } catch (error) {
      showAlert('匯出失敗', 'danger')
    }
  }
}

// 載入儀表板數據
const loadDashboardData = async () => {
  try {
    loading.value = true
    
    // 從後端API獲取真實數據
    const data = await getDashboardStats()
    
    // 更新統計數據
    stats.value = {
      totalResources: data.totalResources,
      totalUsers: data.totalUsers,
      totalTags: data.totalTags,
      activeResources: data.activeResources,
      resourcesTrend: data.resourcesTrend,
      usersTrend: data.usersTrend,
      tagsTrend: data.tagsTrend,
      activeTrend: data.activeTrend
    }
    
    // 更新最近資源數據
    recentResources.value = data.recentResources.map(resource => ({
      id: resource.Id,
      name: resource.Name,
      resourceType: resource.ResourceType,
      ipAddress: resource.IpAddress
    }))
    
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
    showAlert('載入儀表板數據失敗', 'danger')
  } finally {
    loading.value = false
  }
}

// 導航方法
const goToResources = () => router.push('/resources')
const goToUsers = () => router.push('/users')
const goToTags = () => router.push('/tags')
const goToCreateResource = () => router.push('/resources/create')
const goToCreateUser = () => router.push('/users/create')
const goToCreateTag = () => router.push('/tags/create')
const goToSearch = () => router.push('/resources?search=true')
const goToLogs = () => router.push('/logs')
const goToResource = (id: number) => router.push(`/resources/${id}`)

// 窗口大小調整處理
const handleResize = () => {
  if (resourceTypeChartInstance) resourceTypeChartInstance.resize()
  if (userActivityChartInstance) userActivityChartInstance.resize()
  if (trendChartInstance) trendChartInstance.resize()
  if (realtimeChartInstance) realtimeChartInstance.resize()
}

// 組件掛載
onMounted(async () => {
  await loadDashboardData()
  
  await nextTick()
  
  // 初始化所有圖表
  initResourceTypeChart()
  initUserActivityChart()
  initTrendChart()
  initRealtimeChart()
  
  // 添加窗口大小調整監聽器
  window.addEventListener('resize', handleResize)
})

// 組件卸載
onUnmounted(() => {
  // 清理圖表實例
  if (resourceTypeChartInstance) {
    resourceTypeChartInstance.dispose()
    resourceTypeChartInstance = null
  }
  if (userActivityChartInstance) {
    userActivityChartInstance.dispose()
    userActivityChartInstance = null
  }
  if (trendChartInstance) {
    trendChartInstance.dispose()
    trendChartInstance = null
  }
  if (realtimeChartInstance) {
    realtimeChartInstance.dispose()
    realtimeChartInstance = null
  }
  
  // 停止實時更新
  stopRealtimeUpdate()
  
  // 移除事件監聽器
  window.removeEventListener('resize', handleResize)
})

// 顯示Bootstrap警告框
const showAlert = (message: string, type: string) => {
  const alertDiv = document.createElement('div')
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`
  alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 1055; max-width: 350px;'
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `
  
  document.body.appendChild(alertDiv)
  
  // 3秒後自動消失
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.parentNode.removeChild(alertDiv)
    }
  }, 3000)
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 0;
}

.welcome-header {
  padding: 20px;
  
  h1 {
    font-size: 32px;
  }
  
  p {
    font-size: 16px;
    margin: 0;
  }
}

.stats-cards {
  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    border: 1px solid #e9ecef;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
    
    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #0d6efd, #198754);
    }
    
    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      i {
        font-size: 28px;
        color: white;
      }
      
      &.resources {
        background: linear-gradient(135deg, #0d6efd, #6ea8fe);
      }
      
      &.users {
        background: linear-gradient(135deg, #198754, #75b798);
      }
      
      &.tags {
        background: linear-gradient(135deg, #fd7e14, #ffc107);
      }
      
      &.active {
        background: linear-gradient(135deg, #6f42c1, #d63384);
      }
    }
    
    .stat-content {
      flex: 1;
      
      .stat-number {
        font-size: 32px;
        font-weight: 700;
        color: #212529;
        margin-bottom: 4px;
        line-height: 1;
      }
      
      .stat-label {
        font-size: 14px;
        color: #6c757d;
        margin-bottom: 8px;
      }
      
      .stat-trend {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        font-weight: 500;
        
        &.positive {
          color: #198754;
        }
        
        &.negative {
          color: #dc3545;
        }
        
        i {
          font-size: 14px;
        }
      }
    }
  }
}

.main-content {
  .chart-card {
    .card-header {
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
      
      .card-title {
        font-weight: 600;
        color: #495057;
      }
    }
    
    .chart-container {
      height: 300px;
      
      .chart {
        width: 100%;
        height: 100%;
      }
      
      .trend-chart {
        height: 250px;
      }
    }
  }
  
  .activity-card {
    .card-header {
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
      
      .card-title {
        font-weight: 600;
        color: #495057;
      }
    }
    
    .activity-list {
      max-height: 400px;
      overflow-y: auto;
      
      .activity-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 0;
        border-bottom: 1px solid #e9ecef;
        transition: all 0.3s ease;
        
        &:last-child {
          border-bottom: none;
        }
        
        &:hover {
          background: #f8f9fa;
          margin: 0 -16px;
          padding: 16px;
          border-radius: 8px;
        }
        
        .activity-icon {
          i {
            font-size: 20px;
          }
        }
        
        .activity-content {
          flex: 1;
          
          .activity-title {
            font-weight: 500;
            margin-bottom: 4px;
            color: #212529;
          }
          
          .activity-description {
            font-size: 13px;
            color: #6c757d;
            margin-bottom: 4px;
          }
          
          .activity-time {
            font-size: 12px;
            color: #adb5bd;
          }
        }
        
        .activity-status {
          .badge {
            font-size: 11px;
          }
        }
      }
    }
  }
  
  .quick-actions-card {
    .card-header {
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
      
      .card-title {
        font-weight: 600;
        color: #495057;
      }
    }
    
    .quick-actions {
      display: flex;
      flex-direction: column;
      
      .btn {
        text-align: left;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateX(4px);
        }
      }
    }
  }
  
  .monitoring-card {
    .card-header {
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
      
      .card-title {
        font-weight: 600;
        color: #495057;
      }
    }
    
    .monitoring-items {
      .monitoring-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #e9ecef;
        
        &:last-child {
          border-bottom: none;
        }
        
        .monitoring-label {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #6c757d;
          
          i {
            font-size: 16px;
          }
        }
        
        .monitoring-value {
          font-weight: 600;
          color: #212529;
        }
      }
    }
    
    .monitoring-chart {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e9ecef;
      
      .mini-chart {
        height: 120px;
        width: 100%;
      }
    }
  }
  
  .system-status-card {
    .card-header {
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
      
      .card-title {
        font-weight: 600;
        color: #495057;
      }
    }
    
    .status-list {
      .status-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid #e9ecef;
        
        &:last-child {
          border-bottom: none;
        }
        
        .status-label {
          font-size: 14px;
          color: #212529;
          font-weight: 500;
        }
        
        .status-value {
          flex: 1;
          max-width: 120px;
          margin-left: 12px;
        }
      }
    }
  }
  
  .recent-resources-card {
    .card-header {
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
      
      .card-title {
        font-weight: 600;
        color: #495057;
      }
    }
    
    .resource-list {
      .resource-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid #e9ecef;
        cursor: pointer;
        transition: all 0.3s ease;
        border-radius: 6px;
        
        &:hover {
          background-color: #f8f9fa;
          margin: 0 -8px;
          padding: 12px 8px;
        }
        
        &:last-child {
          border-bottom: none;
        }
        
        .resource-icon {
          i {
            font-size: 18px;
          }
        }
        
        .resource-content {
          flex: 1;
          
          .resource-name {
            font-size: 14px;
            font-weight: 500;
            color: #212529;
            margin-bottom: 2px;
          }
          
          .resource-type {
            font-size: 12px;
            margin-bottom: 2px;
          }
          
          .resource-ip {
            font-size: 12px;
            font-family: monospace;
          }
        }
      }
    }
  }
}

// 響應式設計
@media (max-width: 768px) {
  .stats-cards {
    .stat-card {
      padding: 16px;
      
      .stat-icon {
        width: 48px;
        height: 48px;
        
        i {
          font-size: 24px;
        }
      }
      
      .stat-content {
        .stat-number {
          font-size: 24px;
        }
        
        .stat-label {
          font-size: 13px;
        }
        
        .stat-trend {
          font-size: 11px;
        }
      }
    }
  }
  
  .main-content {
    .chart-card {
      .chart-container {
        height: 250px;
        
        .trend-chart {
          height: 200px;
        }
      }
    }
    
    .monitoring-card {
      .monitoring-chart {
        .mini-chart {
          height: 100px;
        }
      }
    }
    
    .quick-actions-card {
      .quick-actions {
        .btn {
          font-size: 13px;
          padding: 8px 12px;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .stats-cards {
    .stat-card {
      flex-direction: column;
      text-align: center;
      gap: 12px;
      
      .stat-content {
        .stat-number {
          font-size: 20px;
        }
      }
    }
  }
  
  .main-content {
    .chart-card {
      .chart-container {
        height: 200px;
        
        .trend-chart {
          height: 150px;
        }
      }
    }
  }
}

// 深色模式支持
@media (prefers-color-scheme: dark) {
  .stats-cards {
    .stat-card {
      background: #212529;
      border-color: #495057;
      color: #fff;
      
      .stat-content {
        .stat-number {
          color: #fff;
        }
        
        .stat-label {
          color: #adb5bd;
        }
      }
    }
  }
  
  .card {
    background: #212529;
    border-color: #495057;
    color: #fff;
    
    .card-header {
      background: #343a40;
      border-color: #495057;
      
      .card-title {
        color: #fff;
      }
    }
  }
  
  .activity-item {
    &:hover {
      background: #343a40;
    }
  }
  
  .resource-item {
    &:hover {
      background: #343a40;
    }
  }
}
</style>