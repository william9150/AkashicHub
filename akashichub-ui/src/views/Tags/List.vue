<template>
  <div class="tags-list">
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
            新增標籤
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
            v-if="authStore.canDeleteAnyData && selectedRows.length > 1"
            type="button"
            class="btn btn-warning"
            @click="handleBatchMerge"
          >
            <i class="bi bi-union me-1"></i>
            合併標籤
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
            placeholder="搜索標籤名稱、分類..."
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
            <label class="form-label mb-0">分類：</label>
            <select
              class="form-select"
              v-model="filters.category"
              @change="handleFilter"
              style="width: 150px;"
            >
              <option value="">全部分類</option>
              <option
                v-for="category in tagCategories"
                :key="category.value"
                :value="category.value"
              >
                {{ category.label }}
              </option>
            </select>
          </div>
          
          <div class="col-auto">
            <label class="form-label mb-0">使用狀態：</label>
            <select
              class="form-select"
              v-model="filters.usageStatus"
              @change="handleFilter"
              style="width: 120px;"
            >
              <option value="">全部狀態</option>
              <option value="used">已使用</option>
              <option value="unused">未使用</option>
            </select>
          </div>
          
          <div class="col-auto">
            <label class="form-label mb-0">排序：</label>
            <select
              class="form-select"
              v-model="filters.sortBy"
              @change="handleFilter"
              style="width: 150px;"
            >
              <option value="name_asc">名稱 A-Z</option>
              <option value="name_desc">名稱 Z-A</option>
              <option value="usage_desc">使用次數多</option>
              <option value="usage_asc">使用次數少</option>
              <option value="created_desc">創建時間新</option>
              <option value="created_asc">創建時間舊</option>
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

    <!-- 統計卡片 -->
    <div class="stats-cards mb-3">
      <div class="row g-3">
        <div class="col-6 col-md-3">
          <div class="stat-card card h-100">
            <div class="card-body d-flex align-items-center">
              <div class="stat-icon total me-3">
                <i class="bi bi-tags"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ tagStats.total }}</div>
                <div class="stat-label">總標籤數</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-6 col-md-3">
          <div class="stat-card card h-100">
            <div class="card-body d-flex align-items-center">
              <div class="stat-icon used me-3">
                <i class="bi bi-check-circle-fill"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ tagStats.used }}</div>
                <div class="stat-label">已使用</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-6 col-md-3">
          <div class="stat-card card h-100">
            <div class="card-body d-flex align-items-center">
              <div class="stat-icon unused me-3">
                <i class="bi bi-x-circle-fill"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ tagStats.unused }}</div>
                <div class="stat-label">未使用</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-6 col-md-3">
          <div class="stat-card card h-100">
            <div class="card-body d-flex align-items-center">
              <div class="stat-icon categories me-3">
                <i class="bi bi-folder-fill"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ tagStats.categories }}</div>
                <div class="stat-label">分類數</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 標籤表格 -->
    <div class="table-container">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">標籤列表</h5>
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
                    <span>標籤名稱</span>
                    <i class="bi" :class="getSortIcon('name')"></i>
                  </th>
                  <th style="width: 120px;">分類</th>
                  <th style="min-width: 200px;">描述</th>
                  <th style="width: 100px; cursor: pointer;" @click="handleSort('usageCount')">
                    <span>使用次數</span>
                    <i class="bi" :class="getSortIcon('usageCount')"></i>
                  </th>
                  <th style="width: 80px;">顏色</th>
                  <th style="width: 100px;">創建者</th>
                  <th style="width: 160px; cursor: pointer;" @click="handleSort('createdAt')">
                    <span>創建時間</span>
                    <i class="bi" :class="getSortIcon('createdAt')"></i>
                  </th>
                  <th style="width: 200px;">操作</th>
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
                    <p class="mt-2">暫無標籤資料</p>
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
                    <span class="badge" :class="getCategoryTagClass(row.Category)">
                      {{ row.Name }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" :class="getCategoryTagClass(row.Category)">
                      {{ getCategoryLabel(row.Category) }}
                    </span>
                  </td>
                  <td>
                    <span class="text-truncate" :title="row.Description || '無描述'">
                      {{ row.Description || '無描述' }}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      class="btn btn-link p-0 text-primary"
                      @click="viewTagUsage(row)"
                    >
                      {{ row.usageCount }}
                    </button>
                  </td>
                  <td>
                    <div
                      class="color-preview"
                      :style="{ backgroundColor: row.Color }"
                      @click="editTagColor(row)"
                    >
                    </div>
                  </td>
                  <td class="text-muted small">{{ row.CreatedBy }}</td>
                  <td class="text-muted small">{{ formatDateTime(row.CreatedAt) }}</td>
                  <td>
                    <div class="btn-group btn-group-sm" role="group">
                      <button
                        type="button"
                        class="btn btn-outline-primary"
                        @click="viewTagUsage(row)"
                      >
                        查看使用
                      </button>
                      <button
                        v-if="authStore.canEditITData"
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="goToEdit(row.Id)"
                      >
                        編輯
                      </button>
                      <button
                        v-if="canDeleteTag(row)"
                        type="button"
                        class="btn btn-outline-danger"
                        @click="handleDelete(row)"
                        :disabled="row.UsageCount > 0"
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

    <!-- 標籤使用詳情對話框 -->
    <div class="modal fade" id="usageModal" tabindex="-1" v-show="usageDialogVisible">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">標籤使用詳情 - {{ selectedTag?.name }}</h5>
            <button type="button" class="btn-close" @click="handleCloseUsageDialog"></button>
          </div>
          <div class="modal-body">
            <div class="usage-content">
              <div class="usage-stats text-center mb-3">
                <div class="card bg-light">
                  <div class="card-body">
                    <h3 class="card-title">{{ selectedTag?.usageCount || 0 }}</h3>
                    <p class="card-text text-muted">使用次數</p>
                  </div>
                </div>
              </div>
              
              <hr>
              
              <div class="usage-resources">
                <h4 class="mb-3">使用此標籤的資源</h4>
                <div class="resource-list" style="max-height: 300px; overflow-y: auto;">
                  <div
                    v-for="resource in tagResources"
                    :key="resource.id"
                    class="resource-item d-flex align-items-center p-3 border rounded mb-2 hover-bg-light"
                    @click="goToResource(resource.id)"
                    style="cursor: pointer;"
                  >
                    <div class="resource-icon me-3">
                      <i class="bi fs-4" :class="getResourceTypeIcon(resource.resourceType)" :style="{ color: getResourceTypeColor(resource.resourceType) }"></i>
                    </div>
                    <div class="resource-content">
                      <div class="resource-name fw-bold">{{ resource.name }}</div>
                      <div class="resource-type text-muted small">{{ resource.resourceType }}</div>
                      <div class="resource-ip text-muted small font-monospace">{{ resource.ipAddress }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="handleCloseUsageDialog">關閉</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 顏色編輯對話框 -->
    <div class="modal fade" id="colorModal" tabindex="-1" v-show="colorDialogVisible">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">編輯標籤顏色</h5>
            <button type="button" class="btn-close" @click="colorDialogVisible = false"></button>
          </div>
          <div class="modal-body">
            <div class="color-picker-container d-flex flex-column align-items-center gap-3">
              <input
                type="color"
                class="form-control form-control-color"
                v-model="selectedColor"
                style="width: 100px; height: 100px;"
              >
              <div class="color-preview-large">
                <span class="badge fs-6 px-3 py-2" :style="{ backgroundColor: selectedColor, color: 'white' }">
                  {{ editingTag?.name }}
                </span>
              </div>
              <div class="predefined-colors">
                <div class="row g-1">
                  <div class="col-auto" v-for="color in predefineColors" :key="color">
                    <button
                      type="button"
                      class="btn p-1 border"
                      :style="{ backgroundColor: color, width: '30px', height: '30px' }"
                      @click="selectedColor = color"
                    ></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="colorDialogVisible = false">取消</button>
            <button type="button" class="btn btn-primary" @click="saveTagColor">確定</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 合併標籤對話框 -->
    <div class="modal fade" id="mergeModal" tabindex="-1" v-show="mergeDialogVisible">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">合併標籤</h5>
            <button type="button" class="btn-close" @click="mergeDialogVisible = false"></button>
          </div>
          <div class="modal-body">
            <div class="merge-content">
              <div class="alert alert-warning d-flex align-items-center" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <div>
                  <strong>注意：</strong>
                  合併標籤將會把選中的標籤合併為一個標籤，此操作不可恢復！
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">目標標籤：</label>
                <select
                  class="form-select"
                  v-model="mergeTargetTag"
                >
                  <option value="null">選擇要保留的標籤</option>
                  <option
                    v-for="tag in selectedRows"
                    :key="tag.Id"
                    :value="tag.Id"
                  >
                    {{ tag.Name }}
                  </option>
                </select>
              </div>
              
              <div class="mb-3">
                <label class="form-label">合併預覽：</label>
                <div class="merge-preview d-flex align-items-center gap-3">
                  <div class="merge-sources d-flex flex-column gap-2">
                    <span
                      v-for="tag in selectedRows"
                      :key="tag.Id"
                      class="badge"
                      :class="[getCategoryTagClass(tag.Category), { 'border border-primary border-2': tag.Id === mergeTargetTag }]"
                    >
                      {{ tag.Name }}
                      <span v-if="tag.Id === mergeTargetTag"> (保留)</span>
                    </span>
                  </div>
                  <i class="bi bi-arrow-right fs-4 text-primary"></i>
                  <div class="merge-result">
                    <span
                      v-if="mergeTargetTag"
                      class="badge fw-bold"
                      :class="getCategoryTagClass(selectedRows.find(t => t.id === mergeTargetTag)?.category)"
                    >
                      {{ selectedRows.find(t => t.id === mergeTargetTag)?.name }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="mergeDialogVisible = false">取消</button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="!mergeTargetTag"
              @click="confirmMergeTags"
            >
              確認合併
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
import { showAlert, showConfirm } from '@/utils/bootstrap-alerts'
import { useAuthStore } from '@/stores/auth'
import { format } from 'date-fns'
import { getTags, deleteTag, batchDeleteTags } from '@/api/tags'

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

// // 模擬數據 - 已註解，改為使用API
// const mockData = ref([
//   {
//     id: 1,
//     name: '生產環境',
//     category: 'Environment',
//     description: '生產環境相關資源',
//     usageCount: 25,
//     color: '#f56c6c',
//     createdBy: 1,
//     createdAt: new Date('2024-01-10T08:00:00')
//   },
//   {
//     id: 2,
//     name: '測試環境',
//     category: 'Environment',
//     description: '測試環境相關資源',
//     usageCount: 12,
//     color: '#e6a23c',
//     createdBy: 1,
//     createdAt: new Date('2024-01-11T09:00:00')
//   },
//   {
//     id: 3,
//     name: '開發環境',
//     category: 'Environment',
//     description: '開發環境相關資源',
//     usageCount: 8,
//     color: '#67c23a',
//     createdBy: 1,
//     createdAt: new Date('2024-01-12T10:00:00')
//   },
//   {
//     id: 4,
//     name: '高優先級',
//     category: 'Priority',
//     description: '高優先級資源',
//     usageCount: 15,
//     color: '#f56c6c',
//     createdBy: 1,
//     createdAt: new Date('2024-01-13T11:00:00')
//   },
//   {
//     id: 5,
//     name: '中優先級',
//     category: 'Priority',
//     description: '中優先級資源',
//     usageCount: 20,
//     color: '#e6a23c',
//     createdBy: 1,
//     createdAt: new Date('2024-01-14T12:00:00')
//   },
//   {
//     id: 6,
//     name: '低優先級',
//     category: 'Priority',
//     description: '低優先級資源',
//     usageCount: 8,
//     color: '#909399',
//     createdBy: 1,
//     createdAt: new Date('2024-01-15T13:00:00')
//   },
//   {
//     id: 7,
//     name: '前端',
//     category: 'Department',
//     description: '前端開發相關',
//     usageCount: 6,
//     color: '#409eff',
//     createdBy: 2,
//     createdAt: new Date('2024-01-16T14:00:00')
//   },
//   {
//     id: 8,
//     name: '後端',
//     category: 'Department',
//     description: '後端開發相關',
//     usageCount: 10,
//     color: '#67c23a',
//     createdBy: 2,
//     createdAt: new Date('2024-01-17T15:00:00')
//   },
//   {
//     id: 9,
//     name: '未使用標籤',
//     category: 'Other',
//     description: '暫未使用的標籤',
//     usageCount: 0,
//     color: '#909399',
//     createdBy: 1,
//     createdAt: new Date('2024-01-18T16:00:00')
//   }
// ])

// 從 API 取得的真實資料
const tagsData = ref([])
const totalTags = ref(0)

// 計算屬性
const filteredData = computed(() => {
  let data = [...tagsData.value]
  
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

// 獲取分類標籤類別
const getCategoryTagClass = (category: string) => {
  const typeMap: Record<string, string> = {
    Environment: 'bg-primary',
    Priority: 'bg-warning',
    Department: 'bg-success',
    Project: 'bg-info',
    Technology: 'bg-danger',
    Other: 'bg-secondary'
  }
  return typeMap[category] || 'bg-secondary'
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

// 檢查是否可以刪除標籤
const canDeleteTag = (tag: any) => {
  // SuperAdmin 可以刪除所有標籤
  if (authStore.canDeleteAnyData) {
    return true
  }
  
  // ITManager 只能刪除自己創建的標籤
  if (authStore.canDeleteOwnData && authStore.user?.id === tag.CreatedBy) {
    return true
  }
  
  return false
}

// 格式化日期時間
const formatDateTime = (date: Date) => {
  return format(date, 'yyyy-MM-dd HH:mm')
}

// 載入數據
const loadData = async () => {
  try {
    loading.value = true
    
    // 調用真實API
    const params = {
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      search: searchQuery.value,
      category: filters.value.category,
      usageStatus: filters.value.usageStatus,
      sortBy: filters.value.sortBy
    }
    
    const response = await getTags(params)
    
    // 更新數據 - 後端返回 { success: true, data: tags[] }
    tagsData.value = response || []
    
    // 前端處理分頁和篩選
    const data = filteredData.value
    const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    tableData.value = data.slice(start, end)
    pagination.value.total = data.length
    
  } catch (error) {
    console.error('Failed to load tags:', error)
    showAlert('載入標籤失敗', 'danger')
  } finally {
    loading.value = false
  }
}

// 處理搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
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
  loadData()
}

// 前往高級搜索
const goToAdvancedSearch = () => {
  // 實現高級搜索功能
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
  if (prop && order) {
    filters.value.sortBy = `${prop}_${order === 'ascending' ? 'asc' : 'desc'}`
    loadData()
  }
}

// 處理排序
const handleSort = (prop: string) => {
  const currentSort = filters.value.sortBy
  if (currentSort.startsWith(prop)) {
    // 切換排序順序
    filters.value.sortBy = currentSort.endsWith('_asc') ? `${prop}_desc` : `${prop}_asc`
  } else {
    // 新的排序屬性
    filters.value.sortBy = `${prop}_asc`
  }
  loadData()
}

// 獲取排序圖標
const getSortIcon = (prop: string) => {
  const currentSort = filters.value.sortBy
  if (!currentSort.startsWith(prop)) {
    return 'bi-arrow-down-up'
  }
  return currentSort.endsWith('_asc') ? 'bi-arrow-up' : 'bi-arrow-down'
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
    showAlert('顏色更新成功', 'success')
    loadData()
  } catch (error) {
    showAlert('顏色更新失敗', 'error')
  }
}

// 處理刪除
const handleDelete = async (tag: any) => {
  if (tag.UsageCount > 0) {
    showAlert('此標籤正在使用中，無法刪除', 'warning')
    return
  }
  
  try {
    const confirmed = await showConfirm(
      `確定要刪除標籤 "${tag.Name}" 嗎？此操作不可恢復。`,
      '確認刪除',
      {
        confirmText: '確定',
        cancelText: '取消',
        type: 'danger'
      }
    )
    
    if (!confirmed) return
    
    // 調用真實刪除API
    await deleteTag(tag.Id)
    
    showAlert('刪除成功', 'success')
    loadData()
  } catch (error) {
    console.error('Delete tag failed:', error)
    showAlert('刪除失敗，請檢查網路連線', 'danger')
  }
}

// 處理批量刪除
const handleBatchDelete = async () => {
  const usedTags = selectedRows.value.filter(tag => tag.UsageCount > 0)
  if (usedTags.length > 0) {
    showAlert(`選中的標籤中有 ${usedTags.length} 個正在使用中，無法刪除`, 'warning')
    return
  }
  
  try {
    const confirmed = await showConfirm(
      `確定要刪除選中的 ${selectedRows.value.length} 個標籤嗎？此操作不可恢復。`,
      '確認批量刪除',
      {
        confirmText: '確定',
        cancelText: '取消',
        type: 'danger'
      }
    )
    
    if (!confirmed) return
    
    // 調用真實批量刪除API
    const ids = selectedRows.value.map(row => row.id)
    await batchDeleteTags(ids)
    
    showAlert('批量刪除成功', 'success')
    selectedRows.value = []
    loadData()
  } catch (error) {
    console.error('Batch delete tags failed:', error)
    showAlert('批量刪除失敗，請檢查網路連線', 'danger')
  }
}

// 處理批量合併
const handleBatchMerge = () => {
  if (selectedRows.value.length < 2) {
    showAlert('請選擇至少2個標籤進行合併', 'warning')
    return
  }
  
  mergeTargetTag.value = null
  mergeDialogVisible.value = true
}

// 確認合併標籤
const confirmMergeTags = async () => {
  if (!mergeTargetTag.value) {
    showAlert('請選擇要保留的標籤', 'warning')
    return
  }
  
  try {
    const sourceTagIds = selectedRows.value
      .filter(tag => tag.Id !== mergeTargetTag.value)
      .map(tag => tag.Id)

    // 這裡調用合併API
    // await tagsApi.mergeTags(mergeTargetTag.value, sourceTagIds)
    
    showAlert('標籤合併成功', 'success')
    mergeDialogVisible.value = false
    selectedRows.value = []
    loadData()
  } catch (error) {
    showAlert('標籤合併失敗', 'error')
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
  
  .stats-cards {
    .stat-card {
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
      }
      
      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
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
        
        &.used {
          background: linear-gradient(135deg, #198754, #75b798);
        }
        
        &.unused {
          background: linear-gradient(135deg, #6c757d, #adb5bd);
        }
        
        &.categories {
          background: linear-gradient(135deg, #fd7e14, #ffb570);
        }
      }
      
      .stat-content {
        .stat-number {
          font-size: 28px;
          font-weight: 600;
          color: var(--bs-gray-900);
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 14px;
          color: var(--bs-gray-600);
        }
      }
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
    
    .color-preview {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      cursor: pointer;
      border: 2px solid var(--bs-gray-300);
      transition: all 0.3s ease;
      
      &:hover {
        transform: scale(1.2);
        border-color: var(--bs-primary);
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

// Modal 樣式
.modal {
  .modal-dialog {
    .modal-content {
      .modal-header {
        background-color: var(--bs-light);
        border-bottom: 1px solid var(--bs-gray-200);
      }
      
      .modal-body {
        padding: 1.5rem;
      }
      
      .modal-footer {
        border-top: 1px solid var(--bs-gray-200);
        background-color: var(--bs-light);
      }
    }
  }
}

.usage-content {
  .resource-item {
    transition: background-color 0.3s ease;
    
    &:hover {
      background-color: var(--bs-gray-100) !important;
    }
  }
}

.color-picker-container {
  .predefined-colors {
    .btn {
      &:hover {
        transform: scale(1.1);
      }
    }
  }
}

.merge-content {
  .merge-preview {
    .merge-sources {
      .badge {
        margin-bottom: 0.5rem;
      }
    }
  }
}

// 響應式設計
@media (max-width: 768px) {
  .tags-list {
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
    
    .stats-cards {
      .stat-card {
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
      font-size: 0.875rem;
    }
  }
}

// 暗黑模式
@media (prefers-color-scheme: dark) {
  .tags-list {
    .filter-bar {
      background-color: var(--bs-dark);
      border-color: var(--bs-gray-700);
    }
    
    .stats-cards {
      .stat-card {
        background-color: var(--bs-dark);
        border-color: var(--bs-gray-700);
        
        &:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.3) !important;
        }
      }
    }
    
    .table {
      --bs-table-bg: var(--bs-dark);
      --bs-table-color: var(--bs-white);
    }
  }
}
</style>