<template>
  <div class="user-detail">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>
    
    <div v-else-if="user">
      <!-- 頁面標題 -->
      <div class="page-header">
        <div class="header-content">
          <el-avatar :size="60" :src="user.avatar">
            <el-icon><UserFilled /></el-icon>
          </el-avatar>
          <div class="user-info">
            <h2>{{ user.displayName }}</h2>
            <p>{{ user.loginAccount }}</p>
            <div class="user-tags">
              <el-tag :type="getRoleTagType(user.role)" size="small">
                {{ getRoleLabel(user.role) }}
              </el-tag>
              <el-tag :type="getStatusTagType(user.status)" size="small">
                {{ getStatusLabel(user.status) }}
              </el-tag>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <el-button @click="goBack">返回</el-button>
          <el-button
            v-if="authStore.isAdmin"
            type="primary"
            icon="Edit"
            @click="goToEdit"
          >
            編輯用戶
          </el-button>
        </div>
      </div>

      <el-row :gutter="20">
        <!-- 左側：基本信息 -->
        <el-col :xs="24" :md="16">
          <!-- 基本信息卡片 -->
          <el-card class="info-section" header="基本信息">
            <div class="info-grid">
              <div class="info-item">
                <label>登入帳號：</label>
                <span class="account">{{ user.loginAccount }}</span>
              </div>
              <div class="info-item">
                <label>用戶名稱：</label>
                <span>{{ user.displayName }}</span>
              </div>
              <div class="info-item">
                <label>電子郵件：</label>
                <span>
                  <el-link :href="`mailto:${user.email}`" type="primary">
                    {{ user.email }}
                  </el-link>
                </span>
              </div>
              <div class="info-item">
                <label>部門：</label>
                <span>{{ user.department }}</span>
              </div>
              <div class="info-item">
                <label>手機號碼：</label>
                <span>{{ user.phone || '未設定' }}</span>
              </div>
              <div class="info-item">
                <label>用戶角色：</label>
                <el-tag :type="getRoleTagType(user.role)">
                  {{ getRoleLabel(user.role) }}
                </el-tag>
              </div>
              <div class="info-item">
                <label>帳號狀態：</label>
                <el-tag :type="getStatusTagType(user.status)">
                  {{ getStatusLabel(user.status) }}
                </el-tag>
              </div>
              <div class="info-item">
                <label>創建時間：</label>
                <span>{{ formatDateTime(user.createdAt) }}</span>
              </div>
              <div class="info-item">
                <label>創建者：</label>
                <span>{{ user.createdBy }}</span>
              </div>
              <div class="info-item">
                <label>最後更新：</label>
                <span>{{ formatDateTime(user.updatedAt) }}</span>
              </div>
            </div>
          </el-card>

          <!-- 權限信息 -->
          <el-card class="info-section" header="權限信息">
            <div class="permissions-info">
              <div class="permission-section">
                <h4>資源管理權限</h4>
                <div class="permission-list">
                  <div class="permission-item">
                    <el-icon :color="user.role === 'Admin' ? '#67c23a' : '#e6a23c'">
                      <component :is="user.role === 'Admin' ? 'Check' : 'View'" />
                    </el-icon>
                    <span>{{ user.role === 'Admin' ? '完整管理權限' : '僅查看權限' }}</span>
                  </div>
                </div>
              </div>
              
              <div class="permission-section">
                <h4>用戶群權限</h4>
                <div class="permission-list">
                  <div class="permission-item">
                    <el-icon :color="user.role === 'Admin' ? '#67c23a' : '#f56c6c'">
                      <component :is="user.role === 'Admin' ? 'Check' : 'Close'" />
                    </el-icon>
                    <span>{{ user.role === 'Admin' ? '可以管理其他用戶' : '無權限' }}</span>
                  </div>
                </div>
              </div>
              
              <div class="permission-section">
                <h4>系統設定權限</h4>
                <div class="permission-list">
                  <div class="permission-item">
                    <el-icon :color="user.role === 'Admin' ? '#67c23a' : '#f56c6c'">
                      <component :is="user.role === 'Admin' ? 'Check' : 'Close'" />
                    </el-icon>
                    <span>{{ user.role === 'Admin' ? '可以修改系統設定' : '無權限' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 登入記錄 -->
          <el-card class="info-section" header="最近登入記錄">
            <div v-if="loginHistory.length > 0">
              <div
                v-for="record in loginHistory"
                :key="record.id"
                class="login-record"
              >
                <div class="record-content">
                  <div class="record-info">
                    <div class="record-time">{{ formatDateTime(record.loginAt) }}</div>
                    <div class="record-details">
                      <span class="record-ip">{{ record.ipAddress }}</span>
                      <span class="record-location">{{ record.location }}</span>
                      <span class="record-device">{{ record.userAgent }}</span>
                    </div>
                  </div>
                  <div class="record-status">
                    <el-tag :type="record.success ? 'success' : 'danger'" size="small">
                      {{ record.success ? '成功' : '失敗' }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-records">
              <el-empty description="暫無登入記錄" :image-size="80" />
            </div>
          </el-card>
        </el-col>

        <!-- 右側：統計和快速操作 -->
        <el-col :xs="24" :md="8">
          <!-- 統計信息 -->
          <el-card class="stats-section" header="使用統計">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-icon login">
                  <el-icon><Connection /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ userStats.totalLogins }}</div>
                  <div class="stat-label">總登入次數</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon resources">
                  <el-icon><FolderOpened /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ userStats.resourcesAccessed }}</div>
                  <div class="stat-label">訪問資源數</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon time">
                  <el-icon><Clock /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ userStats.avgSessionTime }}</div>
                  <div class="stat-label">平均會話時長</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon last">
                  <el-icon><Calendar /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ formatTimeAgo(user.lastLoginAt) }}</div>
                  <div class="stat-label">最後登入</div>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 快速操作 -->
          <el-card v-if="authStore.isAdmin" class="actions-section" header="快速操作">
            <div class="action-buttons">
              <el-button
                type="primary"
                icon="Edit"
                @click="goToEdit"
                :disabled="user.id === authStore.userInfo?.id && user.role === 'Admin'"
              >
                編輯用戶
              </el-button>
              
              <el-button
                :type="user.status === 'active' ? 'warning' : 'success'"
                :icon="user.status === 'active' ? 'Lock' : 'Unlock'"
                @click="handleStatusToggle"
                :disabled="user.id === authStore.userInfo?.id"
              >
                {{ user.status === 'active' ? '停用帳號' : '啟用帳號' }}
              </el-button>
              
              <el-button
                type="info"
                icon="Key"
                @click="handleResetPassword"
              >
                重置密碼
              </el-button>
              
              <el-button
                type="danger"
                icon="Delete"
                @click="handleDelete"
                :disabled="user.role === 'Admin' || user.id === authStore.userInfo?.id"
              >
                刪除用戶
              </el-button>
            </div>
          </el-card>

          <!-- 安全信息 -->
          <el-card class="security-section" header="安全信息">
            <div class="security-items">
              <div class="security-item">
                <div class="security-label">密碼最後更新</div>
                <div class="security-value">{{ formatDate(user.passwordUpdatedAt) }}</div>
              </div>
              
              <div class="security-item">
                <div class="security-label">雙重驗證</div>
                <div class="security-value">
                  <el-tag :type="user.twoFactorEnabled ? 'success' : 'info'" size="small">
                    {{ user.twoFactorEnabled ? '已啟用' : '未啟用' }}
                  </el-tag>
                </div>
              </div>
              
              <div class="security-item">
                <div class="security-label">登入失敗次數</div>
                <div class="security-value">
                  <span :class="{ 'warning-text': user.failedLoginAttempts > 5 }">
                    {{ user.failedLoginAttempts }}
                  </span>
                </div>
              </div>
              
              <div class="security-item">
                <div class="security-label">帳號鎖定</div>
                <div class="security-value">
                  <el-tag :type="user.lockedUntil ? 'danger' : 'success'" size="small">
                    {{ user.lockedUntil ? '已鎖定' : '正常' }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <div v-else class="error-state">
      <el-empty description="用戶不存在或已被刪除" />
    </div>

    <!-- 重置密碼對話框 -->
    <el-dialog
      v-model="resetPasswordVisible"
      title="重置密碼"
      width="400px"
    >
      <div class="reset-password-content">
        <el-alert
          title="重置密碼"
          :description="`確定要重置用戶 '${user?.displayName}' 的密碼嗎？`"
          type="warning"
          show-icon
          style="margin-bottom: 20px"
        />
        
        <el-form label-width="100px">
          <el-form-item label="新密碼：">
            <el-input
              v-model="newPassword"
              type="password"
              placeholder="留空則自動生成"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="generatePassword">生成隨機密碼</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <el-button @click="resetPasswordVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="resetPasswordLoading"
          @click="confirmResetPassword"
        >
          確認重置
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  UserFilled,
  Edit,
  Check,
  Close,
  View,
  Connection,
  FolderOpened,
  Clock,
  Calendar,
  Lock,
  Unlock,
  Key,
  Delete
} from '@element-plus/icons-vue'
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

// 獲取角色標籤類型
const getRoleTagType = (role: string) => {
  return role === 'Admin' ? 'danger' : 'primary'
}

// 獲取角色標籤
const getRoleLabel = (role: string) => {
  return role === 'Admin' ? '管理員' : '用戶'
}

// 獲取狀態標籤類型
const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    locked: 'warning'
  }
  return typeMap[status] || 'info'
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
    await ElMessageBox.confirm(
      `確定要${action}用戶 "${user.value.displayName}" 嗎？`,
      `確認${action}`,
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 這裡調用API更新狀態
    // await usersApi.updateUserStatus(user.value.id, newStatus)
    
    user.value.status = newStatus
    ElMessage.success(`${action}成功`)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失敗`)
    }
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
    
    ElMessage.success('密碼重置成功')
    resetPasswordVisible.value = false
    
    if (!newPassword.value) {
      ElMessage.info('新密碼已發送到用戶郵箱')
    }
  } catch (error) {
    ElMessage.error('密碼重置失敗')
  } finally {
    resetPasswordLoading.value = false
  }
}

// 處理刪除用戶
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `確定要刪除用戶 "${user.value.displayName}" 嗎？此操作不可恢復。`,
      '確認刪除',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 這裡調用API刪除用戶
    // await usersApi.deleteUser(user.value.id)
    
    ElMessage.success('刪除成功')
    router.push('/users')
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
    ElMessage.error('載入用戶失敗')
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
    padding: 20px;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    padding: 24px;
    background: var(--el-bg-color);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    .header-content {
      display: flex;
      align-items: center;
      gap: 20px;
      
      .user-info {
        h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
        
        p {
          margin: 0 0 12px 0;
          color: var(--el-text-color-regular);
          font-family: monospace;
          font-size: 14px;
        }
        
        .user-tags {
          display: flex;
          gap: 8px;
        }
      }
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
  
  .info-section,
  .stats-section,
  .actions-section,
  .security-section {
    margin-bottom: 20px;
    
    :deep(.el-card__header) {
      background: var(--el-bg-color-page);
      font-weight: 600;
    }
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      
      label {
        min-width: 80px;
        font-weight: 500;
        color: var(--el-text-color-regular);
      }
      
      .account {
        font-family: monospace;
        background: var(--el-bg-color-page);
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 13px;
      }
    }
  }
  
  .permissions-info {
    .permission-section {
      margin-bottom: 20px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        color: var(--el-text-color-primary);
      }
      
      .permission-list {
        .permission-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--el-text-color-regular);
        }
      }
    }
  }
  
  .login-record {
    border-bottom: 1px solid var(--el-border-color-light);
    padding: 16px 0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .record-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .record-info {
        flex: 1;
        
        .record-time {
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .record-details {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: var(--el-text-color-placeholder);
          
          .record-ip {
            font-family: monospace;
          }
        }
      }
    }
  }
  
  .empty-records {
    text-align: center;
    padding: 40px;
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
      background: var(--el-bg-color-page);
      border-radius: 8px;
      
      .stat-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .el-icon {
          font-size: 20px;
          color: white;
        }
        
        &.login {
          background: linear-gradient(135deg, #409eff, #66b3ff);
        }
        
        &.resources {
          background: linear-gradient(135deg, #67c23a, #85d85a);
        }
        
        &.time {
          background: linear-gradient(135deg, #e6a23c, #f2b85c);
        }
        
        &.last {
          background: linear-gradient(135deg, #722ed1, #9254de);
        }
      }
      
      .stat-content {
        flex: 1;
        
        .stat-number {
          font-size: 18px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: 2px;
        }
        
        .stat-label {
          font-size: 12px;
          color: var(--el-text-color-regular);
        }
      }
    }
  }
  
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    .el-button {
      justify-content: flex-start;
    }
  }
  
  .security-items {
    .security-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);
      
      &:last-child {
        border-bottom: none;
      }
      
      .security-label {
        font-size: 14px;
        color: var(--el-text-color-regular);
      }
      
      .security-value {
        .warning-text {
          color: var(--el-color-warning);
          font-weight: 500;
        }
      }
    }
  }
  
  .error-state {
    padding: 40px;
    text-align: center;
  }
}

// 對話框樣式
.reset-password-content {
  .el-form-item {
    margin-bottom: 16px;
  }
}

// 響應式設計
@media (max-width: 768px) {
  .user-detail {
    .page-header {
      flex-direction: column;
      gap: 16px;
      
      .header-content {
        flex-direction: column;
        text-align: center;
        
        .user-info {
          h2 {
            font-size: 20px;
          }
        }
      }
      
      .header-actions {
        width: 100%;
        justify-content: center;
      }
    }
    
    .info-grid {
      grid-template-columns: 1fr;
      
      .info-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
    
    .stats-grid {
      grid-template-columns: 1fr;
    }
    
    .login-record {
      .record-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        
        .record-details {
          flex-direction: column;
          gap: 4px;
        }
      }
    }
  }
}

// 暗黑模式
.dark {
  .user-detail {
    .page-header {
      background: var(--el-bg-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    
    .info-section,
    .stats-section,
    .actions-section,
    .security-section {
      :deep(.el-card__header) {
        background: var(--el-bg-color-page);
      }
    }
    
    .stats-grid {
      .stat-item {
        background: var(--el-bg-color-page);
      }
    }
  }
}
</style>