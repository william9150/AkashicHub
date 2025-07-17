<template>
  <div class="users-list">
    <!-- 頂部操作欄 -->
    <div class="header-actions mb-3">
      <div class="actions-left">
        <button
          v-if="authStore.isAdmin"
          class="btn btn-primary me-2"
          @click="goToCreate"
        >
          <i class="bi bi-plus-circle me-2"></i>
          新增用戶
        </button>
        <button
          v-if="authStore.isAdmin && selectedRows.length > 0"
          class="btn btn-warning me-2"
          @click="handleBatchStatus('inactive')"
        >
          <i class="bi bi-lock me-2"></i>
          批量停用 ({{ selectedRows.length }})
        </button>
        <button
          v-if="authStore.isAdmin && selectedRows.length > 0"
          class="btn btn-success me-2"
          @click="handleBatchStatus('active')"
        >
          <i class="bi bi-unlock me-2"></i>
          批量啟用 ({{ selectedRows.length }})
        </button>
        <button
          class="btn btn-outline-primary me-2"
          @click="refreshData"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-arrow-clockwise me-2"></i>
          刷新
        </button>
      </div>
      
      <div class="actions-right">
        <div class="input-group" style="width: 300px;">
          <span class="input-group-text">
            <i class="bi bi-search"></i>
          </span>
          <input
            type="text"
            class="form-control"
            v-model="searchQuery"
            placeholder="搜索用戶名稱、帳號、部門..."
            @keyup.enter="handleSearch"
          />
          <button class="btn btn-outline-secondary" @click="searchQuery = ''; handleSearchClear()">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <button
          class="btn btn-primary ms-2"
          @click="handleSearch"
        >
          <i class="bi bi-search me-2"></i>
          搜索
        </button>
      </div>
    </div>

    <!-- 篩選條件 -->
    <div class="filter-bar mb-3">
      <div class="row g-3 align-items-center">
        <div class="col-auto">
          <label class="form-label mb-0">角色：</label>
        </div>
        <div class="col-auto">
          <select
            class="form-select form-select-sm"
            v-model="filters.role"
            @change="handleFilter"
          >
            <option value="">全部角色</option>
            <option value="Admin">管理員</option>
            <option value="User">用戶</option>
          </select>
        </div>
        
        <div class="col-auto">
          <label class="form-label mb-0">狀態：</label>
        </div>
        <div class="col-auto">
          <select
            class="form-select form-select-sm"
            v-model="filters.status"
            @change="handleFilter"
          >
            <option value="">全部狀態</option>
            <option value="active">啟用</option>
            <option value="inactive">停用</option>
            <option value="locked">鎖定</option>
          </select>
        </div>
        
        <div class="col-auto">
          <label class="form-label mb-0">最後登入：</label>
        </div>
        <div class="col-auto">
          <select
            class="form-select form-select-sm"
            v-model="filters.lastLogin"
            @change="handleFilter"
          >
            <option value="">全部時間</option>
            <option value="7days">最近7天</option>
            <option value="30days">最近30天</option>
            <option value="over30days">超過30天</option>
            <option value="never">從未登入</option>
          </select>
        </div>
        
        <div class="col-auto">
          <button
            class="btn btn-outline-secondary btn-sm"
            @click="resetFilters"
          >
            <i class="bi bi-arrow-clockwise me-2"></i>
            重置篩選
          </button>
        </div>
      </div>
    </div>

    <!-- 統計卡片 -->
    <div class="stats-cards mb-4">
      <div class="row g-3">
        <div class="col-12 col-sm-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon total">
              <i class="bi bi-person"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ userStats.total }}</div>
              <div class="stat-label">總用戶數</div>
            </div>
          </div>
        </div>
        
        <div class="col-12 col-sm-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon admins">
              <i class="bi bi-person-fill"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ userStats.admins }}</div>
              <div class="stat-label">管理員</div>
            </div>
          </div>
        </div>
        
        <div class="col-12 col-sm-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon active">
              <i class="bi bi-check-circle-fill"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ userStats.active }}</div>
              <div class="stat-label">啟用用戶</div>
            </div>
          </div>
        </div>
        
        <div class="col-12 col-sm-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon online">
              <i class="bi bi-wifi"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ userStats.online }}</div>
              <div class="stat-label">在線用戶</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用戶表格 -->
    <div class="table-container">
      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th v-if="authStore.isAdmin" scope="col" style="width: 50px;">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        @change="handleSelectAll"
                        :checked="isAllSelected"
                      />
                    </div>
                  </th>
                  <th scope="col" style="width: 80px;">頭像</th>
                  <th scope="col" style="cursor: pointer;" @click="handleSort('displayName')">
                    用戶名稱
                    <i v-if="sortConfig.prop === 'displayName'" :class="sortConfig.order === 'ascending' ? 'bi bi-caret-up' : 'bi bi-caret-down'"></i>
                  </th>
                  <th scope="col" style="width: 100px;">角色</th>
                  <th scope="col" style="width: 100px;">狀態</th>
                  <th scope="col">電子郵件</th>
                  <th scope="col" style="width: 120px;">部門</th>
                  <th scope="col" style="width: 160px; cursor: pointer;" @click="handleSort('lastLoginAt')">
                    最後登入
                    <i v-if="sortConfig.prop === 'lastLoginAt'" :class="sortConfig.order === 'ascending' ? 'bi bi-caret-up' : 'bi bi-caret-down'"></i>
                  </th>
                  <th scope="col" style="width: 120px; cursor: pointer;" @click="handleSort('createdAt')">
                    創建時間
                    <i v-if="sortConfig.prop === 'createdAt'" :class="sortConfig.order === 'ascending' ? 'bi bi-caret-up' : 'bi bi-caret-down'"></i>
                  </th>
                  <th scope="col" style="width: 200px;">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td :colspan="authStore.isAdmin ? 10 : 9" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
                <tr v-else-if="tableData.length === 0">
                  <td :colspan="authStore.isAdmin ? 10 : 9" class="text-center py-4 text-muted">
                    <i class="bi bi-inbox fs-1"></i>
                    <p class="mt-2">暫無用戶數據</p>
                  </td>
                </tr>
                <tr v-else v-for="row in tableData" :key="row.id">
                  <td v-if="authStore.isAdmin">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :value="row"
                        @change="handleRowSelect(row, $event)"
                        :checked="selectedRows.includes(row)"
                      />
                    </div>
                  </td>
                  <td>
                    <div class="avatar-container">
                      <img v-if="row.avatar" :src="row.avatar" class="rounded-circle" width="40" height="40" />
                      <div v-else class="avatar-placeholder">
                        <i class="bi bi-person-fill"></i>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="user-info">
                      <div class="user-name">{{ row.displayName }}</div>
                      <div class="user-account">{{ row.loginAccount }}</div>
                    </div>
                  </td>
                  <td>
                    <span :class="'badge ' + getRoleClass(row.role)">
                      {{ getRoleLabel(row.role) }}
                    </span>
                  </td>
                  <td>
                    <span :class="'badge ' + getStatusClass(row.status)">
                      {{ getStatusLabel(row.status) }}
                    </span>
                  </td>
                  <td>
                    <span class="text-truncate" style="max-width: 200px; display: inline-block;" :title="row.email">
                      {{ row.email }}
                    </span>
                  </td>
                  <td>
                    <span class="text-truncate" style="max-width: 120px; display: inline-block;" :title="row.department">
                      {{ row.department }}
                    </span>
                  </td>
                  <td>
                    <div v-if="row.lastLoginAt">
                      <div class="login-time">{{ formatDateTime(row.lastLoginAt) }}</div>
                      <div class="login-ago">{{ formatTimeAgo(row.lastLoginAt) }}</div>
                    </div>
                    <span v-else class="never-login">從未登入</span>
                  </td>
                  <td>
                    <span class="text-muted">{{ formatDate(row.createdAt) }}</span>
                  </td>
                  <td>
                    <div class="btn-group" role="group">
                      <button
                        class="btn btn-sm btn-outline-primary"
                        @click="goToDetail(row.id)"
                      >
                        查看
                      </button>
                      <button
                        v-if="authStore.isAdmin"
                        class="btn btn-sm btn-primary"
                        @click="goToEdit(row.id)"
                      >
                        編輯
                      </button>
                      <div v-if="authStore.isAdmin" class="dropdown">
                        <button
                          class="btn btn-sm btn-outline-secondary dropdown-toggle"
                          type="button"
                          :id="'dropdown-' + row.id"
                          data-bs-toggle="dropdown"
                        >
                          更多
                        </button>
                        <ul class="dropdown-menu">
                          <li>
                            <a class="dropdown-item" href="#" @click.prevent="handleUserAction(`${row.status === 'active' ? 'disable' : 'enable'}_${row.id}`, row)">
                              <i :class="row.status === 'active' ? 'bi bi-lock' : 'bi bi-unlock'"></i>
                              {{ row.status === 'active' ? '停用用戶' : '啟用用戶' }}
                            </a>
                          </li>
                          <li>
                            <a class="dropdown-item" href="#" @click.prevent="handleUserAction(`reset_password_${row.id}`, row)">
                              <i class="bi bi-key"></i>
                              重置密碼
                            </a>
                          </li>
                          <li>
                            <a class="dropdown-item" href="#" @click.prevent="handleUserAction(`view_logs_${row.id}`, row)">
                              <i class="bi bi-file-text"></i>
                              查看日誌
                            </a>
                          </li>
                          <li><hr class="dropdown-divider"></li>
                          <li>
                            <a 
                              class="dropdown-item text-danger" 
                              href="#" 
                              @click.prevent="handleUserAction(`delete_${row.id}`, row)"
                              :class="{ 'disabled': row.role === 'Admin' || row.id === authStore.userInfo?.id }"
                            >
                              <i class="bi bi-trash"></i>
                              刪除用戶
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- 分頁 -->
      <div class="pagination-container mt-3">
        <div class="row align-items-center">
          <div class="col-md-6">
            <p class="mb-0 text-muted">
              顯示 {{ (pagination.currentPage - 1) * pagination.pageSize + 1 }} 到 
              {{ Math.min(pagination.currentPage * pagination.pageSize, pagination.total) }} 項，
              共 {{ pagination.total }} 項
            </p>
          </div>
          <div class="col-md-6">
            <nav>
              <ul class="pagination justify-content-end mb-0">
                <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="handleCurrentChange(pagination.currentPage - 1)">
                    <i class="bi bi-chevron-left"></i>
                  </a>
                </li>
                
                <li 
                  v-for="page in getVisiblePages()" 
                  :key="page"
                  class="page-item"
                  :class="{ active: page === pagination.currentPage }"
                >
                  <a class="page-link" href="#" @click.prevent="handleCurrentChange(page)">
                    {{ page }}
                  </a>
                </li>
                
                <li class="page-item" :class="{ disabled: pagination.currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="handleCurrentChange(pagination.currentPage + 1)">
                    <i class="bi bi-chevron-right"></i>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
        <div class="row mt-2">
          <div class="col-md-6">
            <div class="d-flex align-items-center">
              <label class="me-2">每頁顯示：</label>
              <select class="form-select form-select-sm" style="width: auto;" v-model="pagination.pageSize" @change="handleSizeChange">
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 重置密碼模態框 -->
    <div class="modal fade" id="resetPasswordModal" tabindex="-1" ref="resetPasswordModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">重置密碼</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-warning d-flex align-items-center">
              <i class="bi bi-exclamation-triangle me-2"></i>
              <div>
                確定要重置用戶 <strong>{{ selectedUser?.displayName }}</strong> 的密碼嗎？
              </div>
            </div>
            
            <div class="mb-3">
              <label class="form-label">新密碼：</label>
              <div class="input-group">
                <input
                  type="password"
                  class="form-control"
                  v-model="newPassword"
                  placeholder="留空則自動生成"
                />
                <button class="btn btn-outline-secondary" type="button" @click="togglePasswordVisibility">
                  <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
            </div>
            <button class="btn btn-outline-primary" @click="generatePassword">
              <i class="bi bi-shuffle me-2"></i>
              生成隨機密碼
            </button>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
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
const selectedUser = ref<any>(null)
const newPassword = ref('')
const resetPasswordLoading = ref(false)
const showPassword = ref(false)
const resetPasswordModal = ref<HTMLElement>()

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
      item.email?.toLowerCase().includes(query) ||
      item.department?.toLowerCase().includes(query)
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

// 計算總頁數
const totalPages = computed(() => {
  return Math.ceil(pagination.value.total / pagination.value.pageSize)
})

// 是否全選
const isAllSelected = computed(() => {
  return tableData.value.length > 0 && selectedRows.value.length === tableData.value.length
})

// 獲取可見頁碼
const getVisiblePages = () => {
  const current = pagination.value.currentPage
  const total = totalPages.value
  const visible = []
  
  // 簡單的分頁邏輯，顯示當前頁前後各2頁
  for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
    visible.push(i)
  }
  
  return visible
}

// 獲取角色樣式
const getRoleClass = (role: string) => {
  return role === 'Admin' ? 'bg-danger' : 'bg-primary'
}

// 獲取角色標籤
const getRoleLabel = (role: string) => {
  return role === 'Admin' ? '管理員' : '用戶'
}

// 獲取狀態樣式
const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    active: 'bg-success',
    inactive: 'bg-secondary',
    locked: 'bg-warning'
  }
  return classMap[status] || 'bg-secondary'
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
    showAlert('載入用戶失敗', 'danger')
  } finally {
    loading.value = false
  }
}

// 處理搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
  loadData()
}

// 處理搜索清空
const handleSearchClear = () => {
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

// 處理排序
const handleSort = (prop: string) => {
  if (sortConfig.value.prop === prop) {
    sortConfig.value.order = sortConfig.value.order === 'ascending' ? 'descending' : 'ascending'
  } else {
    sortConfig.value.prop = prop
    sortConfig.value.order = 'ascending'
  }
  loadData()
}

// 處理全選
const handleSelectAll = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  if (checked) {
    selectedRows.value = [...tableData.value]
  } else {
    selectedRows.value = []
  }
}

// 處理行選擇
const handleRowSelect = (row: any, event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  if (checked) {
    selectedRows.value.push(row)
  } else {
    const index = selectedRows.value.indexOf(row)
    if (index > -1) {
      selectedRows.value.splice(index, 1)
    }
  }
}

// 處理分頁大小變化
const handleSizeChange = () => {
  pagination.value.currentPage = 1
  loadData()
}

// 處理當前頁變化
const handleCurrentChange = (page: number) => {
  if (page < 1 || page > totalPages.value) return
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
    showAlert('請選擇要操作的用戶', 'warning')
    return
  }
  
  const action = status === 'active' ? '啟用' : '停用'
  
  if (confirm(`確定要${action}選中的 ${selectedRows.value.length} 個用戶嗎？`)) {
    try {
      // 這裡調用批量狀態變更API
      // const ids = selectedRows.value.map(row => row.id)
      // await usersApi.batchUpdateStatus(ids, status)
      
      showAlert(`批量${action}成功`, 'success')
      selectedRows.value = []
      loadData()
    } catch (error) {
      showAlert(`批量${action}失敗`, 'danger')
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
  
  if (confirm(`確定要${action}用戶 "${user.displayName}" 嗎？`)) {
    try {
      // 這裡調用狀態變更API
      // await usersApi.updateUserStatus(user.id, status)
      
      showAlert(`${action}成功`, 'success')
      loadData()
    } catch (error) {
      showAlert(`${action}失敗`, 'danger')
    }
  }
}

// 處理重置密碼
const handleResetPassword = (user: any) => {
  selectedUser.value = user
  newPassword.value = ''
  showPassword.value = false
  
  // 顯示Bootstrap模態框
  const modal = new (window as any).bootstrap.Modal(resetPasswordModal.value)
  modal.show()
}

// 切換密碼顯示
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
  const input = document.querySelector('#resetPasswordModal input[type="password"], #resetPasswordModal input[type="text"]') as HTMLInputElement
  if (input) {
    input.type = showPassword.value ? 'text' : 'password'
  }
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
    
    showAlert('密碼重置成功', 'success')
    
    // 隱藏模態框
    const modal = (window as any).bootstrap.Modal.getInstance(resetPasswordModal.value)
    modal.hide()
    
    // 如果沒有設置新密碼，顯示生成的密碼
    if (!newPassword.value) {
      showAlert('新密碼已發送到用戶郵箱', 'info')
    }
  } catch (error) {
    showAlert('密碼重置失敗', 'danger')
  } finally {
    resetPasswordLoading.value = false
  }
}

// 處理刪除用戶
const handleDeleteUser = async (user: any) => {
  if (user.role === 'Admin') {
    showAlert('無法刪除管理員用戶', 'warning')
    return
  }
  
  if (user.id === authStore.userInfo?.id) {
    showAlert('無法刪除自己的帳號', 'warning')
    return
  }
  
  if (confirm(`確定要刪除用戶 "${user.displayName}" 嗎？此操作不可恢復。`)) {
    try {
      // 這裡調用刪除API
      // await usersApi.deleteUser(user.id)
      
      showAlert('刪除成功', 'success')
      loadData()
    } catch (error) {
      showAlert('刪除失敗', 'danger')
    }
  }
}

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
    flex-wrap: wrap;
    gap: 1rem;
    
    .actions-left {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .actions-right {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
  }
  
  .filter-bar {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid #dee2e6;
  }
  
  .stats-cards {
    .stat-card {
      background: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      border: 1px solid #dee2e6;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }
      
      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        
        i {
          font-size: 24px;
          color: white;
        }
        
        &.total {
          background: linear-gradient(135deg, #0d6efd, #6ea8fe);
        }
        
        &.admins {
          background: linear-gradient(135deg, #dc3545, #f87171);
        }
        
        &.active {
          background: linear-gradient(135deg, #198754, #75b798);
        }
        
        &.online {
          background: linear-gradient(135deg, #fd7e14, #ffc107);
        }
      }
      
      .stat-content {
        flex: 1;
        
        .stat-number {
          font-size: 28px;
          font-weight: 600;
          color: #212529;
          margin-bottom: 0.25rem;
        }
        
        .stat-label {
          font-size: 14px;
          color: #6c757d;
        }
      }
    }
  }
  
  .table-container {
    .avatar-container {
      display: flex;
      align-items: center;
      justify-content: center;
      
      .avatar-placeholder {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #e9ecef;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6c757d;
        
        i {
          font-size: 20px;
        }
      }
    }
    
    .user-info {
      .user-name {
        font-weight: 500;
        color: #212529;
        margin-bottom: 0.125rem;
      }
      
      .user-account {
        font-size: 12px;
        color: #6c757d;
        font-family: 'Consolas', 'Monaco', monospace;
      }
    }
    
    .login-time {
      font-size: 13px;
      color: #212529;
    }
    
    .login-ago {
      font-size: 12px;
      color: #6c757d;
    }
    
    .never-login {
      color: #6c757d;
      font-style: italic;
    }
    
    .table th {
      background: #f8f9fa;
      border-bottom: 2px solid #dee2e6;
      font-weight: 600;
      color: #495057;
    }
    
    .table td {
      vertical-align: middle;
    }
    
    .pagination-container {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 0.5rem;
      border: 1px solid #dee2e6;
    }
  }
}

// 響應式設計
@media (max-width: 768px) {
  .users-list {
    .header-actions {
      flex-direction: column;
      align-items: stretch;
      
      .actions-left,
      .actions-right {
        justify-content: center;
      }
      
      .actions-right {
        .input-group {
          width: 100% !important;
        }
      }
    }
    
    .stats-cards {
      .stat-card {
        padding: 1rem;
        
        .stat-icon {
          width: 40px;
          height: 40px;
          
          i {
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
    
    .table-responsive {
      font-size: 14px;
    }
  }
}

// 深色模式支持
@media (prefers-color-scheme: dark) {
  .users-list {
    .filter-bar {
      background: #343a40;
      border-color: #495057;
    }
    
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
    
    .table-container {
      .card {
        background: #212529;
        border-color: #495057;
        color: #fff;
      }
      
      .table th {
        background: #343a40;
        border-color: #495057;
        color: #fff;
      }
      
      .pagination-container {
        background: #343a40;
        border-color: #495057;
      }
    }
  }
}
</style>