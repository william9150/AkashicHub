<template>
  <div class="search-page">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h2>高級搜索</h2>
      <p>使用高級搜索功能快速找到所需的資源、用戶和標籤</p>
    </div>

    <!-- 搜索表單 -->
    <div class="card search-form-card">
      <div class="card-body">
        <form class="search-form" @submit.prevent="handleSearch">
          <div class="row g-3">
            <!-- 關鍵字搜索 -->
            <div class="col-12">
              <label class="form-label">關鍵字</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  class="form-control"
                  v-model="searchForm.keyword"
                  placeholder="輸入搜索關鍵字..."
                  @keyup.enter="handleSearch"
                >
                <button type="button" class="btn btn-primary" @click="handleSearch">
                  搜索
                </button>
              </div>
            </div>

            <!-- 搜索範圍 -->
            <div class="col-md-6">
              <label class="form-label">搜索範圍</label>
              <div class="form-check-container">
                <div class="form-check form-check-inline">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="scopeResources"
                    value="resources"
                    v-model="searchForm.scope"
                  >
                  <label class="form-check-label" for="scopeResources">資源</label>
                </div>
                <div class="form-check form-check-inline">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="scopeUsers"
                    value="users"
                    v-model="searchForm.scope"
                  >
                  <label class="form-check-label" for="scopeUsers">用戶</label>
                </div>
                <div class="form-check form-check-inline">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="scopeTags"
                    value="tags"
                    v-model="searchForm.scope"
                  >
                  <label class="form-check-label" for="scopeTags">標籤</label>
                </div>
              </div>
            </div>

            <!-- 排序方式 -->
            <div class="col-md-6">
              <label class="form-label">排序方式</label>
              <select class="form-select" v-model="searchForm.sortBy">
                <option value="relevance">相關性</option>
                <option value="createdAt">創建時間</option>
                <option value="updatedAt">更新時間</option>
                <option value="name">名稱</option>
              </select>
            </div>
          </div>

          <!-- 高級篩選分隔線 -->
          <div class="col-12">
            <hr class="my-4">
            <h5 class="mb-3">高級篩選</h5>
          </div>

          <!-- 資源篩選 -->
          <div v-if="searchForm.scope.includes('resources')" class="col-12 filter-section">
            <h6 class="mb-3">資源篩選</h6>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">資源類型</label>
                <div class="form-check-container">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="typeServer"
                      value="Server"
                      v-model="searchForm.resourceType"
                    >
                    <label class="form-check-label" for="typeServer">伺服器</label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="typeDatabase"
                      value="Database"
                      v-model="searchForm.resourceType"
                    >
                    <label class="form-check-label" for="typeDatabase">資料庫</label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="typeWebsite"
                      value="Website"
                      v-model="searchForm.resourceType"
                    >
                    <label class="form-check-label" for="typeWebsite">網站</label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="typeStorage"
                      value="Storage"
                      v-model="searchForm.resourceType"
                    >
                    <label class="form-check-label" for="typeStorage">儲存</label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="typeCache"
                      value="Cache"
                      v-model="searchForm.resourceType"
                    >
                    <label class="form-check-label" for="typeCache">快取</label>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label">IP地址</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="searchForm.ipAddress"
                  placeholder="輸入IP地址或範圍"
                >
              </div>
            </div>
          </div>

          <!-- 用戶篩選 -->
          <div v-if="searchForm.scope.includes('users')" class="col-12 filter-section">
            <h6 class="mb-3">用戶篩選</h6>
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label">用戶角色</label>
                <div class="form-check-container">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="roleAdmin"
                      value="Admin"
                      v-model="searchForm.userRole"
                    >
                    <label class="form-check-label" for="roleAdmin">管理員</label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="roleUser"
                      value="User"
                      v-model="searchForm.userRole"
                    >
                    <label class="form-check-label" for="roleUser">用戶</label>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label" for="department">部門</label>
                <select class="form-select" id="department" v-model="selectedDepartment" @change="addDepartment">
                  <option value="">選擇部門</option>
                  <option
                    v-for="dept in departments"
                    :key="dept"
                    :value="dept"
                    :disabled="searchForm.department.includes(dept)"
                  >
                    {{ dept }}
                  </option>
                </select>
                <div class="selected-items mt-2">
                  <span
                    v-for="dept in searchForm.department"
                    :key="dept"
                    class="badge bg-secondary me-1 mb-1"
                  >
                    {{ dept }}
                    <button
                      type="button"
                      class="btn-close btn-close-white ms-1"
                      @click="removeDepartment(dept)"
                    ></button>
                  </span>
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label">帳號狀態</label>
                <div class="form-check-container">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="statusActive"
                      value="active"
                      v-model="searchForm.userStatus"
                    >
                    <label class="form-check-label" for="statusActive">啟用</label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="statusInactive"
                      value="inactive"
                      v-model="searchForm.userStatus"
                    >
                    <label class="form-check-label" for="statusInactive">停用</label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="statusLocked"
                      value="locked"
                      v-model="searchForm.userStatus"
                    >
                    <label class="form-check-label" for="statusLocked">鎖定</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 標籤篩選 -->
          <div v-if="searchForm.scope.includes('tags')" class="col-12 filter-section">
            <h6 class="mb-3">標籤篩選</h6>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">標籤分類</label>
                <div class="form-check-container">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="catEnvironment"
                      value="Environment"
                      v-model="searchForm.tagCategory"
                    >
                    <label class="form-check-label" for="catEnvironment">環境</label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="catPriority"
                      value="Priority"
                      v-model="searchForm.tagCategory"
                    >
                    <label class="form-check-label" for="catPriority">優先級</label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="catDepartment"
                      value="Department"
                      v-model="searchForm.tagCategory"
                    >
                    <label class="form-check-label" for="catDepartment">部門</label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="catProject"
                      value="Project"
                      v-model="searchForm.tagCategory"
                    >
                    <label class="form-check-label" for="catProject">項目</label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="catTechnology"
                      value="Technology"
                      v-model="searchForm.tagCategory"
                    >
                    <label class="form-check-label" for="catTechnology">技術</label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="catOther"
                      value="Other"
                      v-model="searchForm.tagCategory"
                    >
                    <label class="form-check-label" for="catOther">其他</label>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label">使用次數範圍</label>
                <div class="row g-2">
                  <div class="col-6">
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="searchForm.minUsageCount"
                      placeholder="最小使用次數"
                      min="0"
                    >
                  </div>
                  <div class="col-6">
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="searchForm.maxUsageCount"
                      placeholder="最大使用次數"
                      :min="searchForm.minUsageCount || 0"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 時間範圍 -->
          <div class="col-12">
            <hr class="my-4">
            <h6 class="mb-3">時間範圍</h6>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">創建時間</label>
                <div class="row g-2">
                  <div class="col-6">
                    <input
                      type="datetime-local"
                      class="form-control"
                      v-model="searchForm.createdStartDate"
                      placeholder="開始日期"
                    >
                  </div>
                  <div class="col-6">
                    <input
                      type="datetime-local"
                      class="form-control"
                      v-model="searchForm.createdEndDate"
                      placeholder="結束日期"
                    >
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label">更新時間</label>
                <div class="row g-2">
                  <div class="col-6">
                    <input
                      type="datetime-local"
                      class="form-control"
                      v-model="searchForm.updatedStartDate"
                      placeholder="開始日期"
                    >
                  </div>
                  <div class="col-6">
                    <input
                      type="datetime-local"
                      class="form-control"
                      v-model="searchForm.updatedEndDate"
                      placeholder="結束日期"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按鈕 -->
          <div class="col-12">
            <hr class="my-4">
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-primary" @click="handleSearch" :disabled="searching">
                <span v-if="searching" class="spinner-border spinner-border-sm me-2" role="status"></span>
                <i v-else class="bi bi-search me-2"></i>
                {{ searching ? '搜索中...' : '搜索' }}
              </button>
              <button type="button" class="btn btn-outline-secondary" @click="handleReset">
                <i class="bi bi-arrow-clockwise me-2"></i>
                重置
              </button>
              <button type="button" class="btn btn-outline-info" @click="saveSearchTemplate">
                <i class="bi bi-collection me-2"></i>
                保存為模板
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- 搜索結果統計 -->
    <div v-if="hasSearched" class="search-stats">
      <div class="alert alert-info" role="alert">
        <i class="bi bi-info-circle me-2"></i>
        找到 {{ totalResults }} 個結果 (耗時 {{ searchTime }}ms)
      </div>
    </div>

    <!-- 搜索結果 -->
    <div v-if="hasSearched" class="search-results">
        <!-- 標籤頁切換 -->
      <ul class="nav nav-tabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'all' }"
            @click="handleTabChange('all')"
          >
            全部
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'resources' }"
            @click="handleTabChange('resources')"
          >
            資源 ({{ searchResults.resources.length }})
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'users' }"
            @click="handleTabChange('users')"
          >
            用戶 ({{ searchResults.users.length }})
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'tags' }"
            @click="handleTabChange('tags')"
          >
            標籤 ({{ searchResults.tags.length }})
          </button>
        </li>
      </ul>
      
      <div class="tab-content">
        <!-- 全部結果 -->
        <div class="tab-pane fade" :class="{ 'show active': activeTab === 'all' }">
          <div class="results-summary">
            <div class="row g-3">
              <div class="col-md-4">
                <div class="card text-center">
                  <div class="card-body">
                    <i class="bi bi-server text-primary" style="font-size: 2rem;"></i>
                    <h5 class="card-title mt-2">{{ searchResults.resources.length }}</h5>
                    <p class="card-text text-muted">資源</p>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card text-center">
                  <div class="card-body">
                    <i class="bi bi-people text-success" style="font-size: 2rem;"></i>
                    <h5 class="card-title mt-2">{{ searchResults.users.length }}</h5>
                    <p class="card-text text-muted">用戶</p>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card text-center">
                  <div class="card-body">
                    <i class="bi bi-tags text-warning" style="font-size: 2rem;"></i>
                    <h5 class="card-title mt-2">{{ searchResults.tags.length }}</h5>
                    <p class="card-text text-muted">標籤</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 混合結果列表 -->
          <div class="mixed-results mt-4">
            <div
              v-for="item in allResults"
              :key="`${item.type}-${item.id}`"
              class="result-item"
              @click="goToDetail(item)"
            >
              <div class="item-type">
                <span :class="getItemTypeClass(item.type)">
                  {{ getItemTypeLabel(item.type) }}
                </span>
              </div>
              <div class="item-icon">
                <i :class="getItemIconClass(item)" class="text-primary"></i>
              </div>
              <div class="item-content">
                <div class="item-title" v-html="highlightText(item.name, searchForm.keyword)"></div>
                <div class="item-description">{{ item.description }}</div>
                <div class="item-meta">
                  <span class="meta-item">創建：{{ formatDate(item.createdAt) }}</span>
                  <span class="meta-item">更新：{{ formatDate(item.updatedAt) }}</span>
                </div>
              </div>
              <div class="item-actions">
                <button type="button" class="btn btn-sm btn-primary">查看詳情</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 資源結果 -->
        <div class="tab-pane fade" :class="{ 'show active': activeTab === 'resources' }">
          <ResourceResults
            :results="searchResults.resources"
            :keyword="searchForm.keyword"
            @view-detail="goToResourceDetail"
          />
        </div>

        <!-- 用戶結果 -->
        <div class="tab-pane fade" :class="{ 'show active': activeTab === 'users' }">
          <UserResults
            :results="searchResults.users"
            :keyword="searchForm.keyword"
            @view-detail="goToUserDetail"
          />
        </div>

        <!-- 標籤結果 -->
        <div class="tab-pane fade" :class="{ 'show active': activeTab === 'tags' }">
          <TagResults
            :results="searchResults.tags"
            :keyword="searchForm.keyword"
            @filter-by-tag="filterByTag"
          />
        </div>
      </div>
    </div>

    <!-- 無搜索結果 -->
    <div v-if="hasSearched && totalResults === 0" class="no-results text-center py-5">
      <i class="bi bi-search text-muted" style="font-size: 4rem;"></i>
      <h4 class="text-muted mt-3">沒有找到相關結果</h4>
      <p class="text-muted">請嘗試修改搜索条件或關鍵字</p>
      <button type="button" class="btn btn-primary" @click="handleReset">
        重新搜索
      </button>
    </div>

    <!-- 搜索模板對話框 -->
    <div class="modal fade" :class="{ show: templateDialogVisible }" :style="{ display: templateDialogVisible ? 'block' : 'none' }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">保存搜索模板</h5>
            <button type="button" class="btn-close" @click="templateDialogVisible = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">模板名稱 <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control"
                v-model="templateForm.name"
                placeholder="輸入模板名稱"
              />
            </div>
            <div class="mb-3">
              <label class="form-label">描述</label>
              <textarea
                class="form-control"
                v-model="templateForm.description"
                placeholder="輸入模板描述（可選）"
                rows="3"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="templateDialogVisible = false">
              取消
            </button>
            <button type="button" class="btn btn-primary" @click="confirmSaveTemplate">
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="templateDialogVisible" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showAlert } from '@/utils/bootstrap-alerts'
import { format } from 'date-fns'
import ResourceResults from './components/ResourceResults.vue'
import UserResults from './components/UserResults.vue'
import TagResults from './components/TagResults.vue'

// 路由
const route = useRoute()
const router = useRouter()

// 響應式數據
const searching = ref(false)
const hasSearched = ref(false)
const searchTime = ref(0)
const activeTab = ref('all')
const templateDialogVisible = ref(false)
const selectedDepartment = ref('')

// 搜索表單
const searchForm = reactive({
  keyword: '',
  scope: ['resources', 'users', 'tags'],
  sortBy: 'relevance',
  resourceType: [],
  ipAddress: '',
  userRole: [],
  department: [],
  userStatus: [],
  tagCategory: [],
  minUsageCount: undefined,
  maxUsageCount: undefined,
  createdStartDate: '',
  createdEndDate: '',
  updatedStartDate: '',
  updatedEndDate: ''
})

// 模板表單
const templateForm = reactive({
  name: '',
  description: ''
})

// 部門列表
const departments = ref([
  'IT部門',
  '開發部',
  '測試部',
  '運維部',
  '產品部',
  '設計部',
  '市場部',
  '銷售部',
  '人力資源部',
  '財務部',
  '管理部'
])

// 搜索結果
const searchResults = ref({
  resources: [] as any[],
  users: [] as any[],
  tags: [] as any[]
})

// 計算屬性
const totalResults = computed(() => {
  return searchResults.value.resources.length +
         searchResults.value.users.length +
         searchResults.value.tags.length
})

const allResults = computed(() => {
  const results: any[] = []
  
  // 添加資源
  searchResults.value.resources.forEach(item => {
    results.push({
      ...item,
      type: 'resource',
      description: `${item.resourceType} · ${item.ipAddress}`
    })
  })
  
  // 添加用戶
  searchResults.value.users.forEach(item => {
    results.push({
      ...item,
      type: 'user',
      description: `${item.department} · ${item.role === 'Admin' ? '管理員' : '用戶'}`
    })
  })
  
  // 添加標籤
  searchResults.value.tags.forEach(item => {
    results.push({
      ...item,
      type: 'tag',
      description: `${getCategoryLabel(item.category)} · 使用 ${item.usageCount} 次`
    })
  })
  
  // 根據相關性排序（這裡簡化處理）
  return results.sort((a, b) => {
    if (searchForm.sortBy === 'createdAt') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else if (searchForm.sortBy === 'updatedAt') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    } else if (searchForm.sortBy === 'name') {
      return a.name.localeCompare(b.name)
    }
    return 0 // 默認相關性排序
  })
})

// 監聽路由查詢參數
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.q) {
      searchForm.keyword = newQuery.q as string
      handleSearch()
    }
  },
  { immediate: true }
)

// 獲取項目類型類別
const getItemTypeClass = (type: string) => {
  const classMap: Record<string, string> = {
    resource: 'badge bg-primary',
    user: 'badge bg-success',
    tag: 'badge bg-warning'
  }
  return classMap[type] || 'badge bg-secondary'
}

// 獲取項目類型標籤
const getItemTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    resource: '資源',
    user: '用戶',
    tag: '標籤'
  }
  return labelMap[type] || type
}

// 獲取項目圖標類別
const getItemIconClass = (item: any) => {
  switch (item.type) {
    case 'resource':
      return getResourceTypeIconClass(item.resourceType)
    case 'user':
      return 'bi bi-person-fill'
    case 'tag':
      return 'bi bi-tags'
    default:
      return 'bi bi-file-text'
  }
}

// 獲取資源類型圖標類別
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

// 高亮文字
const highlightText = (text: string, query: string) => {
  if (!query) return text
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// 格式化日期
const formatDate = (date: Date) => {
  return format(date, 'yyyy-MM-dd')
}

// 執行搜索
const handleSearch = async () => {
  if (!searchForm.keyword.trim() && !hasAdvancedFilters()) {
    showAlert('請輸入搜索關鍵字或設置篩選條件', 'warning')
    return
  }

  searching.value = true
  const startTime = Date.now()

  try {
    // 模擬API搜索
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模擬搜索結果
    searchResults.value = generateMockResults()
    
    hasSearched.value = true
    searchTime.value = Date.now() - startTime
    
    showAlert(`搜索完成，找到 ${totalResults.value} 個結果`, 'success')
  } catch (error) {
    console.error('Search failed:', error)
    showAlert('搜索失敗', 'error')
  } finally {
    searching.value = false
  }
}

// 檢查是否有高級篩選條件
const hasAdvancedFilters = () => {
  return searchForm.resourceType.length > 0 ||
         searchForm.ipAddress ||
         searchForm.userRole.length > 0 ||
         searchForm.department.length > 0 ||
         searchForm.userStatus.length > 0 ||
         searchForm.tagCategory.length > 0 ||
         searchForm.minUsageCount !== undefined ||
         searchForm.maxUsageCount !== undefined ||
         searchForm.createdStartDate ||
         searchForm.createdEndDate ||
         searchForm.updatedStartDate ||
         searchForm.updatedEndDate
}

// 生成模擬搜索結果
const generateMockResults = () => {
  const mockResources = [
    {
      id: 1,
      name: 'Web Server 01',
      resourceType: 'Server',
      ipAddress: '192.168.1.100',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 2,
      name: 'MySQL Database',
      resourceType: 'Database',
      ipAddress: '192.168.1.101',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-16')
    }
  ]

  const mockUsers = [
    {
      id: 1,
      name: '系統管理員',
      displayName: '系統管理員',
      loginAccount: 'admin',
      department: 'IT部門',
      role: 'Admin',
      status: 'active',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-10')
    }
  ]

  const mockTags = [
    {
      id: 1,
      name: '生產環境',
      category: 'Environment',
      usageCount: 25,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-12')
    }
  ]

  // 根據搜索條件篩選結果
  return {
    resources: searchForm.scope.includes('resources') ? mockResources : [],
    users: searchForm.scope.includes('users') ? mockUsers : [],
    tags: searchForm.scope.includes('tags') ? mockTags : []
  }
}

// 添加部門
const addDepartment = () => {
  if (selectedDepartment.value && !searchForm.department.includes(selectedDepartment.value)) {
    searchForm.department.push(selectedDepartment.value)
    selectedDepartment.value = ''
  }
}

// 移除部門
const removeDepartment = (dept: string) => {
  const index = searchForm.department.indexOf(dept)
  if (index > -1) {
    searchForm.department.splice(index, 1)
  }
}

// 重置搜索
const handleReset = () => {
  // 手動重置一些字段
  searchForm.keyword = ''
  searchForm.scope = ['resources', 'users', 'tags']
  searchForm.sortBy = 'relevance'
  searchForm.resourceType = []
  searchForm.ipAddress = ''
  searchForm.userRole = []
  searchForm.department = []
  searchForm.userStatus = []
  searchForm.tagCategory = []
  searchForm.minUsageCount = undefined
  searchForm.maxUsageCount = undefined
  searchForm.createdStartDate = ''
  searchForm.createdEndDate = ''
  searchForm.updatedStartDate = ''
  searchForm.updatedEndDate = ''
  
  selectedDepartment.value = ''
  
  hasSearched.value = false
  searchResults.value = {
    resources: [],
    users: [],
    tags: []
  }
}

// 標籤頁切換
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
}

// 前往詳情頁面
const goToDetail = (item: any) => {
  switch (item.type) {
    case 'resource':
      goToResourceDetail(item.id)
      break
    case 'user':
      goToUserDetail(item.id)
      break
    case 'tag':
      filterByTag(item)
      break
  }
}

const goToResourceDetail = (id: number) => {
  router.push(`/resources/${id}`)
}

const goToUserDetail = (id: number) => {
  router.push(`/users/${id}`)
}

const filterByTag = (tag: any) => {
  router.push({
    path: '/resources',
    query: { tag: tag.name }
  })
}

// 保存搜索模板
const saveSearchTemplate = () => {
  templateForm.name = `搜索模板 ${new Date().toLocaleDateString()}`
  templateForm.description = `關鍵字：${searchForm.keyword}`
  templateDialogVisible.value = true
}

const confirmSaveTemplate = () => {
  if (!templateForm.name.trim()) {
    showAlert('請輸入模板名稱', 'warning')
    return
  }
  
  // 這裡可以保存到本地存儲或發送到服務器
  showAlert('搜索模板已保存', 'success')
  templateDialogVisible.value = false
}

// 組件掛載
onMounted(() => {
  // 如果路由中有查詢參數，自動執行搜索
  if (route.query.q) {
    searchForm.keyword = route.query.q as string
    handleSearch()
  }
})
</script>

<style lang="scss" scoped>
.search-page {
  .page-header {
    margin-bottom: 24px;
    
    h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--bs-gray-900);
    }
    
    p {
      margin: 0;
      color: var(--bs-gray-600);
    }
  }
  
  .search-form-card {
    margin-bottom: 24px;
    
    .search-form {
      .filter-section {
        margin: 16px 0;
        
        h6 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--bs-gray-900);
        }
      }
      
      .form-check-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        
        .form-check {
          margin-bottom: 0;
        }
      }
      
      .selected-items {
        min-height: 30px;
        
        .badge {
          position: relative;
          padding-right: 24px;
          
          .btn-close {
            position: absolute;
            top: 50%;
            right: 4px;
            transform: translateY(-50%);
            font-size: 10px;
            width: 12px;
            height: 12px;
            background: none;
            border: none;
            opacity: 0.8;
            
            &:hover {
              opacity: 1;
            }
          }
        }
      }
    }
  }
  
  .search-stats {
    margin-bottom: 16px;
  }
  
  .search-results {
    .results-summary {
      margin-bottom: 24px;
      padding: 20px;
      background: var(--bs-gray-50);
      border-radius: 8px;
    }
    
    .mixed-results {
      .result-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        border: 1px solid var(--bs-border-color);
        border-radius: 8px;
        margin-bottom: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: var(--bs-primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .item-type {
          flex-shrink: 0;
        }
        
        .item-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bs-gray-50);
          border-radius: 8px;
          font-size: 20px;
        }
        
        .item-content {
          flex: 1;
          
          .item-title {
            font-size: 16px;
            font-weight: 500;
            color: var(--bs-gray-900);
            margin-bottom: 4px;
            
            :deep(mark) {
              background: #fff3cd;
              color: #856404;
              padding: 1px 2px;
              border-radius: 2px;
            }
          }
          
          .item-description {
            font-size: 14px;
            color: var(--bs-gray-600);
            margin-bottom: 8px;
          }
          
          .item-meta {
            display: flex;
            gap: 16px;
            
            .meta-item {
              font-size: 12px;
              color: var(--bs-gray-500);
            }
          }
        }
        
        .item-actions {
          flex-shrink: 0;
        }
      }
    }
  }
}

// 響應式設計
@media (max-width: 768px) {
  .search-page {
    .search-form {
      .form-check-container {
        flex-direction: column;
        gap: 5px;
      }
    }
    
    .results-summary {
      .row {
        text-align: center;
      }
    }
    
    .mixed-results {
      .result-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        
        .item-icon {
          align-self: center;
        }
        
        .item-content {
          width: 100%;
          
          .item-meta {
            flex-direction: column;
            gap: 4px;
          }
        }
        
        .item-actions {
          align-self: center;
        }
      }
    }
  }
}

// 暗黑模式支援
@media (prefers-color-scheme: dark) {
  .search-page {
    .page-header {
      h2 {
        color: var(--bs-gray-100);
      }
      
      p {
        color: var(--bs-gray-300);
      }
    }
    
    .search-form {
      .filter-section {
        h6 {
          color: var(--bs-gray-100);
        }
      }
    }
    
    .results-summary {
      background: var(--bs-gray-800);
    }
    
    .mixed-results {
      .result-item {
        border-color: var(--bs-gray-700);
        
        &:hover {
          border-color: var(--bs-primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        .item-icon {
          background: var(--bs-gray-800);
        }
        
        .item-content {
          .item-title {
            color: var(--bs-gray-100);
            
            :deep(mark) {
              background: #2d2419;
              color: #d69e2e;
            }
          }
          
          .item-description {
            color: var(--bs-gray-300);
          }
          
          .item-meta {
            .meta-item {
              color: var(--bs-gray-400);
            }
          }
        }
      }
    }
  }
}
</style>