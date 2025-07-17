<template>
  <div class="user-detail">
    <div v-if="loading" class="loading-container">
      <div class="d-flex justify-content-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">加載中...</span>
        </div>
      </div>
    </div>
    
    <div v-else-if="user">
      <!-- 頁面標題 -->
      <div class="page-header card">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-md-8">
              <div class="d-flex align-items-center">
                <div class="avatar-container me-3">
                  <img
                    v-if="user.avatar"
                    :src="user.avatar"
                    class="user-avatar"
                    alt="用戶頭像"
                  />
                  <div v-else class="user-avatar-placeholder">
                    <i class="bi bi-person-fill"></i>
                  </div>
                </div>
                <div class="user-info">
                  <h2 class="mb-2">{{ user.displayName }}</h2>
                  <p class="text-muted mb-2">{{ user.loginAccount }}</p>
                  <div class="user-tags">
                    <span :class="getRoleTagClass(user.role)">
                      {{ getRoleLabel(user.role) }}
                    </span>
                    <span :class="getStatusTagClass(user.status)">
                      {{ getStatusLabel(user.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4 text-end">
              <div class="header-actions">
                <button type="button" class="btn btn-secondary me-2" @click="goBack">
                  返回
                </button>
                <button
                  v-if="authStore.isAdmin"
                  type="button"
                  class="btn btn-primary"
                  @click="goToEdit"
                >
                  <i class="bi bi-pencil me-1"></i>
                  編輯用戶
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <!-- 左側：基本信息 -->
        <div class="col-lg-8">
          <!-- 基本信息卡片 -->
          <div class="card info-section">
            <div class="card-header">
              <h5 class="card-title mb-0">基本信息</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <div class="info-item">
                    <label class="form-label">登入帳號：</label>
                    <span class="account">{{ user.loginAccount }}</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item">
                    <label class="form-label">用戶名稱：</label>
                    <span>{{ user.displayName }}</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item">
                    <label class="form-label">電子郵件：</label>
                    <span>
                      <a :href="`mailto:${user.email}`" class="text-primary">
                        {{ user.email }}
                      </a>
                    </span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item">
                    <label class="form-label">部門：</label>
                    <span>{{ user.department }}</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item">
                    <label class="form-label">手機號碼：</label>
                    <span>{{ user.phone || '未設定' }}</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item">
                    <label class="form-label">用戶角色：</label>
                    <span :class="getRoleTagClass(user.role)">
                      {{ getRoleLabel(user.role) }}
                    </span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item">
                    <label class="form-label">帳號狀態：</label>
                    <span :class="getStatusTagClass(user.status)">
                      {{ getStatusLabel(user.status) }}
                    </span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item">
                    <label class="form-label">創建時間：</label>
                    <span>{{ formatDateTime(user.createdAt) }}</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item">
                    <label class="form-label">創建者：</label>
                    <span>{{ user.createdBy }}</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item">
                    <label class="form-label">最後更新：</label>
                    <span>{{ formatDateTime(user.updatedAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 權限信息 -->
          <div class="card info-section">
            <div class="card-header">
              <h5 class="card-title mb-0">權限信息</h5>
            </div>
            <div class="card-body">
              <div class="permissions-info">
                <div class="permission-section">
                  <h6 class="mb-3">資源管理權限</h6>
                  <div class="permission-list">
                    <div class="permission-item">
                      <i :class="user.role === 'Admin' ? 'bi bi-check-circle text-success' : 'bi bi-eye text-warning'" class="me-2"></i>
                      <span>{{ user.role === 'Admin' ? '完整管理權限' : '僅查看權限' }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="permission-section">
                  <h6 class="mb-3">用戶群權限</h6>
                  <div class="permission-list">
                    <div class="permission-item">
                      <i :class="user.role === 'Admin' ? 'bi bi-check-circle text-success' : 'bi bi-x-circle text-danger'" class="me-2"></i>
                      <span>{{ user.role === 'Admin' ? '可以管理其他用戶' : '無權限' }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="permission-section">
                  <h6 class="mb-3">系統設定權限</h6>
                  <div class="permission-list">
                    <div class="permission-item">
                      <i :class="user.role === 'Admin' ? 'bi bi-check-circle text-success' : 'bi bi-x-circle text-danger'" class="me-2"></i>
                      <span>{{ user.role === 'Admin' ? '可以修改系統設定' : '無權限' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 登入記錄 -->
          <div class="card info-section">
            <div class="card-header">
              <h5 class="card-title mb-0">最近登入記錄</h5>
            </div>
            <div class="card-body">
              <div v-if="loginHistory.length > 0">
                <div
                  v-for="record in loginHistory"
                  :key="record.id"
                  class="login-record"
                >
                  <div class="row align-items-center">
                    <div class="col-md-10">
                      <div class="record-info">
                        <div class="record-time fw-bold">{{ formatDateTime(record.loginAt) }}</div>
                        <div class="record-details text-muted small">
                          <span class="record-ip me-3">{{ record.ipAddress }}</span>
                          <span class="record-location me-3">{{ record.location }}</span>
                          <span class="record-device">{{ record.userAgent }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-2 text-end">
                      <span :class="record.success ? 'badge bg-success' : 'badge bg-danger'">
                        {{ record.success ? '成功' : '失敗' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-records text-center py-5">
                <i class="bi bi-exclamation-circle text-muted" style="font-size: 3rem;"></i>
                <p class="text-muted mt-3">暫無登入記錄</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 右側：統計和快速操作 -->
        <div class="col-lg-4">
          <!-- 統計信息 -->
          <div class="card stats-section">
            <div class="card-header">
              <h5 class="card-title mb-0">使用統計</h5>
            </div>
            <div class="card-body">
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-icon login">
                    <i class="bi bi-link-45deg"></i>
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">{{ userStats.totalLogins }}</div>
                    <div class="stat-label">總登入次數</div>
                  </div>
                </div>
                
                <div class="stat-item">
                  <div class="stat-icon resources">
                    <i class="bi bi-folder-check"></i>
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">{{ userStats.resourcesAccessed }}</div>
                    <div class="stat-label">訪問資源數</div>
                  </div>
                </div>
                
                <div class="stat-item">
                  <div class="stat-icon time">
                    <i class="bi bi-clock"></i>
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">{{ userStats.avgSessionTime }}</div>
                    <div class="stat-label">平均會話時長</div>
                  </div>
                </div>
                
                <div class="stat-item">
                  <div class="stat-icon last">
                    <i class="bi bi-calendar-event"></i>
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">{{ formatTimeAgo(user.lastLoginAt) }}</div>
                    <div class="stat-label">最後登入</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 快速操作 -->
          <div v-if="authStore.isAdmin" class="card actions-section">
            <div class="card-header">
              <h5 class="card-title mb-0">快速操作</h5>
            </div>
            <div class="card-body">
              <div class="action-buttons">
                <button
                  type="button"
                  class="btn btn-primary w-100 mb-2"
                  @click="goToEdit"
                  :disabled="user.id === authStore.userInfo?.id && user.role === 'Admin'"
                >
                  <i class="bi bi-pencil me-1"></i>
                  編輯用戶
                </button>
                
                <button
                  type="button"
                  :class="user.status === 'active' ? 'btn btn-warning w-100 mb-2' : 'btn btn-success w-100 mb-2'"
                  @click="handleStatusToggle"
                  :disabled="user.id === authStore.userInfo?.id"
                >
                  <i :class="user.status === 'active' ? 'bi bi-lock me-1' : 'bi bi-unlock me-1'"></i>
                  {{ user.status === 'active' ? '停用帳號' : '啟用帳號' }}
                </button>
                
                <button
                  type="button"
                  class="btn btn-info w-100 mb-2"
                  @click="handleResetPassword"
                >
                  <i class="bi bi-key me-1"></i>
                  重置密碼
                </button>
                
                <button
                  type="button"
                  class="btn btn-danger w-100"
                  @click="handleDelete"
                  :disabled="user.role === 'Admin' || user.id === authStore.userInfo?.id"
                >
                  <i class="bi bi-trash me-1"></i>
                  刪除用戶
                </button>
              </div>
            </div>
          </div>

          <!-- 安全信息 -->
          <div class="card security-section">
            <div class="card-header">
              <h5 class="card-title mb-0">安全信息</h5>
            </div>
            <div class="card-body">
              <div class="security-items">
                <div class="security-item">
                  <div class="security-label">密碼最後更新</div>
                  <div class="security-value">{{ formatDate(user.passwordUpdatedAt) }}</div>
                </div>
                
                <div class="security-item">
                  <div class="security-label">雙重驗證</div>
                  <div class="security-value">
                    <span :class="user.twoFactorEnabled ? 'badge bg-success' : 'badge bg-secondary'">
                      {{ user.twoFactorEnabled ? '已啟用' : '未啟用' }}
                    </span>
                  </div>
                </div>
                
                <div class="security-item">
                  <div class="security-label">登入失敗次數</div>
                  <div class="security-value">
                    <span :class="{ 'text-warning fw-bold': user.failedLoginAttempts > 5 }">
                      {{ user.failedLoginAttempts }}
                    </span>
                  </div>
                </div>
                
                <div class="security-item">
                  <div class="security-label">帳號鎖定</div>
                  <div class="security-value">
                    <span :class="user.lockedUntil ? 'badge bg-danger' : 'badge bg-success'">
                      {{ user.lockedUntil ? '已鎖定' : '正常' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="error-state text-center py-5">
      <i class="bi bi-exclamation-triangle text-muted" style="font-size: 4rem;"></i>
      <h4 class="text-muted mt-3">用戶不存在或已被刪除</h4>
    </div>

    <!-- 重置密碼對話框 -->
    <div class="modal fade" id="resetPasswordModal" tabindex="-1" :class="{ show: resetPasswordVisible }" :style="{ display: resetPasswordVisible ? 'block' : 'none' }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">重置密碼</h5>
            <button type="button" class="btn-close" @click="resetPasswordVisible = false"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-warning d-flex align-items-center mb-3">
              <i class="bi bi-exclamation-triangle me-2"></i>
              <div>
                <strong>重置密碼</strong><br>
                確定要重置用戶 '{{ user?.displayName }}' 的密碼嗎？
              </div>
            </div>
            
            <div class="mb-3">
              <label class="form-label">新密碼：</label>
              <div class="input-group">
                <input
                  v-model="newPassword"
                  type="password"
                  class="form-control"
                  placeholder="留空則自動生成"
                />
                <button class="btn btn-outline-secondary" type="button" @click="generatePassword">
                  <i class="bi bi-arrow-clockwise"></i>
                </button>
              </div>
            </div>
            
            <button type="button" class="btn btn-secondary" @click="generatePassword">
              <i class="bi bi-key me-1"></i>
              生成隨機密碼
            </button>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="resetPasswordVisible = false">
              取消
            </button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="resetPasswordLoading"
              @click="confirmResetPassword"
            >
              <span v-if="resetPasswordLoading" class="spinner-border spinner-border-sm me-2"></span>
              確認重置
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="resetPasswordVisible" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showAlert, showConfirm } from '@/utils/bootstrap-alerts'
import { useAuthStore } from '@/stores/auth'
import { format, formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'

// 狀態管理
const authStore = useAuthStore()

// 路由
const route = useRoute()
const router = useRouter()

// 響應式數據
const loading = ref(true)
const user = ref<any>(null)
const userStats = ref({
  totalLogins: 0,
  resourcesAccessed: 0,
  avgSessionTime: '0',
  lastLogin: null
})
const loginHistory = ref<any[]>([])
const resetPasswordVisible = ref(false)
const newPassword = ref('')
const resetPasswordLoading = ref(false)

// 獲取角色標籤類別
const getRoleTagClass = (role: string) => {
  return role === 'Admin' ? 'badge bg-danger' : 'badge bg-primary'
}

// 獲取角色標籤
const getRoleLabel = (role: string) => {
  return role === 'Admin' ? '管理員' : '用戶'
}

// 獲取狀態標籤類別
const getStatusTagClass = (status: string) => {
  const typeMap: Record<string, string> = {
    active: 'badge bg-success',
    inactive: 'badge bg-secondary',
    locked: 'badge bg-warning'
  }
  return typeMap[status] || 'badge bg-secondary'
}

// 獲取狀態標籤
const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    active: '啟用',
    inactive: '停用',
    locked: '鎖定'
  }
  return labelMap[status] || '未知'
}

// 格式化日期時間
const formatDateTime = (date: Date) => {
  return format(date, 'yyyy-MM-dd HH:mm:ss')
}

// 格式化日期
const formatDate = (date: Date) => {
  return format(date, 'yyyy-MM-dd')
}

// 格式化時間差
const formatTimeAgo = (date: Date | null) => {
  if (!date) return '從未登入'
  return formatDistanceToNow(date, { 
    addSuffix: true, 
    locale: zhTW 
  })
}

// 返回上一頁
const goBack = () => {
  router.go(-1)
}

// 前往編輯頁面
const goToEdit = () => {
  router.push(`/users/${user.value.id}/edit`)
}

// 處理狀態切換
const handleStatusToggle = async () => {
  const newStatus = user.value.status === 'active' ? 'inactive' : 'active'
  const action = newStatus === 'active' ? '啟用' : '停用'
  
  try {
    const confirmed = await showConfirm(
      `確定要${action}用戶 "${user.value.displayName}" 嗎？`,
      `確認${action}`,
      'warning'
    )
    
    if (confirmed) {
      // 這裡調用API更新狀態
      // await usersApi.updateUserStatus(user.value.id, newStatus)
      
      user.value.status = newStatus
      showAlert(`${action}成功`, 'success')
    }
  } catch (error) {
    showAlert(`${action}失敗`, 'error')
  }
}

// 處理重置密碼
const handleResetPassword = () => {
  newPassword.value = ''
  resetPasswordVisible.value = true
}

// 生成隨機密碼
const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  newPassword.value = password
}

// 確認重置密碼
const confirmResetPassword = async () => {
  try {
    resetPasswordLoading.value = true
    
    // 這裡調用API重置密碼
    // await usersApi.resetPassword(user.value.id, newPassword.value)
    
    // 模擬API請求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    showAlert('密碼重置成功', 'success')
    resetPasswordVisible.value = false
    
    if (!newPassword.value) {
      showAlert('新密碼已發送到用戶郵箱', 'info')
    }
  } catch (error) {
    showAlert('密碼重置失敗', 'error')
  } finally {
    resetPasswordLoading.value = false
  }
}

// 處理刪除用戶
const handleDelete = async () => {
  try {
    const confirmed = await showConfirm(
      `確定要刪除用戶 "${user.value.displayName}" 嗎？此操作不可恢復。`,
      '確認刪除',
      'danger'
    )
    
    if (confirmed) {
      // 這裡調用API刪除用戶
      // await usersApi.deleteUser(user.value.id)
      
      showAlert('刪除成功', 'success')
      router.push('/users')
    }
  } catch (error) {
    showAlert('刪除失敗', 'error')
  }
}

// 載入數據
const loadData = async () => {
  try {
    loading.value = true
    
    const id = route.params.id
    
    // 這裡調用API獲取用戶詳情
    // const [userData, statsData, historyData] = await Promise.all([
    //   usersApi.getUserById(id),
    //   usersApi.getUserStats(id),
    //   usersApi.getUserLoginHistory(id)
    // ])
    
    // 模擬數據
    await new Promise(resolve => setTimeout(resolve, 500))
    
    user.value = {
      id: 1,
      loginAccount: 'admin',
      displayName: '系統管理員',
      email: 'admin@example.com',
      department: 'IT部門',
      phone: '+886 912345678',
      role: 'Admin',
      status: 'active',
      avatar: '',
      createdAt: new Date('2024-01-01T00:00:00'),
      updatedAt: new Date('2024-01-15T08:30:00'),
      createdBy: 'system',
      lastLoginAt: new Date('2024-01-15T10:30:00'),
      passwordUpdatedAt: new Date('2024-01-10T12:00:00'),
      twoFactorEnabled: false,
      failedLoginAttempts: 0,
      lockedUntil: null
    }
    
    userStats.value = {
      totalLogins: 156,
      resourcesAccessed: 42,
      avgSessionTime: '2.5h',
      lastLogin: user.value.lastLoginAt
    }
    
    loginHistory.value = [
      {
        id: 1,
        loginAt: new Date('2024-01-15T10:30:00'),
        ipAddress: '192.168.1.100',
        location: '台北, 台灣',
        userAgent: 'Chrome 120.0 on Windows 10',
        success: true
      },
      {
        id: 2,
        loginAt: new Date('2024-01-14T15:45:00'),
        ipAddress: '192.168.1.100',
        location: '台北, 台灣',
        userAgent: 'Chrome 120.0 on Windows 10',
        success: true
      },
      {
        id: 3,
        loginAt: new Date('2024-01-13T09:20:00'),
        ipAddress: '192.168.1.100',
        location: '台北, 台灣',
        userAgent: 'Chrome 120.0 on Windows 10',
        success: true
      }
    ]
    
  } catch (error) {
    console.error('Failed to load user:', error)
    showAlert('載入用戶失敗', 'error')
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
.user-detail {
  .loading-container {
    padding: 40px;
  }
  
  .page-header {
    margin-bottom: 24px;
    
    .avatar-container {
      .user-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        object-fit: cover;
      }
      
      .user-avatar-placeholder {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: var(--bs-gray-200);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: var(--bs-gray-600);
      }
    }
    
    .user-info {
      h2 {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      
      p {
        font-family: monospace;
        font-size: 14px;
        margin-bottom: 12px;
      }
      
      .user-tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
    }
  }
  
  .info-section,
  .stats-section,
  .actions-section,
  .security-section {
    margin-bottom: 20px;
  }
  
  .info-item {
    margin-bottom: 16px;
    
    .form-label {
      min-width: 120px;
      margin-bottom: 4px;
      font-weight: 500;
    }
    
    .account {
      font-family: monospace;
      background: var(--bs-gray-100);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 13px;
    }
  }
  
  .permissions-info {
    .permission-section {
      margin-bottom: 24px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      h6 {
        font-weight: 600;
        color: var(--bs-gray-700);
      }
      
      .permission-list {
        .permission-item {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: var(--bs-gray-600);
        }
      }
    }
  }
  
  .login-record {
    border-bottom: 1px solid var(--bs-gray-200);
    padding: 16px 0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .record-info {
      .record-time {
        font-weight: 500;
        margin-bottom: 4px;
      }
      
      .record-details {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        font-size: 12px;
        
        .record-ip {
          font-family: monospace;
        }
      }
    }
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: var(--bs-gray-50);
      border-radius: 8px;
      
      .stat-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
        
        &.login {
          background: linear-gradient(135deg, #0d6efd, #6c9bd1);
        }
        
        &.resources {
          background: linear-gradient(135deg, #198754, #25a06b);
        }
        
        &.time {
          background: linear-gradient(135deg, #fd7e14, #ff9a44);
        }
        
        &.last {
          background: linear-gradient(135deg, #6610f2, #8540f5);
        }
      }
      
      .stat-content {
        flex: 1;
        
        .stat-number {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 2px;
        }
        
        .stat-label {
          font-size: 12px;
          color: var(--bs-gray-600);
        }
      }
    }
  }
  
  .security-items {
    .security-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--bs-gray-100);
      
      &:last-child {
        border-bottom: none;
      }
      
      .security-label {
        font-size: 14px;
        color: var(--bs-gray-600);
      }
    }
  }
}

// 響應式設計
@media (max-width: 768px) {
  .user-detail {
    .page-header {
      .header-actions {
        margin-top: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        
        .btn {
          width: 100%;
        }
      }
    }
    
    .stats-grid {
      grid-template-columns: 1fr;
    }
    
    .login-record {
      .record-details {
        flex-direction: column;
        gap: 4px;
      }
    }
  }
}
</style>