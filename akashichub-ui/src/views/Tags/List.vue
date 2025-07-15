<template>
  <div class="tags-list">
    <!-- 頂部操作欄 -->
    <div class="header-actions">
      <div class="actions-left">
        <el-button
          v-if="authStore.isAdmin"
          type="primary"
          icon="Plus"
          @click="goToCreate"
        >
          新增標籤
        </el-button>
        <el-button
          v-if="authStore.isAdmin && selectedRows.length > 0"
          type="danger"
          icon="Delete"
          @click="handleBatchDelete"
        >
          批量刪除 ({{ selectedRows.length }})
        </el-button>
        <el-button
          v-if="authStore.isAdmin && selectedRows.length > 1"
          type="warning"
          icon="Promotion"
          @click="handleBatchMerge"
        >
          合併標籤
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
          placeholder="搜索標籤名稱、分類..."
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
        <label>分類：</label>
        <el-select
          v-model="filters.category"
          placeholder="全部分類"
          clearable
          style="width: 150px;"
          @change="handleFilter"
        >
          <el-option
            v-for="category in tagCategories"
            :key="category.value"
            :label="category.label"
            :value="category.value"
          />
        </el-select>
      </div>
      
      <div class="filter-item">
        <label>使用狀態：</label>
        <el-select
          v-model="filters.usageStatus"
          placeholder="全部狀態"
          clearable
          style="width: 120px;"
          @change="handleFilter"
        >
          <el-option label="已使用" value="used" />
          <el-option label="未使用" value="unused" />
        </el-select>
      </div>
      
      <div class="filter-item">
        <label>排序：</label>
        <el-select
          v-model="filters.sortBy"
          placeholder="排序方式"
          style="width: 150px;"
          @change="handleFilter"
        >
          <el-option label="名稱 A-Z" value="name_asc" />
          <el-option label="名稱 Z-A" value="name_desc" />
          <el-option label="使用次數多" value="usage_desc" />
          <el-option label="使用次數少" value="usage_asc" />
          <el-option label="創建時間新" value="created_desc" />
          <el-option label="創建時間舊" value="created_asc" />
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
              <el-icon><CollectionTag /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ tagStats.total }}</div>
              <div class="stat-label">總標籤數</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="6">
          <div class="stat-card">
            <div class="stat-icon used">
              <el-icon><CircleCheckFilled /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ tagStats.used }}</div>
              <div class="stat-label">已使用</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="6">
          <div class="stat-card">
            <div class="stat-icon unused">
              <el-icon><CircleCloseFilled /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ tagStats.unused }}</div>
              <div class="stat-label">未使用</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="6">
          <div class="stat-card">
            <div class="stat-icon categories">
              <el-icon><FolderOpened /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ tagStats.categories }}</div>
              <div class="stat-label">分類數</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 標籤表格 -->
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
          prop="name"
          label="標籤名稱"
          sortable="custom"
          min-width="200"
        >
          <template #default="{ row }">
            <div class="tag-name">
              <el-tag :type="getCategoryTagType(row.category)" effect="light">
                {{ row.name }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="category"
          label="分類"
          width="120"
        >
          <template #default="{ row }">
            <el-tag :type="getCategoryTagType(row.category)" size="small">
              {{ getCategoryLabel(row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="description"
          label="描述"
          min-width="200"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span>{{ row.description || '無描述' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="usageCount"
          label="使用次數"
          width="100"
          sortable="custom"
        >
          <template #default="{ row }">
            <el-button
              type="primary"
              text
              @click="viewTagUsage(row)"
            >
              {{ row.usageCount }}
            </el-button>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="color"
          label="顏色"
          width="80"
        >
          <template #default="{ row }">
            <div
              class="color-preview"
              :style="{ backgroundColor: row.color }"
              @click="editTagColor(row)"
            >
            </div>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="createdBy"
          label="創建者"
          width="100"
        />
        
        <el-table-column
          prop="createdAt"
          label="創建時間"
          width="160"
          sortable="custom"
        >
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
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
              @click="viewTagUsage(row)"
            >
              查看使用
            </el-button>
            <el-button
              v-if="authStore.isAdmin"
              size="small"
              type="primary"
              @click="goToEdit(row.id)"
            >
              編輯
            </el-button>
            <el-button
              v-if="authStore.isAdmin"
              size="small"
              type="danger"
              @click="handleDelete(row)"
              :disabled="row.usageCount > 0"
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

    <!-- 標籤使用詳情對話框 -->
    <el-dialog
      v-model="usageDialogVisible"
      :title="`標籤使用詳情 - ${selectedTag?.name}`"
      width="800px"
      :before-close="handleCloseUsageDialog"
    >
      <div class="usage-content">
        <div class="usage-stats">
          <el-statistic
            title="使用次數"
            :value="selectedTag?.usageCount || 0"
          />
        </div>
        
        <el-divider />
        
        <div class="usage-resources">
          <h4>使用此標籤的資源</h4>
          <div class="resource-list">
            <div
              v-for="resource in tagResources"
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
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="usageDialogVisible = false">關閉</el-button>
      </template>
    </el-dialog>

    <!-- 顏色編輯對話框 -->
    <el-dialog
      v-model="colorDialogVisible"
      title="編輯標籤顏色"
      width="400px"
    >
      <div class="color-picker-container">
        <el-color-picker
          v-model="selectedColor"
          show-alpha
          :predefine="predefineColors"
        />
        <div class="color-preview-large">
          <el-tag :color="selectedColor" effect="dark">
            {{ editingTag?.name }}
          </el-tag>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="colorDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTagColor">確定</el-button>
      </template>
    </el-dialog>

    <!-- 合併標籤對話框 -->
    <el-dialog
      v-model="mergeDialogVisible"
      title="合併標籤"
      width="500px"
    >
      <div class="merge-content">
        <el-alert
          title="注意"
          description="合併標籤將會把選中的標籤合併為一個標籤，此操作不可恢復！"
          type="warning"
          show-icon
          style="margin-bottom: 20px"
        />
        
        <el-form label-width="100px">
          <el-form-item label="目標標籤：">
            <el-select
              v-model="mergeTargetTag"
              placeholder="選擇要保留的標籤"
              style="width: 100%"
            >
              <el-option
                v-for="tag in selectedRows"
                :key="tag.id"
                :label="tag.name"
                :value="tag.id"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="合併預覽：">
            <div class="merge-preview">
              <div class="merge-sources">
                <el-tag
                  v-for="tag in selectedRows"
                  :key="tag.id"
                  :type="getCategoryTagType(tag.category)"
                  :class="{ 'merge-target': tag.id === mergeTargetTag }"
                >
                  {{ tag.name }}
                  <span v-if="tag.id === mergeTargetTag"> (保留)</span>
                </el-tag>
              </div>
              <el-icon class="merge-arrow"><ArrowRight /></el-icon>
              <div class="merge-result">
                <el-tag
                  v-if="mergeTargetTag"
                  :type="getCategoryTagType(selectedRows.find(t => t.id === mergeTargetTag)?.category)"
                  effect="dark"
                >
                  {{ selectedRows.find(t => t.id === mergeTargetTag)?.name }}
                </el-tag>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <el-button @click="mergeDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="!mergeTargetTag"
          @click="confirmMergeTags"
        >
          確認合併
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
  Delete,
  Refresh,
  Search,
  RefreshRight,
  CollectionTag,
  CircleCheckFilled,
  CircleCloseFilled,
  FolderOpened,
  Promotion,
  ArrowRight,
  Monitor,
  Coin,
  Basketball
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { format } from 'date-fns'

// 狀態管理
const authStore = useAuthStore()

// 路由
const router = useRouter()

// 響應式數據
const loading = ref(false)
const searchQuery = ref('')
const selectedRows = ref<any[]>([])
const tableData = ref<any[]>([])
const usageDialogVisible = ref(false)
const colorDialogVisible = ref(false)
const mergeDialogVisible = ref(false)
const selectedTag = ref<any>(null)
const editingTag = ref<any>(null)
const selectedColor = ref('#409eff')
const mergeTargetTag = ref<number | null>(null)
const tagResources = ref<any[]>([])

// 篩選條件
const filters = ref({
  category: '',
  usageStatus: '',
  sortBy: 'name_asc'
})

// 分頁
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 標籤分類
const tagCategories = ref([
  { label: '環境', value: 'Environment' },
  { label: '優先級', value: 'Priority' },
  { label: '部門', value: 'Department' },
  { label: '項目', value: 'Project' },
  { label: '技術', value: 'Technology' },
  { label: '其他', value: 'Other' }
])

// 預定義顏色
const predefineColors = ref([
  '#409eff',
  '#67c23a',
  '#e6a23c',
  '#f56c6c',
  '#909399',
  '#722ed1',
  '#eb2f96',
  '#13c2c2',
  '#fa8c16',
  '#52c41a'
])

// 統計數據
const tagStats = ref({
  total: 48,
  used: 35,
  unused: 13,
  categories: 6
})

// 模擬數據
const mockData = ref([
  {
    id: 1,
    name: '生產環境',
    category: 'Environment',
    description: '生產環境相關資源',
    usageCount: 25,
    color: '#f56c6c',
    createdBy: 'admin',
    createdAt: new Date('2024-01-10T08:00:00')
  },
  {
    id: 2,
    name: '測試環境',
    category: 'Environment',
    description: '測試環境相關資源',
    usageCount: 12,
    color: '#e6a23c',
    createdBy: 'admin',
    createdAt: new Date('2024-01-11T09:00:00')
  },
  {
    id: 3,
    name: '開發環境',
    category: 'Environment',
    description: '開發環境相關資源',
    usageCount: 8,
    color: '#67c23a',
    createdBy: 'admin',
    createdAt: new Date('2024-01-12T10:00:00')
  },
  {
    id: 4,
    name: '高優先級',
    category: 'Priority',
    description: '高優先級資源',
    usageCount: 15,
    color: '#f56c6c',
    createdBy: 'admin',
    createdAt: new Date('2024-01-13T11:00:00')
  },
  {
    id: 5,
    name: '中優先級',
    category: 'Priority',
    description: '中優先級資源',
    usageCount: 20,
    color: '#e6a23c',
    createdBy: 'admin',
    createdAt: new Date('2024-01-14T12:00:00')
  },
  {
    id: 6,
    name: '低優先級',
    category: 'Priority',
    description: '低優先級資源',
    usageCount: 8,
    color: '#909399',
    createdBy: 'admin',
    createdAt: new Date('2024-01-15T13:00:00')
  },
  {
    id: 7,
    name: '前端',
    category: 'Department',
    description: '前端開發相關',
    usageCount: 6,
    color: '#409eff',
    createdBy: 'user1',
    createdAt: new Date('2024-01-16T14:00:00')
  },
  {
    id: 8,
    name: '後端',
    category: 'Department',
    description: '後端開發相關',
    usageCount: 10,
    color: '#67c23a',
    createdBy: 'user1',
    createdAt: new Date('2024-01-17T15:00:00')
  },
  {
    id: 9,
    name: '未使用標籤',
    category: 'Other',
    description: '暫未使用的標籤',
    usageCount: 0,
    color: '#909399',
    createdBy: 'admin',
    createdAt: new Date('2024-01-18T16:00:00')
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
      item.description?.toLowerCase().includes(query)
    )
  }
  
  // 分類篩選
  if (filters.value.category) {
    data = data.filter(item => item.category === filters.value.category)
  }
  
  // 使用狀態篩選
  if (filters.value.usageStatus) {
    if (filters.value.usageStatus === 'used') {
      data = data.filter(item => item.usageCount > 0)
    } else if (filters.value.usageStatus === 'unused') {
      data = data.filter(item => item.usageCount === 0)
    }
  }
  
  // 排序
  if (filters.value.sortBy) {
    const [field, order] = filters.value.sortBy.split('_')
    data.sort((a, b) => {
      let aValue = a[field]
      let bValue = b[field]
      
      if (field === 'usage') {
        aValue = a.usageCount
        bValue = b.usageCount
      } else if (field === 'created') {
        aValue = a.createdAt
        bValue = b.createdAt
      }
      
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }
  
  return data
})

// 獲取分類標籤類型
const getCategoryTagType = (category: string) => {
  const typeMap: Record<string, string> = {
    Environment: 'primary',
    Priority: 'warning',
    Department: 'success',
    Project: 'info',
    Technology: 'danger',
    Other: ''
  }
  return typeMap[category] || ''
}

// 獲取分類標籤
const getCategoryLabel = (category: string) => {
  const labelMap: Record<string, string> = {
    Environment: '環境',
    Priority: '優先級',
    Department: '部門',
    Project: '項目',
    Technology: '技術',
    Other: '其他'
  }
  return labelMap[category] || category
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

// 格式化日期時間
const formatDateTime = (date: Date) => {
  return format(date, 'yyyy-MM-dd HH:mm')
}

// 載入數據
const loadData = async () => {
  try {
    loading.value = true
    
    // 模擬API請求
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 應用篩選和排序
    let data = filteredData.value
    
    // 分頁
    const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    
    tableData.value = data.slice(start, end)
    pagination.value.total = data.length
    
  } catch (error) {
    console.error('Failed to load tags:', error)
    ElMessage.error('載入標籤失敗')
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
    category: '',
    usageStatus: '',
    sortBy: 'name_asc'
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
  if (prop && order) {
    filters.value.sortBy = `${prop}_${order === 'ascending' ? 'asc' : 'desc'}`
    loadData()
  }
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
  router.push('/tags/create')
}

// 導航到編輯頁面
const goToEdit = (id: number) => {
  router.push(`/tags/${id}/edit`)
}

// 導航到資源頁面
const goToResource = (id: number) => {
  router.push(`/resources/${id}`)
}

// 查看標籤使用情況
const viewTagUsage = async (tag: any) => {
  selectedTag.value = tag
  usageDialogVisible.value = true
  
  // 模擬載入使用此標籤的資源
  tagResources.value = [
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
    }
  ]
}

// 關閉使用詳情對話框
const handleCloseUsageDialog = () => {
  usageDialogVisible.value = false
  selectedTag.value = null
  tagResources.value = []
}

// 編輯標籤顏色
const editTagColor = (tag: any) => {
  editingTag.value = tag
  selectedColor.value = tag.color
  colorDialogVisible.value = true
}

// 保存標籤顏色
const saveTagColor = async () => {
  if (!editingTag.value) return
  
  try {
    // 這裡調用API更新標籤顏色
    // await tagsApi.updateTagColor(editingTag.value.id, selectedColor.value)
    
    editingTag.value.color = selectedColor.value
    colorDialogVisible.value = false
    ElMessage.success('顏色更新成功')
    loadData()
  } catch (error) {
    ElMessage.error('顏色更新失敗')
  }
}

// 處理刪除
const handleDelete = async (tag: any) => {
  if (tag.usageCount > 0) {
    ElMessage.warning('此標籤正在使用中，無法刪除')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `確定要刪除標籤 "${tag.name}" 嗎？此操作不可恢復。`,
      '確認刪除',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 這裡調用刪除API
    // await tagsApi.deleteTag(tag.id)
    
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
  const usedTags = selectedRows.value.filter(tag => tag.usageCount > 0)
  if (usedTags.length > 0) {
    ElMessage.warning(`選中的標籤中有 ${usedTags.length} 個正在使用中，無法刪除`)
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `確定要刪除選中的 ${selectedRows.value.length} 個標籤嗎？此操作不可恢復。`,
      '確認批量刪除',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 這裡調用批量刪除API
    // const ids = selectedRows.value.map(row => row.id)
    // await tagsApi.deleteTags(ids)
    
    ElMessage.success('批量刪除成功')
    selectedRows.value = []
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量刪除失敗')
    }
  }
}

// 處理批量合併
const handleBatchMerge = () => {
  if (selectedRows.value.length < 2) {
    ElMessage.warning('請選擇至少2個標籤進行合併')
    return
  }
  
  mergeTargetTag.value = null
  mergeDialogVisible.value = true
}

// 確認合併標籤
const confirmMergeTags = async () => {
  if (!mergeTargetTag.value) {
    ElMessage.warning('請選擇要保留的標籤')
    return
  }
  
  try {
    const sourceTagIds = selectedRows.value
      .filter(tag => tag.id !== mergeTargetTag.value)
      .map(tag => tag.id)
    
    // 這裡調用合併API
    // await tagsApi.mergeTags(mergeTargetTag.value, sourceTagIds)
    
    ElMessage.success('標籤合併成功')
    mergeDialogVisible.value = false
    selectedRows.value = []
    loadData()
  } catch (error) {
    ElMessage.error('標籤合併失敗')
  }
}

// 組件掛載
onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.tags-list {
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
        
        &.used {
          background: linear-gradient(135deg, #67c23a, #85d85a);
        }
        
        &.unused {
          background: linear-gradient(135deg, #909399, #b3b8bd);
        }
        
        &.categories {
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
    .tag-name {
      .el-tag {
        font-size: 13px;
      }
    }
    
    .color-preview {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      cursor: pointer;
      border: 2px solid var(--el-border-color);
      transition: all 0.3s ease;
      
      &:hover {
        transform: scale(1.2);
        border-color: var(--el-color-primary);
      }
    }
    
    .pagination-container {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
  }
}

// 對話框樣式
.usage-content {
  .usage-stats {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .usage-resources {
    h4 {
      margin-bottom: 16px;
      color: var(--el-text-color-primary);
    }
    
    .resource-list {
      max-height: 300px;
      overflow-y: auto;
      
      .resource-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        
        &:hover {
          background-color: var(--el-bg-color-page);
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
    }
  }
}

.color-picker-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  
  .color-preview-large {
    .el-tag {
      font-size: 16px;
      padding: 8px 16px;
    }
  }
}

.merge-content {
  .merge-preview {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .merge-sources {
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      .el-tag {
        &.merge-target {
          border: 2px solid var(--el-color-primary);
        }
      }
    }
    
    .merge-arrow {
      font-size: 20px;
      color: var(--el-color-primary);
    }
    
    .merge-result {
      .el-tag {
        font-weight: 600;
      }
    }
  }
}

// 響應式設計
@media (max-width: 768px) {
  .tags-list {
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