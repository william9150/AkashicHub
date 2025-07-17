<template>
  <div class="resources-list">
    <!-- 頂部操作欄 -->
    <div class="header-actions row g-3 mb-3">
      <div class="col-auto">
        <div class="btn-group" role="group">
          <button
            v-if="authStore.canEditITData"
            type="button"
            class="btn btn-primary"
            @click="goToCreate"
          >
            <i class="bi bi-plus-circle me-1"></i>
            新增資源
          </button>
          <button
            v-if="authStore.canDeleteAnyData && selectedRows.length > 0"
            type="button"
            class="btn btn-danger"
            @click="handleBatchDelete"
          >
            <i class="bi bi-trash me-1"></i>
            批量刪除 ({{ selectedRows.length }})
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="refreshData"
            :disabled="loading"
          >
            <i class="bi bi-arrow-clockwise me-1" :class="{ 'fa-spin': loading }"></i>
            刷新
          </button>
        </div>
      </div>
      
      <div class="col-auto ms-auto">
        <div class="input-group" style="width: 350px;">
          <span class="input-group-text">
            <i class="bi bi-search"></i>
          </span>
          <input
            type="text"
            class="form-control"
            placeholder="搜索資源名稱、IP地址、登入用戶..."
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            @input="handleSearchInput"
          >
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="goToAdvancedSearch"
            title="高級搜索"
          >
            <i class="bi bi-gear"></i>
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="handleSearch"
          >
            搜索
          </button>
        </div>
      </div>
    </div>

    <!-- 篩選條件 -->
    <div class="filter-bar card mb-3">
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div class="col-auto">
            <label class="form-label mb-0">資源類型：</label>
            <select
              class="form-select"
              v-model="filters.resourceType"
              @change="handleFilter"
              style="width: 150px;"
            >
              <option value="">全部類型</option>
              <option
                v-for="type in resourceTypes"
                :key="type.value"
                :value="type.value"
              >
                {{ type.label }}
              </option>
            </select>
          </div>
          
          <div class="col-auto">
            <label class="form-label mb-0">標籤：</label>
            <select
              class="form-select"
              v-model="filters.tags"
              @change="handleFilter"
              multiple
              style="width: 200px;"
            >
              <option
                v-for="tag in availableTags"
                :key="tag.id"
                :value="tag.id"
              >
                {{ tag.name }}
              </option>
            </select>
          </div>
          
          <div class="col-auto">
            <label class="form-label mb-0">狀態：</label>
            <select
              class="form-select"
              v-model="filters.status"
              @change="handleFilter"
              style="width: 120px;"
            >
              <option value="">全部狀態</option>
              <option value="active">正常</option>
              <option value="inactive">停用</option>
              <option value="maintenance">維護中</option>
            </select>
          </div>
          
          <div class="col-auto">
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="resetFilters"
            >
              <i class="bi bi-arrow-clockwise me-1"></i>
              重置篩選
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 資源表格 -->
    <div class="table-container">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">資源列表</h5>
          <span class="text-muted">共 {{ pagination.total }} 筆資料</span>
        </div>
        
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th v-if="authStore.canDeleteAnyData" style="width: 50px;">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      @change="handleSelectAll"
                      :checked="isAllSelected"
                      :indeterminate="isIndeterminate"
                    >
                  </th>
                  <th style="min-width: 200px; cursor: pointer;" @click="handleSort('name')">
                    <span>資源名稱</span>
                    <i class="bi" :class="getSortIcon('name')"></i>
                  </th>
                  <th style="width: 120px;">類型</th>
                  <th style="width: 140px;">IP地址</th>
                  <th style="width: 120px;">登入用戶</th>
                  <th style="min-width: 200px;">標籤</th>
                  <th style="width: 100px;">狀態</th>
                  <th style="width: 160px; cursor: pointer;" @click="handleSort('updatedAt')">
                    <span>更新時間</span>
                    <i class="bi" :class="getSortIcon('updatedAt')"></i>
                  </th>
                  <th style="width: 180px;">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td :colspan="authStore.canDeleteAnyData ? 9 : 8" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">載入中...</span>
                    </div>
                  </td>
                </tr>
                <tr v-else-if="tableData.length === 0">
                  <td :colspan="authStore.canDeleteAnyData ? 9 : 8" class="text-center py-4 text-muted">
                    <i class="bi bi-inbox fs-1"></i>
                    <p class="mt-2">暫無資源資料</p>
                  </td>
                </tr>
                <tr v-else v-for="row in tableData" :key="row.id">
                  <td v-if="authStore.canDeleteAnyData">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :value="row"
                      @change="handleRowSelect"
                      :checked="isRowSelected(row)"
                    >
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <i class="bi me-2 fs-5" :class="getResourceTypeIcon(row.resourceType)" :style="{ color: getResourceTypeColor(row.resourceType) }"></i>
                      <span>{{ row.name }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="badge" :class="getResourceTypeTagClass(row.resourceType)">
                      {{ row.resourceType }}
                    </span>
                  </td>
                  <td>{{ row.ipAddress }}</td>
                  <td>{{ row.loginUser }}</td>
                  <td>
                    <div class="d-flex flex-wrap gap-1">
                      <span
                        v-for="tag in row.tags"
                        :key="tag.id"
                        class="badge"
                        :class="getTagClass(tag.category)"
                      >
                        {{ tag.name }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span class="badge" :class="getStatusTagClass(row.status)">
                      {{ getStatusText(row.status) }}
                    </span>
                  </td>
                  <td class="text-muted small">{{ formatDateTime(row.updatedAt) }}</td>
                  <td>
                    <div class="btn-group btn-group-sm" role="group">
                      <button
                        type="button"
                        class="btn btn-outline-primary"
                        @click="goToDetail(row.id)"
                      >
                        查看
                      </button>
                      <button
                        v-if="authStore.canEditITData"
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="goToEdit(row.id)"
                      >
                        編輯
                      </button>
                      <button
                        v-if="canDeleteResource(row)"
                        type="button"
                        class="btn btn-outline-danger"
                        @click="handleDelete(row)"
                      >
                        刪除
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- 分頁 -->
      <div class="d-flex justify-content-between align-items-center mt-3">
        <div class="text-muted">
          顯示第 {{ (pagination.currentPage - 1) * pagination.pageSize + 1 }} 到 {{ Math.min(pagination.currentPage * pagination.pageSize, pagination.total) }} 筆，共 {{ pagination.total }} 筆
        </div>
        <div class="d-flex align-items-center gap-2">
          <label class="form-label mb-0">每頁顯示：</label>
          <select class="form-select" v-model="pagination.pageSize" @change="handleSizeChange" style="width: 80px;">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <nav>
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
                <button class="page-link" @click="handleCurrentChange(1)" :disabled="pagination.currentPage === 1">
                  <i class="bi bi-chevron-double-left"></i>
                </button>
              </li>
              <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
                <button class="page-link" @click="handleCurrentChange(pagination.currentPage - 1)" :disabled="pagination.currentPage === 1">
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>
              <li
                v-for="page in visiblePages"
                :key="page"
                class="page-item"
                :class="{ active: page === pagination.currentPage }"
              >
                <button class="page-link" @click="handleCurrentChange(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: pagination.currentPage === totalPages }">
                <button class="page-link" @click="handleCurrentChange(pagination.currentPage + 1)" :disabled="pagination.currentPage === totalPages">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>
              <li class="page-item" :class="{ disabled: pagination.currentPage === totalPages }">
                <button class="page-link" @click="handleCurrentChange(totalPages)" :disabled="pagination.currentPage === totalPages">
                  <i class="bi bi-chevron-double-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showAlert, showConfirm } from '@/utils/bootstrap-alerts'
import { useAuthStore } from '@/stores/auth'
import { format } from 'date-fns'

// 狀態管理
const authStore = useAuthStore()

// 路由
const router = useRouter()
const route = useRoute()

// 響應式數據
const loading = ref(false)
const searchQuery = ref('')
const selectedRows = ref<any[]>([])
const tableData = ref<any[]>([])

// 篩選條件
const filters = ref({
  resourceType: '',
  tags: [] as number[],
  status: ''
})

// 分頁
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 排序
const sortConfig = ref({
  prop: 'updatedAt',
  order: 'descending'
})

// 資源類型選項
const resourceTypes = ref([
  { label: '伺服器', value: 'Server' },
  { label: '資料庫', value: 'Database' },
  { label: '網站', value: 'Website' },
  { label: '儲存', value: 'Storage' },
  { label: '緩存', value: 'Cache' }
])

// 可用標籤
const availableTags = ref([
  { id: 1, name: '生產環境', category: 'Environment' },
  { id: 2, name: '測試環境', category: 'Environment' },
  { id: 3, name: '開發環境', category: 'Environment' },
  { id: 4, name: '高優先級', category: 'Priority' },
  { id: 5, name: '中優先級', category: 'Priority' },
  { id: 6, name: '低優先級', category: 'Priority' }
])

// 模擬數據
const mockData = ref([
  {
    id: 1,
    name: 'Web Server 01',
    resourceType: 'Server',
    ipAddress: '192.168.1.100',
    loginUser: 'admin',
    status: 'active',
    createdBy: 1, // admin (SuperAdmin) 創建
    tags: [
      { id: 1, name: '生產環境', category: 'Environment' },
      { id: 4, name: '高優先級', category: 'Priority' }
    ],
    updatedAt: new Date('2024-01-15T10:30:00')
  },
  {
    id: 2,
    name: 'MySQL Database',
    resourceType: 'Database',
    ipAddress: '192.168.1.101',
    loginUser: 'dbuser',
    status: 'active',
    createdBy: 2, // willy (ITManager) 創建
    tags: [
      { id: 1, name: '生產環境', category: 'Environment' }
    ],
    updatedAt: new Date('2024-01-14T15:45:00')
  },
  {
    id: 3,
    name: 'Redis Cache',
    resourceType: 'Cache',
    ipAddress: '192.168.1.102',
    loginUser: 'redis',
    status: 'maintenance',
    createdBy: 1, // admin (SuperAdmin) 創建
    tags: [
      { id: 2, name: '測試環境', category: 'Environment' },
      { id: 5, name: '中優先級', category: 'Priority' }
    ],
    updatedAt: new Date('2024-01-13T09:20:00')
  },
  {
    id: 4,
    name: 'File Storage',
    resourceType: 'Storage',
    ipAddress: '192.168.1.103',
    loginUser: 'storage',
    status: 'active',
    createdBy: 2, // willy (ITManager) 創建
    tags: [
      { id: 3, name: '開發環境', category: 'Environment' },
      { id: 6, name: '低優先級', category: 'Priority' }
    ],
    updatedAt: new Date('2024-01-12T14:15:00')
  }
])

// 計算屬性
const filteredData = computed(() => {
  let data = [...mockData.value]
  
  // 搜索篩選
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    data = data.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.ipAddress.toLowerCase().includes(query) ||
      item.loginUser.toLowerCase().includes(query) ||
      item.resourceType.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.name.toLowerCase().includes(query))
    )
  }
  
  // 資源類型篩選
  if (filters.value.resourceType) {
    data = data.filter(item => item.resourceType === filters.value.resourceType)
  }
  
  // 標籤篩選
  if (filters.value.tags.length > 0) {
    data = data.filter(item => 
      filters.value.tags.some(tagId => 
        item.tags.some(tag => tag.id === tagId)
      )
    )
  }
  
  // 狀態篩選
  if (filters.value.status) {
    data = data.filter(item => item.status === filters.value.status)
  }
  
  return data
})

// 獲取資源類型圖標
const getResourceTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    Server: 'bi-server',
    Database: 'bi-database',
    Website: 'bi-globe',
    Storage: 'bi-folder',
    Cache: 'bi-memory'
  }
  return iconMap[type] || 'bi-server'
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

// 獲取資源類型標籤類別
const getResourceTypeTagClass = (type: string) => {
  const typeMap: Record<string, string> = {
    Server: 'bg-primary',
    Database: 'bg-success',
    Website: 'bg-warning',
    Storage: 'bg-danger',
    Cache: 'bg-info'
  }
  return typeMap[type] || 'bg-secondary'
}

// 獲取標籤類別
const getTagClass = (category: string) => {
  const typeMap: Record<string, string> = {
    Environment: 'bg-primary',
    Priority: 'bg-warning',
    Department: 'bg-success',
    Project: 'bg-info'
  }
  return typeMap[category] || 'bg-secondary'
}

// 獲取狀態標籤類別
const getStatusTagClass = (status: string) => {
  const typeMap: Record<string, string> = {
    active: 'bg-success',
    inactive: 'bg-secondary',
    maintenance: 'bg-warning'
  }
  return typeMap[status] || 'bg-secondary'
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

// 格式化日期時間
const formatDateTime = (date: Date) => {
  return format(date, 'yyyy-MM-dd HH:mm:ss')
}

// 檢查是否可以刪除資源
const canDeleteResource = (resource: any) => {
  // SuperAdmin 可以刪除所有資源
  if (authStore.canDeleteAnyData) {
    return true
  }
  
  // ITManager 只能刪除自己創建的資源
  if (authStore.canDeleteOwnData && authStore.user?.id === resource.createdBy) {
    return true
  }
  
  return false
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
    console.error('Failed to load resources:', error)
    showAlert('載入資源失敗', 'error')
  } finally {
    loading.value = false
  }
}

// 處理搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
  updateUrlParams()
  loadData()
}

// 處理搜索輸入
const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.value === '') {
    handleSearchClear()
  }
}

// 處理搜索清空
const handleSearchClear = () => {
  searchQuery.value = ''
  pagination.value.currentPage = 1
  updateUrlParams()
  loadData()
}

// 前往高級搜索
const goToAdvancedSearch = () => {
  router.push({
    path: '/search',
    query: { 
      q: searchQuery.value,
      scope: 'resources'
    }
  })
}

// 更新URL參數
const updateUrlParams = () => {
  const query: Record<string, any> = {}
  
  if (searchQuery.value) {
    query.search = searchQuery.value
  }
  if (filters.value.resourceType) {
    query.type = filters.value.resourceType
  }
  if (filters.value.status) {
    query.status = filters.value.status
  }
  if (filters.value.tags.length > 0) {
    query.tags = filters.value.tags.join(',')
  }
  
  router.replace({
    path: route.path,
    query
  })
}

// 從URL參數初始化搜索
const initFromUrlParams = () => {
  const query = route.query
  
  if (query.search) {
    searchQuery.value = query.search as string
  }
  if (query.type) {
    filters.value.resourceType = query.type as string
  }
  if (query.status) {
    filters.value.status = query.status as string
  }
  if (query.tags) {
    filters.value.tags = (query.tags as string).split(',').map(Number)
  }
  if (query.tag) {
    // 支持單個標籤篩選（從其他頁面跳轉過來）
    const tagName = query.tag as string
    const tag = availableTags.value.find(t => t.name === tagName)
    if (tag) {
      filters.value.tags = [tag.id]
    }
  }
}

// 處理篩選
const handleFilter = () => {
  pagination.value.currentPage = 1
  updateUrlParams()
  loadData()
}

// 重置篩選
const resetFilters = () => {
  filters.value = {
    resourceType: '',
    tags: [],
    status: ''
  }
  searchQuery.value = ''
  pagination.value.currentPage = 1
  updateUrlParams()
  loadData()
}

// 處理選擇變化
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

// 處理全選
const handleSelectAll = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.checked) {
    selectedRows.value = [...tableData.value]
  } else {
    selectedRows.value = []
  }
}

// 處理單行選擇
const handleRowSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const row = target.value as any
  
  if (target.checked) {
    if (!selectedRows.value.includes(row)) {
      selectedRows.value.push(row)
    }
  } else {
    const index = selectedRows.value.indexOf(row)
    if (index > -1) {
      selectedRows.value.splice(index, 1)
    }
  }
}

// 檢查行是否被選中
const isRowSelected = (row: any) => {
  return selectedRows.value.includes(row)
}

// 計算屬性：是否全選
const isAllSelected = computed(() => {
  return tableData.value.length > 0 && selectedRows.value.length === tableData.value.length
})

// 計算屬性：是否部分選擇
const isIndeterminate = computed(() => {
  return selectedRows.value.length > 0 && selectedRows.value.length < tableData.value.length
})

// 處理排序變化
const handleSortChange = ({ prop, order }: any) => {
  sortConfig.value = { prop, order }
  loadData()
}

// 處理排序
const handleSort = (prop: string) => {
  if (sortConfig.value.prop === prop) {
    // 切換排序順序
    sortConfig.value.order = sortConfig.value.order === 'ascending' ? 'descending' : 'ascending'
  } else {
    // 新的排序屬性
    sortConfig.value.prop = prop
    sortConfig.value.order = 'ascending'
  }
  loadData()
}

// 獲取排序圖標
const getSortIcon = (prop: string) => {
  if (sortConfig.value.prop !== prop) {
    return 'bi-arrow-down-up'
  }
  return sortConfig.value.order === 'ascending' ? 'bi-arrow-up' : 'bi-arrow-down'
}

// 處理分頁大小變化
const handleSizeChange = (event?: Event) => {
  if (event) {
    const target = event.target as HTMLSelectElement
    pagination.value.pageSize = Number(target.value)
  }
  pagination.value.currentPage = 1
  loadData()
}

// 處理當前頁變化
const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page
  loadData()
}

// 計算屬性：總頁數
const totalPages = computed(() => {
  return Math.ceil(pagination.value.total / pagination.value.pageSize)
})

// 計算屬性：可見的頁碼
const visiblePages = computed(() => {
  const current = pagination.value.currentPage
  const total = totalPages.value
  const delta = 2
  
  let start = Math.max(1, current - delta)
  let end = Math.min(total, current + delta)
  
  if (end - start < 2 * delta) {
    if (start === 1) {
      end = Math.min(total, start + 2 * delta)
    } else if (end === total) {
      start = Math.max(1, end - 2 * delta)
    }
  }
  
  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// 刷新數據
const refreshData = () => {
  loadData()
}

// 導航到創建頁面
const goToCreate = () => {
  router.push('/resources/create')
}

// 導航到詳情頁面
const goToDetail = (id: number) => {
  router.push(`/resources/${id}`)
}

// 導航到編輯頁面
const goToEdit = (id: number) => {
  router.push(`/resources/${id}/edit`)
}

// 處理刪除
const handleDelete = async (resource: any) => {
  try {
    const confirmed = await showConfirm(
      `確定要刪除資源 "${resource.name}" 嗎？此操作不可恢復。`,
      '確認刪除',
      {
        confirmText: '確定',
        cancelText: '取消',
        type: 'danger'
      }
    )
    
    if (!confirmed) return
    
    // 這裡調用刪除API
    // await resourcesApi.deleteResource(resource.id)
    
    showAlert('刪除成功', 'success')
    loadData()
  } catch (error) {
    showAlert('刪除失敗', 'error')
  }
}

// 處理批量刪除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    showAlert('請選擇要刪除的資源', 'warning')
    return
  }
  
  try {
    const confirmed = await showConfirm(
      `確定要刪除選中的 ${selectedRows.value.length} 個資源嗎？此操作不可恢復。`,
      '確認批量刪除',
      {
        confirmText: '確定',
        cancelText: '取消',
        type: 'danger'
      }
    )
    
    if (!confirmed) return
    
    // 這裡調用批量刪除API
    // const ids = selectedRows.value.map(row => row.id)
    // await resourcesApi.deleteResources(ids)
    
    showAlert('批量刪除成功', 'success')
    selectedRows.value = []
    loadData()
  } catch (error) {
    showAlert('批量刪除失敗', 'error')
  }
}

// 監聽路由查詢參數變化
watch(
  () => route.query,
  (newQuery, oldQuery) => {
    if (JSON.stringify(newQuery) !== JSON.stringify(oldQuery)) {
      initFromUrlParams()
      loadData()
    }
  }
)

// 組件掛載
onMounted(() => {
  initFromUrlParams()
  loadData()
})
</script>

<style lang="scss" scoped>
.resources-list {
  .header-actions {
    .btn-group {
      .btn {
        border-radius: 0.375rem;
        
        &:not(:last-child) {
          margin-right: 0.5rem;
        }
      }
    }
  }
  
  .filter-bar {
    .form-label {
      font-weight: 500;
      color: var(--bs-gray-700);
    }
  }
  
  .table-container {
    .table {
      th {
        background-color: var(--bs-gray-50);
        border-bottom: 2px solid var(--bs-gray-200);
        font-weight: 600;
        
        &[style*="cursor: pointer"] {
          user-select: none;
          transition: background-color 0.15s ease-in-out;
          
          &:hover {
            background-color: var(--bs-gray-100);
          }
        }
      }
      
      td {
        vertical-align: middle;
        padding: 0.75rem;
        
        .badge {
          font-size: 0.75rem;
        }
      }
      
      tbody tr {
        transition: background-color 0.15s ease-in-out;
        
        &:hover {
          background-color: var(--bs-gray-50);
        }
      }
    }
    
    .btn-group-sm .btn {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
    }
  }
  
  .pagination {
    .page-link {
      padding: 0.375rem 0.75rem;
      
      &:hover {
        z-index: 2;
        color: var(--bs-primary);
        background-color: var(--bs-gray-200);
        border-color: var(--bs-gray-300);
      }
    }
    
    .page-item.active .page-link {
      z-index: 3;
      color: var(--bs-white);
      background-color: var(--bs-primary);
      border-color: var(--bs-primary);
    }
  }
}

// 響應式設計
@media (max-width: 768px) {
  .resources-list {
    .header-actions {
      .col-auto {
        width: 100%;
        
        .btn-group {
          width: 100%;
          justify-content: center;
        }
        
        .input-group {
          width: 100% !important;
        }
      }
    }
    
    .filter-bar {
      .row {
        flex-direction: column;
        
        .col-auto {
          width: 100%;
          
          .form-select {
            width: 100% !important;
          }
        }
      }
    }
    
    .table-responsive {
      font-size: 0.875rem;
    }
  }
}

// 暗黑模式
@media (prefers-color-scheme: dark) {
  .resources-list {
    .filter-bar {
      background-color: var(--bs-dark);
      border-color: var(--bs-gray-700);
    }
    
    .table {
      --bs-table-bg: var(--bs-dark);
      --bs-table-color: var(--bs-white);
    }
  }
}
</style>