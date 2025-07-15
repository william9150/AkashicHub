<template>
  <div class="resource-detail">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>
    
    <div v-else-if="resource" class="detail-content">
      <!-- 頁面頭部 -->
      <div class="page-header">
        <div class="header-left">
          <div class="resource-info">
            <div class="resource-icon">
              <el-icon :color="getResourceTypeColor(resource.resourceType)" size="32">
                <component :is="getResourceTypeIcon(resource.resourceType)" />
              </el-icon>
            </div>
            <div class="resource-basic">
              <h1 class="resource-name">{{ resource.name }}</h1>
              <div class="resource-meta">
                <el-tag :type="getResourceTypeTagType(resource.resourceType)">
                  {{ resource.resourceType }}
                </el-tag>
                <el-tag :type="getStatusTagType(resource.status)">
                  {{ getStatusText(resource.status) }}
                </el-tag>
                <span class="resource-ip">{{ resource.ipAddress }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="header-right">
          <el-button icon="Refresh" @click="loadData">刷新</el-button>
          <el-button
            v-if="authStore.isAdmin"
            type="primary"
            icon="Edit"
            @click="goToEdit"
          >
            編輯
          </el-button>
          <el-button
            v-if="authStore.isAdmin"
            type="danger"
            icon="Delete"
            @click="handleDelete"
          >
            刪除
          </el-button>
        </div>
      </div>

      <!-- 主要內容 -->
      <el-row :gutter="20">
        <!-- 左側主要信息 -->
        <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
          <!-- 基本信息 -->
          <el-card class="info-card" header="基本信息">
            <div class="info-grid">
              <div class="info-item">
                <label>資源名稱：</label>
                <span>{{ resource.name }}</span>
              </div>
              <div class="info-item">
                <label>資源類型：</label>
                <el-tag :type="getResourceTypeTagType(resource.resourceType)">
                  {{ resource.resourceType }}
                </el-tag>
              </div>
              <div class="info-item">
                <label>IP地址：</label>
                <el-button
                  type="primary"
                  text
                  @click="copyToClipboard(resource.ipAddress)"
                >
                  {{ resource.ipAddress }}
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </div>
              <div class="info-item">
                <label>狀態：</label>
                <el-tag :type="getStatusTagType(resource.status)">
                  {{ getStatusText(resource.status) }}
                </el-tag>
              </div>
              <div class="info-item">
                <label>描述：</label>
                <span>{{ resource.description || '無描述' }}</span>
              </div>
              <div class="info-item">
                <label>創建時間：</label>
                <span>{{ formatDateTime(resource.createdAt) }}</span>
              </div>
              <div class="info-item">
                <label>更新時間：</label>
                <span>{{ formatDateTime(resource.updatedAt) }}</span>
              </div>
            </div>
          </el-card>

          <!-- 連接信息 -->
          <el-card class="info-card" header="連接信息">
            <div class="info-grid">
              <div class="info-item">
                <label>登入用戶：</label>
                <el-button
                  type="primary"
                  text
                  @click="copyToClipboard(resource.loginUser)"
                >
                  {{ resource.loginUser }}
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </div>
              <div class="info-item">
                <label>登入密碼：</label>
                <div class="password-field">
                  <el-input
                    v-model="decryptedPassword"
                    type="password"
                    readonly
                    style="width: 200px;"
                  />
                  <el-button
                    type="primary"
                    text
                    @click="decryptPassword"
                    :loading="decryptLoading"
                  >
                    <el-icon><View /></el-icon>
                    解密
                  </el-button>
                  <el-button
                    v-if="decryptedPassword"
                    type="primary"
                    text
                    @click="copyToClipboard(decryptedPassword)"
                  >
                    <el-icon><DocumentCopy /></el-icon>
                    複製
                  </el-button>
                </div>
              </div>
              <div class="info-item">
                <label>端口：</label>
                <span>{{ resource.port }}</span>
              </div>
              <div class="info-item">
                <label>協議：</label>
                <el-tag type="info">{{ resource.protocol?.toUpperCase() }}</el-tag>
              </div>
            </div>
          </el-card>

          <!-- 標籤信息 -->
          <el-card class="info-card" header="標籤信息">
            <div class="tags-container">
              <el-tag
                v-for="tag in resource.tags"
                :key="tag.id"
                :type="getTagType(tag.category)"
                class="tag-item"
              >
                {{ tag.name }}
              </el-tag>
              <el-tag
                v-for="customTag in resource.customTags"
                :key="customTag"
                type="info"
                class="tag-item"
              >
                {{ customTag }}
              </el-tag>
            </div>
          </el-card>

          <!-- 操作記錄 -->
          <el-card class="info-card" header="操作記錄">
            <div class="activity-list">
              <div
                v-for="activity in activities"
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
                  <div class="activity-meta">
                    <span class="activity-user">{{ activity.user }}</span>
                    <span class="activity-time">{{ formatTime(activity.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右側附加信息 -->
        <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <!-- 快速操作 -->
          <el-card class="info-card" header="快速操作">
            <div class="quick-actions">
              <el-button
                type="primary"
                icon="Link"
                @click="testConnection"
                :loading="testingConnection"
              >
                測試連接
              </el-button>
              <el-button
                type="success"
                icon="Monitor"
                @click="openMonitoring"
              >
                監控狀態
              </el-button>
              <el-button
                type="warning"
                icon="Tools"
                @click="openMaintenance"
              >
                維護模式
              </el-button>
            </div>
          </el-card>

          <!-- 相關資源 -->
          <el-card class="info-card" header="相關資源">
            <div class="related-resources">
              <div
                v-for="relatedResource in relatedResources"
                :key="relatedResource.id"
                class="related-item"
                @click="goToResource(relatedResource.id)"
              >
                <div class="related-icon">
                  <el-icon :color="getResourceTypeColor(relatedResource.resourceType)">
                    <component :is="getResourceTypeIcon(relatedResource.resourceType)" />
                  </el-icon>
                </div>
                <div class="related-content">
                  <div class="related-name">{{ relatedResource.name }}</div>
                  <div class="related-type">{{ relatedResource.resourceType }}</div>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 統計信息 -->
          <el-card class="info-card" header="統計信息">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-label">訪問次數</div>
                <div class="stat-value">{{ stats.accessCount }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">最後訪問</div>
                <div class="stat-value">{{ formatTime(stats.lastAccess) }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">連接狀態</div>
                <div class="stat-value">
                  <el-tag :type="stats.connectionStatus === 'online' ? 'success' : 'danger'">
                    {{ stats.connectionStatus === 'online' ? '在線' : '離線' }}
                  </el-tag>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-label">重要程度</div>
                <div class="stat-value">
                  <el-rate
                    v-model="resource.priority"
                    disabled
                    show-score
                    text-color="#ff9900"
                  />
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <div v-else class="error-state">
      <el-empty description="資源不存在或已被刪除" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Edit,
  Delete,
  DocumentCopy,
  View,
  Link,
  Monitor,
  Tools,
  Plus,
  Setting,
  User,
  Warning
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { format } from 'date-fns'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'

// 狀態管理
const authStore = useAuthStore()

// 路由
const route = useRoute()
const router = useRouter()

// 響應式數據
const loading = ref(true)
const resource = ref<any>(null)
const decryptedPassword = ref('')
const decryptLoading = ref(false)
const testingConnection = ref(false)

// 模擬數據
const activities = ref([
  {
    id: 1,
    type: 'create',
    title: '資源創建',
    description: '資源已成功創建',
    user: 'admin',
    createdAt: new Date('2024-01-15T10:30:00')
  },
  {
    id: 2,
    type: 'update',
    title: '資源更新',
    description: '更新了資源配置',
    user: 'admin',
    createdAt: new Date('2024-01-14T15:45:00')
  },
  {
    id: 3,
    type: 'access',
    title: '資源訪問',
    description: '用戶訪問了此資源',
    user: 'user1',
    createdAt: new Date('2024-01-13T09:20:00')
  }
])

const relatedResources = ref([
  {
    id: 2,
    name: 'MySQL Database',
    resourceType: 'Database'
  },
  {
    id: 3,
    name: 'Redis Cache',
    resourceType: 'Cache'
  }
])

const stats = ref({
  accessCount: 156,
  lastAccess: new Date('2024-01-15T14:30:00'),
  connectionStatus: 'online'
})

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

// 獲取資源類型標籤類型
const getResourceTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    Server: 'primary',
    Database: 'success',
    Website: 'warning',
    Storage: 'danger',
    Cache: 'info'
  }
  return typeMap[type] || 'info'
}

// 獲取狀態標籤類型
const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    maintenance: 'warning'
  }
  return typeMap[status] || 'info'
}

// 獲取狀態文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    active: '正常',
    inactive: '停用',
    maintenance: '維護中'
  }
  return textMap[status] || '未知'
}

// 獲取標籤類型
const getTagType = (category: string) => {
  const typeMap: Record<string, string> = {
    Environment: 'primary',
    Priority: 'warning',
    Department: 'success',
    Project: 'info'
  }
  return typeMap[category] || 'info'
}

// 獲取活動圖標
const getActivityIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    create: 'Plus',
    update: 'Edit',
    delete: 'Delete',
    access: 'View',
    maintenance: 'Tools'
  }
  return iconMap[type] || 'InfoFilled'
}

// 獲取活動顏色
const getActivityColor = (type: string) => {
  const colorMap: Record<string, string> = {
    create: '#67c23a',
    update: '#409eff',
    delete: '#f56c6c',
    access: '#909399',
    maintenance: '#e6a23c'
  }
  return colorMap[type] || '#909399'
}

// 格式化日期時間
const formatDateTime = (date: Date) => {
  return format(date, 'yyyy-MM-dd HH:mm:ss')
}

// 格式化時間
const formatTime = (time: Date) => {
  return formatDistanceToNow(time, { 
    addSuffix: true, 
    locale: zhTW 
  })
}

// 複製到剪貼板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已複製到剪貼板')
  } catch (error) {
    ElMessage.error('複製失敗')
  }
}

// 解密密碼
const decryptPassword = async () => {
  try {
    decryptLoading.value = true
    
    // 這裡調用解密API
    // const response = await resourcesApi.decryptPassword(resource.value.id)
    // decryptedPassword.value = response.password
    
    // 模擬解密
    await new Promise(resolve => setTimeout(resolve, 500))
    decryptedPassword.value = 'decrypted_password_123'
    
    ElMessage.success('密碼解密成功')
  } catch (error) {
    ElMessage.error('密碼解密失敗')
  } finally {
    decryptLoading.value = false
  }
}

// 測試連接
const testConnection = async () => {
  try {
    testingConnection.value = true
    
    // 這裡調用測試連接API
    // const response = await resourcesApi.testConnection(resource.value.id)
    
    // 模擬測試
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('連接測試成功')
  } catch (error) {
    ElMessage.error('連接測試失敗')
  } finally {
    testingConnection.value = false
  }
}

// 打開監控
const openMonitoring = () => {
  ElMessage.info('監控功能開發中...')
}

// 打開維護模式
const openMaintenance = () => {
  ElMessage.info('維護功能開發中...')
}

// 前往編輯頁面
const goToEdit = () => {
  router.push(`/resources/${resource.value.id}/edit`)
}

// 前往相關資源
const goToResource = (id: number) => {
  router.push(`/resources/${id}`)
}

// 處理刪除
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `確定要刪除資源 "${resource.value.name}" 嗎？此操作不可恢復。`,
      '確認刪除',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 這裡調用刪除API
    // await resourcesApi.deleteResource(resource.value.id)
    
    ElMessage.success('刪除成功')
    router.push('/resources')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('刪除失敗')
    }
  }
}

// 載入數據
const loadData = async () => {
  try {
    loading.value = true
    
    const id = route.params.id
    
    // 這裡調用API獲取資源詳情
    // const response = await resourcesApi.getResourceById(id)
    // resource.value = response
    
    // 模擬數據
    await new Promise(resolve => setTimeout(resolve, 500))
    
    resource.value = {
      id: 1,
      name: 'Web Server 01',
      resourceType: 'Server',
      ipAddress: '192.168.1.100',
      description: '主要的Web伺服器，處理前端請求',
      loginUser: 'admin',
      port: 22,
      protocol: 'ssh',
      status: 'active',
      priority: 4,
      tags: [
        { id: 1, name: '生產環境', category: 'Environment' },
        { id: 4, name: '高優先級', category: 'Priority' }
      ],
      customTags: ['Web服務', '負載均衡'],
      createdAt: new Date('2024-01-10T08:00:00'),
      updatedAt: new Date('2024-01-15T10:30:00')
    }
    
  } catch (error) {
    console.error('Failed to load resource:', error)
    ElMessage.error('載入資源失敗')
  } finally {
    loading.value = false
  }
}

// 組件掛載
onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.resource-detail {
  .loading-container {
    padding: 20px;
  }
  
  .detail-content {
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 20px;
      background: var(--el-bg-color);
      border-radius: 8px;
      border: 1px solid var(--el-border-color);
      
      .header-left {
        .resource-info {
          display: flex;
          align-items: center;
          gap: 16px;
          
          .resource-icon {
            width: 64px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--el-bg-color-page);
            border-radius: 12px;
          }
          
          .resource-basic {
            .resource-name {
              margin: 0 0 8px 0;
              font-size: 28px;
              font-weight: 600;
              color: var(--el-text-color-primary);
            }
            
            .resource-meta {
              display: flex;
              align-items: center;
              gap: 12px;
              
              .resource-ip {
                font-family: monospace;
                color: var(--el-text-color-regular);
                background: var(--el-bg-color-page);
                padding: 2px 8px;
                border-radius: 4px;
              }
            }
          }
        }
      }
      
      .header-right {
        display: flex;
        gap: 8px;
      }
    }
    
    .info-card {
      margin-bottom: 20px;
      
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        
        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          
          label {
            font-weight: 500;
            color: var(--el-text-color-regular);
            min-width: 80px;
          }
          
          .password-field {
            display: flex;
            align-items: center;
            gap: 8px;
          }
        }
      }
      
      .tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        
        .tag-item {
          margin: 0;
        }
      }
      
      .activity-list {
        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--el-border-color-lighter);
          
          &:last-child {
            border-bottom: none;
          }
          
          .activity-icon {
            margin-top: 4px;
            
            .el-icon {
              font-size: 16px;
            }
          }
          
          .activity-content {
            flex: 1;
            
            .activity-title {
              font-size: 14px;
              font-weight: 500;
              color: var(--el-text-color-primary);
              margin-bottom: 4px;
            }
            
            .activity-description {
              font-size: 13px;
              color: var(--el-text-color-regular);
              margin-bottom: 4px;
            }
            
            .activity-meta {
              display: flex;
              align-items: center;
              gap: 12px;
              
              .activity-user {
                font-size: 12px;
                color: var(--el-text-color-placeholder);
              }
              
              .activity-time {
                font-size: 12px;
                color: var(--el-text-color-placeholder);
              }
            }
          }
        }
      }
      
      .quick-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
        
        .el-button {
          width: 100%;
          justify-content: flex-start;
        }
      }
      
      .related-resources {
        .related-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--el-border-color-lighter);
          cursor: pointer;
          transition: background-color 0.3s ease;
          
          &:hover {
            background-color: var(--el-bg-color-page);
          }
          
          &:last-child {
            border-bottom: none;
          }
          
          .related-icon {
            .el-icon {
              font-size: 18px;
            }
          }
          
          .related-content {
            flex: 1;
            
            .related-name {
              font-size: 14px;
              font-weight: 500;
              color: var(--el-text-color-primary);
              margin-bottom: 2px;
            }
            
            .related-type {
              font-size: 12px;
              color: var(--el-text-color-regular);
            }
          }
        }
      }
      
      .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        
        .stat-item {
          text-align: center;
          
          .stat-label {
            font-size: 12px;
            color: var(--el-text-color-regular);
            margin-bottom: 4px;
          }
          
          .stat-value {
            font-size: 14px;
            font-weight: 500;
            color: var(--el-text-color-primary);
          }
        }
      }
    }
  }
  
  .error-state {
    padding: 40px;
    text-align: center;
  }
}

// 響應式設計
@media (max-width: 768px) {
  .resource-detail {
    .detail-content {
      .page-header {
        flex-direction: column;
        gap: 16px;
        
        .header-left {
          width: 100%;
          
          .resource-info {
            .resource-basic {
              .resource-name {
                font-size: 24px;
              }
              
              .resource-meta {
                flex-wrap: wrap;
              }
            }
          }
        }
        
        .header-right {
          width: 100%;
          justify-content: center;
        }
      }
      
      .info-card {
        .info-grid {
          grid-template-columns: 1fr;
        }
        
        .stats-grid {
          grid-template-columns: 1fr;
        }
      }
    }
  }
}

// 暗黑模式
.dark {
  .resource-detail {
    .detail-content {
      .page-header {
        background: var(--el-bg-color);
        border-color: var(--el-border-color);
      }
    }
  }
}
</style>