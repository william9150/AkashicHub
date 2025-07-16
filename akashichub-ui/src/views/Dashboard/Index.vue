<template>
  <div class="dashboard-container">
    <!-- 歡迎標題 -->
    <div class="welcome-header">
      <h1>🎯 儀表板</h1>
      <p>歡迎來到 AkashicHub 儀表板！</p>
    </div>
    
    <!-- 頂部統計卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="6">
          <div class="stat-card" @click="goToResources">
            <div class="stat-icon resources">
              <el-icon><Server /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalResources }}</div>
              <div class="stat-label">總資源數</div>
              <div class="stat-trend" :class="{ positive: stats.resourcesTrend > 0, negative: stats.resourcesTrend < 0 }">
                <el-icon>
                  <component :is="stats.resourcesTrend > 0 ? 'CaretTop' : stats.resourcesTrend < 0 ? 'CaretBottom' : 'Minus'" />
                </el-icon>
                {{ Math.abs(stats.resourcesTrend) }}%
              </div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="6">
          <div class="stat-card" @click="goToUsers">
            <div class="stat-icon users">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalUsers }}</div>
              <div class="stat-label">用戶數量</div>
              <div class="stat-trend" :class="{ positive: stats.usersTrend > 0, negative: stats.usersTrend < 0 }">
                <el-icon>
                  <component :is="stats.usersTrend > 0 ? 'CaretTop' : stats.usersTrend < 0 ? 'CaretBottom' : 'Minus'" />
                </el-icon>
                {{ Math.abs(stats.usersTrend) }}%
              </div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="6">
          <div class="stat-card" @click="goToTags">
            <div class="stat-icon tags">
              <el-icon><CollectionTag /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalTags }}</div>
              <div class="stat-label">標籤數量</div>
              <div class="stat-trend" :class="{ positive: stats.tagsTrend > 0, negative: stats.tagsTrend < 0 }">
                <el-icon>
                  <component :is="stats.tagsTrend > 0 ? 'CaretTop' : stats.tagsTrend < 0 ? 'CaretBottom' : 'Minus'" />
                </el-icon>
                {{ Math.abs(stats.tagsTrend) }}%
              </div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="6">
          <div class="stat-card">
            <div class="stat-icon active">
              <el-icon><CircleCheckFilled /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.activeResources }}</div>
              <div class="stat-label">活躍資源</div>
              <div class="stat-trend" :class="{ positive: stats.activeTrend > 0, negative: stats.activeTrend < 0 }">
                <el-icon>
                  <component :is="stats.activeTrend > 0 ? 'CaretTop' : stats.activeTrend < 0 ? 'CaretBottom' : 'Minus'" />
                </el-icon>
                {{ Math.abs(stats.activeTrend) }}%
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 時間範圍選擇器 -->
    <div class="time-range-selector">
      <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
        <el-radio-button value="7d">最近7天</el-radio-button>
        <el-radio-button value="30d">最近30天</el-radio-button>
        <el-radio-button value="90d">最近3個月</el-radio-button>
        <el-radio-button value="1y">最近1年</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 主要內容區域 -->
    <el-row :gutter="20" class="main-content">
      <!-- 左側內容 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <!-- 圖表區域 -->
        <el-row :gutter="20">
          <!-- 資源類型分佈圖表 -->
          <el-col :span="12">
            <el-card class="chart-card" header="資源類型分佈">
              <div class="chart-container">
                <div ref="resourceTypeChart" class="chart"></div>
              </div>
            </el-card>
          </el-col>
          
          <!-- 用戶活躍度圖表 -->
          <el-col :span="12">
            <el-card class="chart-card" header="用戶活躍度">
              <div class="chart-container">
                <div ref="userActivityChart" class="chart"></div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 使用趨勢圖表 -->
        <el-card class="chart-card" header="使用趨勢">
          <template #header>
            <div class="chart-header">
              <span>使用趨勢</span>
              <el-select v-model="trendMetric" style="width: 120px" @change="updateTrendChart">
                <el-option label="資源訪問" value="resources" />
                <el-option label="用戶登入" value="logins" />
                <el-option label="系統負載" value="system" />
              </el-select>
            </div>
          </template>
          <div class="chart-container">
            <div ref="trendChart" class="chart trend-chart"></div>
          </div>
        </el-card>

        <!-- 最近活動 -->
        <el-card class="activity-card">
          <template #header>
            <div class="activity-header">
              <span>最近活動</span>
              <el-button text @click="refreshActivities" :loading="activitiesLoading">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>
          <div class="activity-list">
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="activity-item"
            >
              <div class="activity-icon">
                <el-icon :color="getActivityColor(activity.type)">
                  <component :is="getActivityIcon(activity.type)" />
                </el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-description">{{ activity.description }}</div>
                <div class="activity-time">{{ formatTime(activity.createdAt) }}</div>
              </div>
              <div class="activity-status">
                <el-tag :type="getActivityStatusType(activity.status)" size="small">
                  {{ activity.status }}
                </el-tag>
              </div>
            </div>
            
            <div v-if="recentActivities.length === 0" class="empty-state">
              <el-empty description="暫無活動記錄" :image-size="100" />
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右側內容 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
        <!-- 快速操作 -->
        <el-card class="quick-actions-card" header="快速操作">
          <div class="quick-actions">
            <el-button
              type="primary"
              @click="goToResources"
              block
            >
              管理資源
            </el-button>
            <el-button
              v-if="authStore.canEditUsers"
              type="success"
              @click="goToUsers"
              block
            >
              管理用戶
            </el-button>
            <el-button
              type="info"
              @click="goToTags"
              block
            >
              管理標籤
            </el-button>
            <el-button
              v-if="authStore.canEditITData"
              type="primary"
              icon="Plus"
              @click="goToCreateResource"
              block
            >
              新增資源
            </el-button>
            <el-button
              v-if="authStore.canEditUsers"
              type="success"
              icon="User"
              @click="goToCreateUser"
              block
            >
              新增用戶
            </el-button>
            <el-button
              v-if="authStore.canEditITData"
              type="warning"
              icon="CollectionTag"
              @click="goToCreateTag"
              block
            >
              新增標籤
            </el-button>
            <el-button
              type="info"
              icon="Search"
              @click="goToSearch"
              block
            >
              搜索資源
            </el-button>
            <el-button
              v-if="authStore.isSuperAdmin"
              type="warning"
              icon="Document"
              @click="goToLogs"
              block
            >
              查看日誌
            </el-button>
            <el-button
              type="default"
              icon="Download"
              @click="exportData"
              block
            >
              匯出數據
            </el-button>
          </div>
        </el-card>

        <!-- 實時監控 -->
        <el-card class="monitoring-card" header="實時監控">
          <div class="monitoring-items">
            <div class="monitoring-item">
              <div class="monitoring-label">
                <el-icon><Connection /></el-icon>
                在線用戶
              </div>
              <div class="monitoring-value">{{ realTimeStats.onlineUsers }}</div>
            </div>
            
            <div class="monitoring-item">
              <div class="monitoring-label">
                <el-icon><Clock /></el-icon>
                系統運行時間
              </div>
              <div class="monitoring-value">{{ realTimeStats.uptime }}</div>
            </div>
            
            <div class="monitoring-item">
              <div class="monitoring-label">
                <el-icon><Monitor /></el-icon>
                API 請求/分鐘
              </div>
              <div class="monitoring-value">{{ realTimeStats.apiRequests }}</div>
            </div>
            
            <div class="monitoring-item">
              <div class="monitoring-label">
                <el-icon><Warning /></el-icon>
                錯誤率
              </div>
              <div class="monitoring-value" :class="{ 'high-error': realTimeStats.errorRate > 5 }">
                {{ realTimeStats.errorRate }}%
              </div>
            </div>
          </div>
          
          <div class="monitoring-chart">
            <div ref="realtimeChart" class="mini-chart"></div>
          </div>
        </el-card>

        <!-- 系統狀態 -->
        <el-card class="system-status-card" header="系統狀態">
          <div class="status-list">
            <div class="status-item">
              <div class="status-label">系統狀態</div>
              <div class="status-value">
                <el-tag :type="getStatusType(systemStatus.system)">
                  {{ getStatusText(systemStatus.system) }}
                </el-tag>
              </div>
            </div>
            
            <div class="status-item">
              <div class="status-label">資料庫</div>
              <div class="status-value">
                <el-tag :type="getStatusType(systemStatus.database)">
                  {{ getStatusText(systemStatus.database) }}
                </el-tag>
              </div>
            </div>
            
            <div class="status-item">
              <div class="status-label">記憶體使用</div>
              <div class="status-value">
                <el-progress
                  :percentage="systemStatus.memoryUsage"
                  :color="getProgressColor(systemStatus.memoryUsage)"
                  :show-text="true"
                />
              </div>
            </div>
            
            <div class="status-item">
              <div class="status-label">磁碟使用</div>
              <div class="status-value">
                <el-progress
                  :percentage="systemStatus.diskUsage"
                  :color="getProgressColor(systemStatus.diskUsage)"
                  :show-text="true"
                />
              </div>
            </div>
          </div>
        </el-card>

        <!-- 最近資源 -->
        <el-card class="recent-resources-card" header="最近資源">
          <div class="resource-list">
            <div
              v-for="resource in recentResources"
              :key="resource.id"
              class="resource-item"
              @click="goToResource(resource.id)"
            >
              <div class="resource-icon">
                <el-icon :color="getResourceTypeColor(resource.resourceType)">
                  <component :is="getResourceTypeIcon(resource.resourceType)" />
                </el-icon>
              </div>
              <div class="resource-content">
                <div class="resource-name">{{ resource.name }}</div>
                <div class="resource-type">{{ resource.resourceType }}</div>
                <div class="resource-ip">{{ resource.ipAddress }}</div>
              </div>
            </div>
            
            <div v-if="recentResources.length === 0" class="empty-state">
              <el-empty description="暫無最近資源" :image-size="80" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Server,
  User,
  CollectionTag,
  CircleCheckFilled,
  Plus,
  Search,
  Document,
  Monitor,
  Database,
  FolderOpened,
  Basketball,
  InfoFilled,
  SuccessFilled,
  WarningFilled,
  CircleCloseFilled,
  CaretTop,
  CaretBottom,
  Minus,
  Refresh,
  Download,
  Connection,
  Clock,
  Warning,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import * as echarts from 'echarts'

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
          { value: 45, name: '伺服器', itemStyle: { color: '#409eff' } },
          { value: 28, name: '資料庫', itemStyle: { color: '#67c23a' } },
          { value: 32, name: '網站', itemStyle: { color: '#e6a23c' } },
          { value: 18, name: '儲存', itemStyle: { color: '#f56c6c' } },
          { value: 12, name: '緩存', itemStyle: { color: '#722ed1' } },
          { value: 21, name: '其他', itemStyle: { color: '#909399' } }
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
          { value: 8, name: '在線', itemStyle: { color: '#67c23a' } },
          { value: 6, name: '活躍', itemStyle: { color: '#409eff' } },
          { value: 10, name: '離線', itemStyle: { color: '#909399' } }
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
          color: '#409eff'
        }
      case 'logins':
        return {
          title: '用戶登入趨勢',
          data: [220, 182, 191, 234, 290, 330, 310, 123, 442, 321, 90, 149, 210],
          color: '#67c23a'
        }
      case 'system':
        return {
          title: '系統負載趨勢',
          data: [45, 52, 38, 24, 33, 56, 42, 38, 45, 52, 38, 24, 33],
          color: '#e6a23c'
        }
      default:
        return {
          title: '資源訪問趨勢',
          data: [120, 132, 101, 134, 90, 230, 210, 182, 191, 234, 290, 330, 310],
          color: '#409eff'
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
          color: '#409eff'
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
    create: 'Plus',
    update: 'Edit',
    delete: 'Delete',
    login: 'User',
    logout: 'SwitchButton',
    error: 'WarningFilled'
  }
  return iconMap[type] || 'InfoFilled'
}

// 獲取活動顏色
const getActivityColor = (type: string) => {
  const colorMap: Record<string, string> = {
    create: '#67c23a',
    update: '#409eff',
    delete: '#f56c6c',
    login: '#909399',
    logout: '#909399',
    error: '#f56c6c'
  }
  return colorMap[type] || '#909399'
}

// 獲取活動狀態類型
const getActivityStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    '成功': 'success',
    '失敗': 'danger',
    '警告': 'warning',
    '處理中': 'info'
  }
  return typeMap[status] || 'info'
}

// 獲取資源類型圖標
const getResourceTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    Server: 'Monitor',
    Database: 'Coin',
    Website: 'Basketball',
    Storage: 'FolderOpened',
    Cache: 'Basketball'
  }
  return iconMap[type] || 'Monitor'
}

// 獲取資源類型顏色
const getResourceTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    Server: '#409eff',
    Database: '#67c23a',
    Website: '#e6a23c',
    Storage: '#f56c6c',
    Cache: '#722ed1'
  }
  return colorMap[type] || '#909399'
}

// 獲取狀態類型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    healthy: 'success',
    warning: 'warning',
    error: 'danger'
  }
  return typeMap[status] || 'info'
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

// 獲取進度條顏色
const getProgressColor = (percentage: number) => {
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
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
    ElMessage.success('活動記錄已刷新')
  } catch (error) {
    ElMessage.error('刷新失敗')
  } finally {
    activitiesLoading.value = false
  }
}

// 匯出數據
const exportData = async () => {
  try {
    await ElMessageBox.confirm(
      '確定要匯出當前的統計數據嗎？',
      '確認匯出',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    // 模擬匯出處理
    ElMessage.success('數據匯出成功，檔案將下載到本地')
    
    // 這裡可以實現實際的匯出邏輯
    // const blob = new Blob([csvData], { type: 'text/csv' })
    // const url = URL.createObjectURL(blob)
    // const a = document.createElement('a')
    // a.href = url
    // a.download = 'dashboard_data.csv'
    // a.click()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('匯出失敗')
    }
  }
}

// 載入儀表板數據
const loadDashboardData = async () => {
  try {
    loading.value = true
    
    // 這裡調用API獲取儀表板數據
    // const data = await dashboardApi.getStats(timeRange.value)
    
    // 模擬API請求
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 更新統計數據
    stats.value = {
      totalResources: 156 + Math.floor(Math.random() * 20),
      totalUsers: 24 + Math.floor(Math.random() * 10),
      totalTags: 48 + Math.floor(Math.random() * 15),
      activeResources: 142 + Math.floor(Math.random() * 10),
      resourcesTrend: Math.round((Math.random() * 20 - 10) * 10) / 10,
      usersTrend: Math.round((Math.random() * 20 - 10) * 10) / 10,
      tagsTrend: Math.round((Math.random() * 20 - 10) * 10) / 10,
      activeTrend: Math.round((Math.random() * 20 - 10) * 10) / 10
    }
    
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
    ElMessage.error('載入儀表板數據失敗')
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
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 0;
}

.welcome-header {
  text-align: center;
  margin-bottom: 20px;
  padding: 20px;
  
  h1 {
    color: #409eff;
    margin-bottom: 10px;
    font-size: 32px;
  }
  
  p {
    color: var(--el-text-color-regular);
    font-size: 16px;
    margin: 0;
  }
}

.stats-cards {
  margin-bottom: 20px;
  
  .stat-card {
    background: var(--el-bg-color);
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
      background: linear-gradient(90deg, #409eff, #67c23a);
    }
    
    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .el-icon {
        font-size: 28px;
        color: white;
      }
      
      &.resources {
        background: linear-gradient(135deg, #409eff, #66b3ff);
      }
      
      &.users {
        background: linear-gradient(135deg, #67c23a, #85d85a);
      }
      
      &.tags {
        background: linear-gradient(135deg, #e6a23c, #f2b85c);
      }
      
      &.active {
        background: linear-gradient(135deg, #722ed1, #9254de);
      }
    }
    
    .stat-content {
      flex: 1;
      
      .stat-number {
        font-size: 32px;
        font-weight: 700;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;
        line-height: 1;
      }
      
      .stat-label {
        font-size: 14px;
        color: var(--el-text-color-regular);
        margin-bottom: 8px;
      }
      
      .stat-trend {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        font-weight: 500;
        
        &.positive {
          color: #67c23a;
        }
        
        &.negative {
          color: #f56c6c;
        }
        
        .el-icon {
          font-size: 14px;
        }
      }
    }
  }
}

.time-range-selector {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.main-content {
  .chart-card {
    margin-bottom: 20px;
    
    :deep(.el-card__header) {
      background: var(--el-bg-color-page);
      border-bottom: 1px solid var(--el-border-color-light);
      
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
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
    margin-bottom: 20px;
    
    :deep(.el-card__header) {
      background: var(--el-bg-color-page);
      border-bottom: 1px solid var(--el-border-color-light);
      
      .activity-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
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
        border-bottom: 1px solid var(--el-border-color-lighter);
        transition: all 0.3s ease;
        
        &:last-child {
          border-bottom: none;
        }
        
        &:hover {
          background: var(--el-bg-color-page);
          margin: 0 -16px;
          padding: 16px;
          border-radius: 8px;
        }
        
        .activity-icon {
          .el-icon {
            font-size: 20px;
          }
        }
        
        .activity-content {
          flex: 1;
          
          .activity-title {
            font-weight: 500;
            margin-bottom: 4px;
            color: var(--el-text-color-primary);
          }
          
          .activity-description {
            font-size: 13px;
            color: var(--el-text-color-regular);
            margin-bottom: 4px;
          }
          
          .activity-time {
            font-size: 12px;
            color: var(--el-text-color-placeholder);
          }
        }
        
        .activity-status {
          .el-tag {
            font-size: 11px;
          }
        }
      }
      
      .empty-state {
        text-align: center;
        padding: 40px;
      }
    }
  }
  
  .quick-actions-card {
    margin-bottom: 20px;
    
    .quick-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      .el-button {
        justify-content: flex-start;
        text-align: left;
        
        &:hover {
          transform: translateX(4px);
        }
      }
    }
  }
  
  .monitoring-card {
    margin-bottom: 20px;
    
    .monitoring-items {
      .monitoring-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid var(--el-border-color-lighter);
        
        &:last-child {
          border-bottom: none;
        }
        
        .monitoring-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--el-text-color-regular);
          
          .el-icon {
            font-size: 16px;
          }
        }
        
        .monitoring-value {
          font-weight: 600;
          color: var(--el-text-color-primary);
          
          &.high-error {
            color: var(--el-color-danger);
          }
        }
      }
    }
    
    .monitoring-chart {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--el-border-color-lighter);
      
      .mini-chart {
        height: 120px;
        width: 100%;
      }
    }
  
  .system-status-card {
    margin-bottom: 20px;
    
    .status-list {
      .status-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid var(--el-border-color-lighter);
        
        &:last-child {
          border-bottom: none;
        }
        
        .status-label {
          font-size: 14px;
          color: var(--el-text-color-primary);
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
    .resource-list {
      .resource-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid var(--el-border-color-lighter);
        cursor: pointer;
        transition: all 0.3s ease;
        border-radius: 6px;
        
        &:hover {
          background-color: var(--el-bg-color-page);
          margin: 0 -8px;
          padding: 12px 8px;
        }
        
        &:last-child {
          border-bottom: none;
        }
        
        .resource-icon {
          .el-icon {
            font-size: 18px;
          }
        }
        
        .resource-content {
          flex: 1;
          
          .resource-name {
            font-size: 14px;
            font-weight: 500;
            color: var(--el-text-color-primary);
            margin-bottom: 2px;
          }
          
          .resource-type {
            font-size: 12px;
            color: var(--el-text-color-regular);
            margin-bottom: 2px;
          }
          
          .resource-ip {
            font-size: 12px;
            color: var(--el-text-color-placeholder);
            font-family: monospace;
          }
        }
      }
      
      .empty-state {
        text-align: center;
        padding: 40px;
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
        
        .el-icon {
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
  
  .time-range-selector {
    margin-bottom: 16px;
    
    :deep(.el-radio-group) {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
      
      .el-radio-button {
        margin-right: 0;
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
        gap: 6px;
        
        .el-button {
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

// 暗黑模式
.dark {
  .stats-cards {
    .stat-card {
      background: var(--el-bg-color);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
      
      &:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      }
    }
  }
  
  .main-content {
    .chart-card,
    .activity-card,
    .quick-actions-card,
    .monitoring-card,
    .system-status-card,
    .recent-resources-card {
      :deep(.el-card__header) {
        background: var(--el-bg-color-page);
        border-bottom-color: var(--el-border-color-light);
      }
    }
    
    .activity-card {
      .activity-list {
        .activity-item {
          &:hover {
            background: var(--el-bg-color-page);
          }
        }
      }
    }
    
    .recent-resources-card {
      .resource-list {
        .resource-item {
          &:hover {
            background: var(--el-bg-color-page);
          }
        }
      }
    }
    
    .monitoring-card {
      .monitoring-chart {
        border-top-color: var(--el-border-color-lighter);
      }
    }
  }
}
</style>