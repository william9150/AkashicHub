<template>
  <div class="resource-detail">
    <div v-if="loading" class="loading-container">
      <div class="d-flex justify-content-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">加載中...</span>
        </div>
      </div>
    </div>
    
    <div v-else-if="resource" class="detail-content">
      <!-- 頁面頭部 -->
      <div class="page-header">
        <div class="header-left">
          <div class="resource-info">
            <div class="resource-icon">
              <i :class="getResourceTypeIconClass(resource.resourceType)" :style="{ color: getResourceTypeColor(resource.resourceType) }"></i>
            </div>
            <div class="resource-basic">
              <h1 class="resource-name">{{ resource.name }}</h1>
              <div class="resource-meta">
                <span :class="getResourceTypeTagClass(resource.resourceType)">
                  {{ resource.resourceType }}
                </span>
                <span :class="getStatusTagClass(resource.status)">
                  {{ getStatusText(resource.status) }}
                </span>
                <span class="resource-ip">{{ resource.ipAddress }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="header-right">
          <button type="button" class="btn btn-outline-secondary" @click="loadData">
            <i class="bi bi-arrow-clockwise me-1"></i>
            刷新
          </button>
          <button
            v-if="authStore.isAdmin"
            type="button"
            class="btn btn-primary"
            @click="goToEdit"
          >
            <i class="bi bi-pencil me-1"></i>
            編輯
          </button>
          <button
            v-if="authStore.isAdmin"
            type="button"
            class="btn btn-danger"
            @click="handleDelete"
          >
            <i class="bi bi-trash me-1"></i>
            刪除
          </button>
        </div>
      </div>

      <!-- 主要內容 -->
      <div class="row">
        <!-- 左側主要信息 -->
        <div class="col-lg-8">
          <!-- 基本信息 -->
          <div class="card info-card">
            <div class="card-header">
              <h5 class="card-title mb-0">基本信息</h5>
            </div>
            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <label>資源名稱：</label>
                  <span>{{ resource.name }}</span>
                </div>
                <div class="info-item">
                  <label>資源類型：</label>
                  <span :class="getResourceTypeTagClass(resource.resourceType)">
                    {{ resource.resourceType }}
                  </span>
                </div>
                <div class="info-item">
                  <label>IP地址：</label>
                  <button
                    type="button"
                    class="btn btn-link p-0"
                    @click="copyToClipboard(resource.ipAddress)"
                  >
                    {{ resource.ipAddress }}
                    <i class="bi bi-clipboard ms-1"></i>
                  </button>
                </div>
                <div class="info-item">
                  <label>狀態：</label>
                  <span :class="getStatusTagClass(resource.status)">
                    {{ getStatusText(resource.status) }}
                  </span>
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
            </div>
          </div>

          <!-- 連接信息 -->
          <div class="card info-card">
            <div class="card-header">
              <h5 class="card-title mb-0">連接信息</h5>
            </div>
            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <label>登入用戶：</label>
                  <button
                    type="button"
                    class="btn btn-link p-0"
                    @click="copyToClipboard(resource.loginUser)"
                  >
                    {{ resource.loginUser }}
                    <i class="bi bi-clipboard ms-1"></i>
                  </button>
                </div>
                <div class="info-item">
                  <label>登入密碼：</label>
                  <div class="password-field">
                    <input
                      v-model="decryptedPassword"
                      type="password"
                      class="form-control"
                      readonly
                      style="width: 200px;"
                    />
                    <button
                      type="button"
                      class="btn btn-link p-0"
                      @click="decryptPassword"
                      :disabled="decryptLoading"
                    >
                      <span v-if="decryptLoading" class="spinner-border spinner-border-sm me-1"></span>
                      <i v-else class="bi bi-eye me-1"></i>
                      解密
                    </button>
                    <button
                      v-if="decryptedPassword"
                      type="button"
                      class="btn btn-link p-0"
                      @click="copyToClipboard(decryptedPassword)"
                    >
                      <i class="bi bi-clipboard me-1"></i>
                      複製
                    </button>
                  </div>
                </div>
                <div class="info-item">
                  <label>端口：</label>
                  <span>{{ resource.port }}</span>
                </div>
                <div class="info-item">
                  <label>協議：</label>
                  <span class="badge bg-info">{{ resource.protocol?.toUpperCase() }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 標籤信息 -->
          <div class="card info-card">
            <div class="card-header">
              <h5 class="card-title mb-0">標籤信息</h5>
            </div>
            <div class="card-body">
              <div class="tags-container">
                <span
                  v-for="tag in resource.tags"
                  :key="tag.id"
                  :class="getTagClass(tag.category)"
                  class="tag-item"
                >
                  {{ tag.name }}
                </span>
                <span
                  v-for="customTag in resource.customTags"
                  :key="customTag"
                  class="badge bg-info tag-item"
                >
                  {{ customTag }}
                </span>
              </div>
            </div>
          </div>

          <!-- 操作記錄 -->
          <div class="card info-card">
            <div class="card-header">
              <h5 class="card-title mb-0">操作記錄</h5>
            </div>
            <div class="card-body">
              <div class="activity-list">
                <div
                  v-for="activity in activities"
                  :key="activity.id"
                  class="activity-item"
                >
                  <div class="activity-icon">
                    <i :class="getActivityIcon(activity.type)" :style="{ color: getActivityColor(activity.type) }"></i>
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
            </div>
          </div>
        </div>

        <!-- 右側附加信息 -->
        <div class="col-lg-4">
          <!-- 快速操作 -->
          <div class="card info-card">
            <div class="card-header">
              <h5 class="card-title mb-0">快速操作</h5>
            </div>
            <div class="card-body">
              <div class="quick-actions d-grid gap-2">
                <button
                  type="button"
                  class="btn btn-primary"
                  @click="testConnection"
                  :disabled="testingConnection"
                >
                  <i class="bi bi-link-45deg me-2"></i>
                  {{ testingConnection ? '測試中...' : '測試連接' }}
                </button>
                <button
                  type="button"
                  class="btn btn-success"
                  @click="openMonitoring"
                >
                  <i class="bi bi-activity me-2"></i>
                  監控狀態
                </button>
                <button
                  type="button"
                  class="btn btn-warning"
                  @click="openMaintenance"
                >
                  <i class="bi bi-tools me-2"></i>
                  維護模式
                </button>
              </div>
            </div>
          </div>

          <!-- 相關資源 -->
          <div class="card info-card">
            <div class="card-header">
              <h5 class="card-title mb-0">相關資源</h5>
            </div>
            <div class="card-body">
              <div class="related-resources">
                <div
                  v-for="relatedResource in relatedResources"
                  :key="relatedResource.id"
                  class="related-item"
                  @click="goToResource(relatedResource.id)"
                >
                  <div class="related-icon">
                    <i :class="getResourceTypeIcon(relatedResource.resourceType)" :style="{ color: getResourceTypeColor(relatedResource.resourceType) }"></i>
                  </div>
                  <div class="related-content">
                    <div class="related-name">{{ relatedResource.name }}</div>
                    <div class="related-type">{{ relatedResource.resourceType }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 統計信息 -->
          <div class="card info-card">
            <div class="card-header">
              <h5 class="card-title mb-0">統計信息</h5>
            </div>
            <div class="card-body">
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
                    <span :class="stats.connectionStatus === 'online' ? 'badge bg-success' : 'badge bg-danger'">
                      {{ stats.connectionStatus === 'online' ? '在線' : '離線' }}
                    </span>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">重要程度</div>
                  <div class="stat-value">
                    <div class="priority-rating">
                      <span v-for="n in 5" :key="n" class="star">
                        <i :class="n <= resource.priority ? 'bi bi-star-fill text-warning' : 'bi bi-star text-muted'"></i>
                      </span>
                      <span class="ms-2 text-muted">{{ resource.priority }}/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="error-state">
      <div class="text-center py-5">
        <i class="bi bi-exclamation-triangle text-muted" style="font-size: 4rem;"></i>
        <p class="mt-3 text-muted">資源不存在或已被刪除</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { format } from 'date-fns'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { showAlert, showConfirm } from '@/utils/bootstrap-alerts'

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
    Server: 'bi bi-server',
    Database: 'bi bi-database',
    Website: 'bi bi-globe',
    Storage: 'bi bi-hdd',
    Cache: 'bi bi-lightning'
  }
  return iconMap[type] || 'bi bi-server'
}

// 獲取資源類型圖標類別 (for header)
const getResourceTypeIconClass = (type: string) => {
  const iconMap: Record<string, string> = {
    Server: 'bi bi-server',
    Database: 'bi bi-database',
    Website: 'bi bi-globe',
    Storage: 'bi bi-hdd',
    Cache: 'bi bi-lightning'
  }
  return iconMap[type] || 'bi bi-server'
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
const getResourceTypeTagClass = (type: string) => {
  const typeMap: Record<string, string> = {
    Server: 'badge bg-primary',
    Database: 'badge bg-success',
    Website: 'badge bg-warning text-dark',
    Storage: 'badge bg-danger',
    Cache: 'badge bg-info text-dark'
  }
  return typeMap[type] || 'badge bg-info text-dark'
}

// 獲取狀態標籤類型
const getStatusTagClass = (status: string) => {
  const typeMap: Record<string, string> = {
    active: 'badge bg-success',
    inactive: 'badge bg-info text-dark',
    maintenance: 'badge bg-warning text-dark'
  }
  return typeMap[status] || 'badge bg-info text-dark'
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
    create: 'bi bi-plus-circle',
    update: 'bi bi-pencil',
    delete: 'bi bi-trash',
    access: 'bi bi-eye',
    maintenance: 'bi bi-tools'
  }
  return iconMap[type] || 'bi bi-info-circle'
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
    showAlert('已複製到剪貼板', 'success')
  } catch (error) {
    showAlert('複製失敗', 'danger')
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
    
    showAlert('密碼解密成功', 'success')
  } catch (error) {
    showAlert('密碼解密失敗', 'danger')
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
    
    showAlert('連接測試成功', 'success')
  } catch (error) {
    showAlert('連接測試失敗', 'danger')
  } finally {
    testingConnection.value = false
  }
}

// 打開監控
const openMonitoring = () => {
  showAlert('監控功能開發中...', 'info')
}

// 打開維護模式
const openMaintenance = () => {
  showAlert('維護功能開發中...', 'info')
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
    const confirmed = await showConfirm(
      `確定要刪除資源 "${resource.value.name}" 嗎？此操作不可恢復。`,
      '確認刪除'
    )
    
    if (!confirmed) return
    
    // 這裡調用刪除API
    // await resourcesApi.deleteResource(resource.value.id)
    
    showAlert('刪除成功', 'success')
    router.push('/resources')
  } catch (error) {
    showAlert('刪除失敗', 'danger')
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
    showAlert('載入資源失敗', 'danger')
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
      background: var(--bs-body-bg);
      border-radius: 8px;
      border: 1px solid var(--bs-border-color);
      
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
            background: var(--bs-light);
            border-radius: 12px;
          }
          
          .resource-basic {
            .resource-name {
              margin: 0 0 8px 0;
              font-size: 28px;
              font-weight: 600;
              color: var(--bs-body-color);
            }
            
            .resource-meta {
              display: flex;
              align-items: center;
              gap: 12px;
              
              .resource-ip {
                font-family: monospace;
                color: var(--bs-secondary-color);
                background: var(--bs-light);
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
            color: var(--bs-secondary-color);
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
          border-bottom: 1px solid var(--bs-border-color);
          
          &:last-child {
            border-bottom: none;
          }
          
          .activity-icon {
            margin-top: 4px;
            
            i {
              font-size: 16px;
            }
          }
          
          .activity-content {
            flex: 1;
            
            .activity-title {
              font-size: 14px;
              font-weight: 500;
              color: var(--bs-body-color);
              margin-bottom: 4px;
            }
            
            .activity-description {
              font-size: 13px;
              color: var(--bs-secondary-color);
              margin-bottom: 4px;
            }
            
            .activity-meta {
              display: flex;
              align-items: center;
              gap: 12px;
              
              .activity-user {
                font-size: 12px;
                color: var(--bs-secondary-color);
              }
              
              .activity-time {
                font-size: 12px;
                color: var(--bs-secondary-color);
              }
            }
          }
        }
      }
      
      .quick-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
        
        .btn {
          justify-content: flex-start;
        }
      }
      
      .related-resources {
        .related-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--bs-border-color);
          cursor: pointer;
          transition: background-color 0.3s ease;
          
          &:hover {
            background-color: var(--bs-light);
          }
          
          &:last-child {
            border-bottom: none;
          }
          
          .related-icon {
            i {
              font-size: 18px;
            }
          }
          
          .related-content {
            flex: 1;
            
            .related-name {
              font-size: 14px;
              font-weight: 500;
              color: var(--bs-body-color);
              margin-bottom: 2px;
            }
            
            .related-type {
              font-size: 12px;
              color: var(--bs-secondary-color);
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
            color: var(--bs-secondary-color);
            margin-bottom: 4px;
          }
          
          .stat-value {
            font-size: 14px;
            font-weight: 500;
            color: var(--bs-body-color);
            
            .priority-stars {
              display: flex;
              align-items: center;
              
              i {
                font-size: 12px;
                margin-right: 2px;
              }
            }
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
@media (prefers-color-scheme: dark) {
  .resource-detail {
    .detail-content {
      .page-header {
        background: var(--bs-dark);
        border-color: var(--bs-border-color);
      }
      
      .info-card {
        background: var(--bs-dark);
        border-color: var(--bs-gray-700);
      }
    }
  }
}
</style>