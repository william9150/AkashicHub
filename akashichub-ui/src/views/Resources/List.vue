<template>
  <div class="resources-list">
    <!-- 頂部操作欄 -->
    <div class="header-actions">
      <div class="actions-left">
        <el-button
          v-if="authStore.canEditITData"
          type="primary"
          icon="Plus"
          @click="goToCreate"
        >
          新增資源
        </el-button>
        <el-button
          v-if="authStore.canDeleteAnyData && selectedRows.length > 0"
          type="danger"
          icon="Delete"
          @click="handleBatchDelete"
        >
          批量刪除 ({{ selectedRows.length }})
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
          placeholder="搜索資源名稱、IP地址、登入用戶..."
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
        <label>資源類型：</label>
        <el-select
          v-model="filters.resourceType"
          placeholder="全部類型"
          clearable
          style="width: 150px;"
          @change="handleFilter"
        >
          <el-option
            v-for="type in resourceTypes"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </div>
      
      <div class="filter-item">
        <label>標籤：</label>
        <el-select
          v-model="filters.tags"
          placeholder="選擇標籤"
          multiple
          clearable
          style="width: 200px;"
          @change="handleFilter"
        >
          <el-option
            v-for="tag in availableTags"
            :key="tag.id"
            :label="tag.name"
            :value="tag.id"
          />
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
          <el-option label="正常" value="active" />
          <el-option label="停用" value="inactive" />
          <el-option label="維護中" value="maintenance" />
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

    <!-- 資源表格 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column
          v-if="authStore.canDeleteAnyData"
          type="selection"
          width="55"
        />
        
        <el-table-column
          prop="name"
          label="資源名稱"
          sortable="custom"
          min-width="200"
        >
          <template #default="{ row }">
            <div class="resource-name">
              <el-icon :color="getResourceTypeColor(row.resourceType)">
                <component :is="getResourceTypeIcon(row.resourceType)" />
              </el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="resourceType"
          label="類型"
          width="120"
        >
          <template #default="{ row }">
            <el-tag :type="getResourceTypeTagType(row.resourceType)">
              {{ row.resourceType }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="ipAddress"
          label="IP地址"
          width="140"
        />
        
        <el-table-column
          prop="loginUser"
          label="登入用戶"
          width="120"
        />
        
        <el-table-column
          prop="tags"
          label="標籤"
          min-width="200"
        >
          <template #default="{ row }">
            <div class="tags-container">
              <el-tag
                v-for="tag in row.tags"
                :key="tag.id"
                size="small"
                :type="getTagType(tag.category)"
                style="margin-right: 4px;"
              >
                {{ tag.name }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="status"
          label="狀態"
          width="100"
        >
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="updatedAt"
          label="更新時間"
          width="160"
          sortable="custom"
        >
          <template #default="{ row }">
            {{ formatDateTime(row.updatedAt) }}
          </template>
        </el-table-column>
        
        <el-table-column
          label="操作"
          width="180"
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
              v-if="authStore.canEditITData"
              size="small"
              type="primary"
              @click="goToEdit(row.id)"
            >
              編輯
            </el-button>
            <el-button
              v-if="canDeleteResource(row)"
              size="small"
              type="danger"
              @click="handleDelete(row)"
            >
              刪除
            </el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Delete,
  Refresh,
  Search,
  RefreshRight,
  Setting,
  Monitor,
  Coin,
  Basketball,
  FolderOpened
} from '@element-plus/icons-vue'
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
    ElMessage.error('載入資源失敗')
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
    await ElMessageBox.confirm(
      `確定要刪除資源 "${resource.name}" 嗎？此操作不可恢復。`,
      '確認刪除',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 這裡調用刪除API
    // await resourcesApi.deleteResource(resource.id)
    
    ElMessage.success('刪除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('刪除失敗')
    }
  }
}

// 處理批量刪除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('請選擇要刪除的資源')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `確定要刪除選中的 ${selectedRows.value.length} 個資源嗎？此操作不可恢復。`,
      '確認批量刪除',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 這裡調用批量刪除API
    // const ids = selectedRows.value.map(row => row.id)
    // await resourcesApi.deleteResources(ids)
    
    ElMessage.success('批量刪除成功')
    selectedRows.value = []
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量刪除失敗')
    }
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
  
  .table-container {
    .resource-name {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .el-icon {
        font-size: 16px;
      }
    }
    
    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    
    .pagination-container {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
  }
}

// 響應式設計
@media (max-width: 768px) {
  .resources-list {
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
  }
}

// 暗黑模式
.dark {
  .filter-bar {
    background: var(--el-bg-color-page);
  }
}
</style>