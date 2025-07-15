<template>
  <div class="users-list">
    <!-- 頂部操作欄 -->
    <div class="header-actions">
      <div class="actions-left">
        <el-button
          v-if="authStore.isAdmin"
          type="primary"
          icon="Plus"
          @click="goToCreate"
        >
          新增用戶
        </el-button>
        <el-button
          v-if="authStore.isAdmin && selectedRows.length > 0"
          type="warning"
          icon="Lock"
          @click="handleBatchStatus('inactive')"
        >
          批量停用 ({{ selectedRows.length }})
        </el-button>
        <el-button
          v-if="authStore.isAdmin && selectedRows.length > 0"
          type="success"
          icon="Unlock"
          @click="handleBatchStatus('active')"
        >
          批量啟用 ({{ selectedRows.length }})
        </el-button>
        <el-button
          icon="Refresh"
          @click="refreshData"
          :loading="loading"
        >
          刷新
        </el-button>
      </div>
      
      <div class="actions-right">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用戶名稱、帳號、部門..."
          style="width: 300px;"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearchClear"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #suffix>
            <el-tooltip content="高級搜索" placement="top">
              <el-button
                link
                type="primary"
                @click="goToAdvancedSearch"
              >
                <el-icon><Setting /></el-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-input>
        <el-button
          type="primary"
          icon="Search"
          @click="handleSearch"
        >
          搜索
        </el-button>
      </div>
    </div>

    <!-- 篩選條件 -->
    <div class="filter-bar">
      <div class="filter-item">
        <label>角色：</label>
        <el-select
          v-model="filters.role"
          placeholder="全部角色"
          clearable
          style="width: 120px;"
          @change="handleFilter"
        >
          <el-option label="管理員" value="Admin" />
          <el-option label="用戶" value="User" />
        </el-select>
      </div>
      
      <div class="filter-item">
        <label>狀態：</label>
        <el-select
          v-model="filters.status"
          placeholder="全部狀態"
          clearable
          style="width: 120px;"
          @change="handleFilter"
        >
          <el-option label="啟用" value="active" />
          <el-option label="停用" value="inactive" />
          <el-option label="鎖定" value="locked" />
        </el-select>
      </div>
      
      <div class="filter-item">
        <label>最後登入：</label>
        <el-select
          v-model="filters.lastLogin"
          placeholder="全部時間"
          clearable
          style="width: 150px;"
          @change="handleFilter"
        >
          <el-option label="最近7天" value="7days" />
          <el-option label="最近30天" value="30days" />
          <el-option label="超過30天" value="over30days" />
          <el-option label="從未登入" value="never" />
        </el-select>
      </div>
      
      <el-button
        type="default"
        icon="RefreshRight"
        @click="resetFilters"
      >
        重置篩選
      </el-button>
    </div>

    <!-- 統計卡片 -->
    <div class="stats-cards">
      <el-row :gutter="16">
        <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="6">
          <div class="stat-card">
            <div class="stat-icon total">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ userStats.total }}</div>
              <div class="stat-label">總用戶數</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="6">
          <div class="stat-card">
            <div class="stat-icon admins">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ userStats.admins }}</div>
              <div class="stat-label">管理員</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="6">
          <div class="stat-card">
            <div class="stat-icon active">
              <el-icon><CircleCheckFilled /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ userStats.active }}</div>
              <div class="stat-label">啟用用戶</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="6">
          <div class="stat-card">
            <div class="stat-icon online">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ userStats.online }}</div>
              <div class="stat-label">在線用戶</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 用戶表格 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column
          v-if="authStore.isAdmin"
          type="selection"
          width="55"
        />
        
        <el-table-column
          prop="avatar"
          label="頭像"
          width="80"
        >
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar">
              <el-icon><UserFilled /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="displayName"
          label="用戶名稱"
          sortable="custom"
          min-width="150"
        >
          <template #default="{ row }">
            <div class="user-info">
              <div class="user-name">{{ row.displayName }}</div>
              <div class="user-account">{{ row.loginAccount }}</div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="role"
          label="角色"
          width="100"
        >
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="status"
          label="狀態"
          width="100"
        >
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="email"
          label="電子郵件"
          min-width="200"
          show-overflow-tooltip
        />
        
        <el-table-column
          prop="department"
          label="部門"
          width="120"
          show-overflow-tooltip
        />
        
        <el-table-column
          prop="lastLoginAt"
          label="最後登入"
          width="160"
          sortable="custom"
        >
          <template #default="{ row }">
            <div v-if="row.lastLoginAt">
              <div class="login-time">{{ formatDateTime(row.lastLoginAt) }}</div>
              <div class="login-ago">{{ formatTimeAgo(row.lastLoginAt) }}</div>
            </div>
            <span v-else class="never-login">從未登入</span>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="createdAt"
          label="創建時間"
          width="120"
          sortable="custom"
        >
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column
          label="操作"
          width="200"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              size="small"
              @click="goToDetail(row.id)"
            >
              查看
            </el-button>
            <el-button
              v-if="authStore.isAdmin"
              size="small"
              type="primary"
              @click="goToEdit(row.id)"
            >
              編輯
            </el-button>
            <el-dropdown
              v-if="authStore.isAdmin"
              @command="(command) => handleUserAction(command, row)"
            >
              <el-button size="small" type="info">
                更多
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    :command="`${row.status === 'active' ? 'disable' : 'enable'}_${row.id}`"
                  >
                    <el-icon>
                      <component :is="row.status === 'active' ? 'Lock' : 'Unlock'" />
                    </el-icon>
                    {{ row.status === 'active' ? '停用用戶' : '啟用用戶' }}
                  </el-dropdown-item>
                  <el-dropdown-item :command="`reset_password_${row.id}`">
                    <el-icon><Key /></el-icon>
                    重置密碼
                  </el-dropdown-item>
                  <el-dropdown-item :command="`view_logs_${row.id}`">
                    <el-icon><Document /></el-icon>
                    查看日誌
                  </el-dropdown-item>
                  <el-dropdown-item
                    :command="`delete_${row.id}`"
                    :disabled="row.role === 'Admin' || row.id === authStore.userInfo?.id"
                  >
                    <el-icon><Delete /></el-icon>
                    刪除用戶
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分頁 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
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
          :description="`確定要重置用戶 '${selectedUser?.displayName}' 的密碼嗎？`"
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Lock,
  Unlock,
  Refresh,
  Search,
  RefreshRight,
  User,
  UserFilled,
  CircleCheckFilled,
  Connection,
  ArrowDown,
  Key,
  Document,
  Delete
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { format, formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'

// 狀態管理
const authStore = useAuthStore()

// 路由
const router = useRouter()

// 響應式數據
const loading = ref(false)
const searchQuery = ref('')
const selectedRows = ref<any[]>([])
const tableData = ref<any[]>([])
const resetPasswordVisible = ref(false)
const selectedUser = ref<any>(null)
const newPassword = ref('')
const resetPasswordLoading = ref(false)

// 篩選條件
const filters = ref({
  role: '',
  status: '',
  lastLogin: ''
})

// 分頁
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 排序
const sortConfig = ref({
  prop: 'createdAt',
  order: 'descending'
})

// 統計數據
const userStats = ref({
  total: 24,
  admins: 3,
  active: 21,
  online: 8
})

// 模擬數據
const mockData = ref([
  {
    id: 1,
    loginAccount: 'admin',
    displayName: '系統管理員',
    role: 'Admin',
    status: 'active',
    email: 'admin@example.com',
    department: 'IT部門',
    avatar: '',
    lastLoginAt: new Date('2024-01-15T10:30:00'),
    createdAt: new Date('2024-01-01T00:00:00')
  },
  {
    id: 2,
    loginAccount: 'user1',
    displayName: '張三',
    role: 'User',
    status: 'active',
    email: 'zhang.san@example.com',
    department: '開發部',
    avatar: '',
    lastLoginAt: new Date('2024-01-14T15:45:00'),
    createdAt: new Date('2024-01-02T08:00:00')
  },
  {
    id: 3,
    loginAccount: 'user2',
    displayName: '李四',
    role: 'User',
    status: 'active',
    email: 'li.si@example.com',
    department: '測試部',
    avatar: '',
    lastLoginAt: new Date('2024-01-13T09:20:00'),
    createdAt: new Date('2024-01-03T10:00:00')
  },
  {
    id: 4,
    loginAccount: 'user3',
    displayName: '王五',
    role: 'User',
    status: 'inactive',
    email: 'wang.wu@example.com',
    department: '運維部',
    avatar: '',
    lastLoginAt: null,
    createdAt: new Date('2024-01-04T12:00:00')
  },
  {
    id: 5,
    loginAccount: 'manager1',
    displayName: '趙六',
    role: 'Admin',
    status: 'active',
    email: 'zhao.liu@example.com',
    department: '管理部',
    avatar: '',
    lastLoginAt: new Date('2024-01-15T08:15:00'),
    createdAt: new Date('2024-01-05T14:00:00')
  }
])

// 計算屬性
const filteredData = computed(() => {
  let data = [...mockData.value]
  
  // 搜索篩選
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    data = data.filter(item => 
      item.displayName.toLowerCase().includes(query) ||
      item.loginAccount.toLowerCase().includes(query) ||
      item.email?.toLowerCase().includes(query)
    )
  }
  
  // 角色篩選
  if (filters.value.role) {
    data = data.filter(item => item.role === filters.value.role)
  }
  
  // 狀態篩選
  if (filters.value.status) {
    data = data.filter(item => item.status === filters.value.status)
  }
  
  // 最後登入篩選
  if (filters.value.lastLogin) {
    const now = new Date()
    data = data.filter(item => {
      if (filters.value.lastLogin === 'never') {
        return !item.lastLoginAt
      }
      
      if (!item.lastLoginAt) return false
      
      const daysDiff = Math.floor((now.getTime() - item.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24))
      
      switch (filters.value.lastLogin) {
        case '7days':
          return daysDiff <= 7
        case '30days':
          return daysDiff <= 30
        case 'over30days':
          return daysDiff > 30
        default:
          return true
      }
    })
  }
  
  return data
})

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
  return format(date, 'MM-dd HH:mm')
}

// 格式化日期
const formatDate = (date: Date) => {
  return format(date, 'yyyy-MM-dd')
}

// 格式化時間差
const formatTimeAgo = (date: Date) => {
  return formatDistanceToNow(date, { 
    addSuffix: true, 
    locale: zhTW 
  })
}

// 載入數據
const loadData = async () => {
  try {
    loading.value = true
    
    // 模擬API請求
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 應用篩選和排序
    let data = filteredData.value
    
    // 排序
    if (sortConfig.value.prop) {
      data.sort((a, b) => {
        const aValue = a[sortConfig.value.prop]
        const bValue = b[sortConfig.value.prop]
        
        if (sortConfig.value.order === 'ascending') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    }
    
    // 分頁
    const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    
    tableData.value = data.slice(start, end)
    pagination.value.total = data.length
    
  } catch (error) {
    console.error('Failed to load users:', error)
    ElMessage.error('載入用戶失敗')
  } finally {
    loading.value = false
  }
}

// 處理搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
  loadData()
}

// 處理篩選
const handleFilter = () => {
  pagination.value.currentPage = 1
  loadData()
}

// 重置篩選
const resetFilters = () => {
  filters.value = {
    role: '',
    status: '',
    lastLogin: ''
  }
  searchQuery.value = ''
  pagination.value.currentPage = 1
  loadData()
}

// 處理選擇變化
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

// 處理排序變化
const handleSortChange = ({ prop, order }: any) => {
  sortConfig.value = { prop, order }
  loadData()
}

// 處理分頁大小變化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  loadData()
}

// 處理當前頁變化
const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page
  loadData()
}

// 刷新數據
const refreshData = () => {
  loadData()
}

// 導航到創建頁面
const goToCreate = () => {
  router.push('/users/create')
}

// 導航到詳情頁面
const goToDetail = (id: number) => {
  router.push(`/users/${id}`)
}

// 導航到編輯頁面
const goToEdit = (id: number) => {
  router.push(`/users/${id}/edit`)
}

// 處理批量狀態變更
const handleBatchStatus = async (status: string) => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('請選擇要操作的用戶')
    return
  }
  
  const action = status === 'active' ? '啟用' : '停用'
  
  try {
    await ElMessageBox.confirm(
      `確定要${action}選中的 ${selectedRows.value.length} 個用戶嗎？`,
      `確認批量${action}`,
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 這裡調用批量狀態變更API
    // const ids = selectedRows.value.map(row => row.id)
    // await usersApi.batchUpdateStatus(ids, status)
    
    ElMessage.success(`批量${action}成功`)
    selectedRows.value = []
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`批量${action}失敗`)
    }
  }
}

// 處理用戶操作
const handleUserAction = async (command: string, user: any) => {
  const [action, id] = command.split('_')
  
  switch (action) {
    case 'enable':
    case 'disable':
      await handleStatusChange(user, action === 'enable' ? 'active' : 'inactive')
      break
    case 'reset':
      if (command.startsWith('reset_password')) {
        handleResetPassword(user)
      }
      break
    case 'view':
      if (command.startsWith('view_logs')) {
        router.push(`/logs?user=${user.loginAccount}`)
      }
      break
    case 'delete':
      await handleDeleteUser(user)
      break
  }
}

// 處理狀態變更
const handleStatusChange = async (user: any, status: string) => {
  const action = status === 'active' ? '啟用' : '停用'
  
  try {
    await ElMessageBox.confirm(
      `確定要${action}用戶 "${user.displayName}" 嗎？`,
      `確認${action}`,
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 這裡調用狀態變更API
    // await usersApi.updateUserStatus(user.id, status)
    
    ElMessage.success(`${action}成功`)
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失敗`)
    }
  }
}

// 處理重置密碼
const handleResetPassword = (user: any) => {
  selectedUser.value = user
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
    
    // 這裡調用重置密碼API
    // await usersApi.resetPassword(selectedUser.value.id, newPassword.value)
    
    // 模擬API請求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('密碼重置成功')
    resetPasswordVisible.value = false
    
    // 如果沒有設置新密碼，顯示生成的密碼
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
const handleDeleteUser = async (user: any) => {
  if (user.role === 'Admin') {
    ElMessage.warning('無法刪除管理員用戶')
    return
  }
  
  if (user.id === authStore.userInfo?.id) {
    ElMessage.warning('無法刪除自己的帳號')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `確定要刪除用戶 "${user.displayName}" 嗎？此操作不可恢復。`,
      '確認刪除',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 這裡調用刪除API
    // await usersApi.deleteUser(user.id)
    
    ElMessage.success('刪除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('刪除失敗')
    }
  }
}

// 組件掛載
onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.users-list {
  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .actions-left {
      display: flex;
      gap: 8px;
    }
    
    .actions-right {
      display: flex;
      gap: 8px;
    }
  }
  
  .filter-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: var(--el-bg-color-page);
    border-radius: 8px;
    margin-bottom: 16px;
    
    .filter-item {
      display: flex;
      align-items: center;
      gap: 8px;
      
      label {
        font-size: 14px;
        color: var(--el-text-color-primary);
        white-space: nowrap;
      }
    }
  }
  
  .stats-cards {
    margin-bottom: 20px;
    
    .stat-card {
      background: var(--el-bg-color);
      border-radius: 8px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }
      
      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .el-icon {
          font-size: 24px;
          color: white;
        }
        
        &.total {
          background: linear-gradient(135deg, #409eff, #66b3ff);
        }
        
        &.admins {
          background: linear-gradient(135deg, #f56c6c, #f78a8a);
        }
        
        &.active {
          background: linear-gradient(135deg, #67c23a, #85d85a);
        }
        
        &.online {
          background: linear-gradient(135deg, #e6a23c, #f2b85c);
        }
      }
      
      .stat-content {
        flex: 1;
        
        .stat-number {
          font-size: 28px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 14px;
          color: var(--el-text-color-regular);
        }
      }
    }
  }
  
  .table-container {
    .user-info {
      .user-name {
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 2px;
      }
      
      .user-account {
        font-size: 12px;
        color: var(--el-text-color-placeholder);
        font-family: monospace;
      }
    }
    
    .login-time {
      font-size: 13px;
      color: var(--el-text-color-primary);
    }
    
    .login-ago {
      font-size: 12px;
      color: var(--el-text-color-placeholder);
    }
    
    .never-login {
      color: var(--el-text-color-placeholder);
      font-style: italic;
    }
    
    .pagination-container {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
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
  .users-list {
    .header-actions {
      flex-direction: column;
      gap: 12px;
      
      .actions-left,
      .actions-right {
        width: 100%;
        justify-content: center;
      }
    }
    
    .filter-bar {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      
      .filter-item {
        flex-direction: column;
        align-items: stretch;
      }
    }
    
    .stats-cards {
      .stat-card {
        padding: 16px;
        
        .stat-icon {
          width: 40px;
          height: 40px;
          
          .el-icon {
            font-size: 20px;
          }
        }
        
        .stat-content {
          .stat-number {
            font-size: 24px;
          }
        }
      }
    }
  }
}

// 暗黑模式
.dark {
  .filter-bar {
    background: var(--el-bg-color-page);
  }
  
  .stats-cards {
    .stat-card {
      background: var(--el-bg-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      
      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      }
    }
  }
}
</style>