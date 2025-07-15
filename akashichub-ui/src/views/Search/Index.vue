<template>
  <div class="search-page">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h2>高級搜索</h2>
      <p>使用高級搜索功能快速找到所需的資源、用戶和標籤</p>
    </div>

    <!-- 搜索表單 -->
    <el-card class="search-form-card">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        label-width="120px"
        class="search-form"
      >
        <el-row :gutter="20">
          <!-- 關鍵字搜索 -->
          <el-col :span="24">
            <el-form-item label="關鍵字" prop="keyword">
              <el-input
                v-model="searchForm.keyword"
                placeholder="輸入搜索關鍵字..."
                prefix-icon="Search"
                clearable
                @keyup.enter="handleSearch"
              >
                <template #append>
                  <el-button type="primary" @click="handleSearch">
                    搜索
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>

          <!-- 搜索範圍 -->
          <el-col :span="12">
            <el-form-item label="搜索範圍" prop="scope">
              <el-select
                v-model="searchForm.scope"
                placeholder="選擇搜索範圍"
                style="width: 100%"
                multiple
                collapse-tags
                collapse-tags-tooltip
              >
                <el-option label="資源" value="resources" />
                <el-option label="用戶" value="users" />
                <el-option label="標籤" value="tags" />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- 排序方式 -->
          <el-col :span="12">
            <el-form-item label="排序方式" prop="sortBy">
              <el-select v-model="searchForm.sortBy" placeholder="選擇排序方式" style="width: 100%">
                <el-option label="相關性" value="relevance" />
                <el-option label="創建時間" value="createdAt" />
                <el-option label="更新時間" value="updatedAt" />
                <el-option label="名稱" value="name" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 高級篩選 -->
        <el-divider content-position="left">高級篩選</el-divider>

        <!-- 資源篩選 -->
        <div v-if="searchForm.scope.includes('resources')" class="filter-section">
          <h4>資源篩選</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="資源類型" prop="resourceType">
                <el-select
                  v-model="searchForm.resourceType"
                  placeholder="選擇資源類型"
                  style="width: 100%"
                  multiple
                  clearable
                >
                  <el-option label="伺服器" value="Server" />
                  <el-option label="資料庫" value="Database" />
                  <el-option label="網站" value="Website" />
                  <el-option label="儲存" value="Storage" />
                  <el-option label="快取" value="Cache" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="IP地址" prop="ipAddress">
                <el-input
                  v-model="searchForm.ipAddress"
                  placeholder="輸入IP地址或範圍"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 用戶篩選 -->
        <div v-if="searchForm.scope.includes('users')" class="filter-section">
          <h4>用戶篩選</h4>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="用戶角色" prop="userRole">
                <el-select
                  v-model="searchForm.userRole"
                  placeholder="選擇用戶角色"
                  style="width: 100%"
                  multiple
                  clearable
                >
                  <el-option label="管理員" value="Admin" />
                  <el-option label="用戶" value="User" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="部門" prop="department">
                <el-select
                  v-model="searchForm.department"
                  placeholder="選擇部門"
                  style="width: 100%"
                  multiple
                  clearable
                  filterable
                >
                  <el-option
                    v-for="dept in departments"
                    :key="dept"
                    :label="dept"
                    :value="dept"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="帳號狀態" prop="userStatus">
                <el-select
                  v-model="searchForm.userStatus"
                  placeholder="選擇帳號狀態"
                  style="width: 100%"
                  multiple
                  clearable
                >
                  <el-option label="啟用" value="active" />
                  <el-option label="停用" value="inactive" />
                  <el-option label="鎖定" value="locked" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 標籤篩選 -->
        <div v-if="searchForm.scope.includes('tags')" class="filter-section">
          <h4>標籤篩選</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="標籤分類" prop="tagCategory">
                <el-select
                  v-model="searchForm.tagCategory"
                  placeholder="選擇標籤分類"
                  style="width: 100%"
                  multiple
                  clearable
                >
                  <el-option label="環境" value="Environment" />
                  <el-option label="優先級" value="Priority" />
                  <el-option label="部門" value="Department" />
                  <el-option label="項目" value="Project" />
                  <el-option label="技術" value="Technology" />
                  <el-option label="其他" value="Other" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="使用次數" prop="usageCount">
                <el-input-number
                  v-model="searchForm.minUsageCount"
                  :min="0"
                  controls-position="right"
                  placeholder="最小使用次數"
                  style="width: 48%"
                />
                <span style="margin: 0 8px;">-</span>
                <el-input-number
                  v-model="searchForm.maxUsageCount"
                  :min="searchForm.minUsageCount || 0"
                  controls-position="right"
                  placeholder="最大使用次數"
                  style="width: 48%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 時間範圍 -->
        <el-divider content-position="left">時間範圍</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="創建時間" prop="createdDateRange">
              <el-date-picker
                v-model="searchForm.createdDateRange"
                type="datetimerange"
                start-placeholder="開始日期"
                end-placeholder="結束日期"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="更新時間" prop="updatedDateRange">
              <el-date-picker
                v-model="searchForm.updatedDateRange"
                type="datetimerange"
                start-placeholder="開始日期"
                end-placeholder="結束日期"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 操作按鈕 -->
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="searching">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
          <el-button @click="saveSearchTemplate">
            <el-icon><Collection /></el-icon>
            保存為模板
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 搜索結果統計 -->
    <div v-if="hasSearched" class="search-stats">
      <el-alert
        :title="`找到 ${totalResults} 個結果 (耗時 ${searchTime}ms)`"
        type="info"
        :closable="false"
        show-icon
      />
    </div>

    <!-- 搜索結果 -->
    <div v-if="hasSearched" class="search-results">
      <!-- 標籤頁切換 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 全部結果 -->
        <el-tab-pane label="全部" name="all">
          <div class="results-summary">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-statistic
                  title="資源"
                  :value="searchResults.resources.length"
                  suffix="個"
                >
                  <template #prefix>
                    <el-icon style="vertical-align: -0.125em">
                      <Server />
                    </el-icon>
                  </template>
                </el-statistic>
              </el-col>
              <el-col :span="8">
                <el-statistic
                  title="用戶"
                  :value="searchResults.users.length"
                  suffix="個"
                >
                  <template #prefix>
                    <el-icon style="vertical-align: -0.125em">
                      <User />
                    </el-icon>
                  </template>
                </el-statistic>
              </el-col>
              <el-col :span="8">
                <el-statistic
                  title="標籤"
                  :value="searchResults.tags.length"
                  suffix="個"
                >
                  <template #prefix>
                    <el-icon style="vertical-align: -0.125em">
                      <CollectionTag />
                    </el-icon>
                  </template>
                </el-statistic>
              </el-col>
            </el-row>
          </div>
          
          <!-- 混合結果列表 -->
          <div class="mixed-results">
            <div
              v-for="item in allResults"
              :key="`${item.type}-${item.id}`"
              class="result-item"
              @click="goToDetail(item)"
            >
              <div class="item-type">
                <el-tag :type="getItemTypeColor(item.type)">
                  {{ getItemTypeLabel(item.type) }}
                </el-tag>
              </div>
              <div class="item-icon">
                <el-icon>
                  <component :is="getItemIcon(item)" />
                </el-icon>
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
                <el-button size="small" type="primary" link>查看詳情</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 資源結果 -->
        <el-tab-pane
          :label="`資源 (${searchResults.resources.length})`"
          name="resources"
        >
          <ResourceResults
            :results="searchResults.resources"
            :keyword="searchForm.keyword"
            @view-detail="goToResourceDetail"
          />
        </el-tab-pane>

        <!-- 用戶結果 -->
        <el-tab-pane
          :label="`用戶 (${searchResults.users.length})`"
          name="users"
        >
          <UserResults
            :results="searchResults.users"
            :keyword="searchForm.keyword"
            @view-detail="goToUserDetail"
          />
        </el-tab-pane>

        <!-- 標籤結果 -->
        <el-tab-pane
          :label="`標籤 (${searchResults.tags.length})`"
          name="tags"
        >
          <TagResults
            :results="searchResults.tags"
            :keyword="searchForm.keyword"
            @filter-by-tag="filterByTag"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 無搜索結果 -->
    <div v-if="hasSearched && totalResults === 0" class="no-results">
      <el-empty description="沒有找到相關結果">
        <el-button type="primary" @click="handleReset">
          重新搜索
        </el-button>
      </el-empty>
    </div>

    <!-- 搜索模板對話框 -->
    <el-dialog
      v-model="templateDialogVisible"
      title="保存搜索模板"
      width="400px"
    >
      <el-form :model="templateForm" label-width="100px">
        <el-form-item label="模板名稱" required>
          <el-input
            v-model="templateForm.name"
            placeholder="輸入模板名稱"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="templateForm.description"
            type="textarea"
            placeholder="輸入模板描述（可選）"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="templateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSaveTemplate">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Search,
  RefreshLeft,
  Collection,
  Server,
  User,
  CollectionTag
} from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { format } from 'date-fns'
import ResourceResults from './components/ResourceResults.vue'
import UserResults from './components/UserResults.vue'
import TagResults from './components/TagResults.vue'

// 路由
const route = useRoute()
const router = useRouter()

// 響應式數據
const searchFormRef = ref<FormInstance>()
const searching = ref(false)
const hasSearched = ref(false)
const searchTime = ref(0)
const activeTab = ref('all')
const templateDialogVisible = ref(false)

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
  createdDateRange: null,
  updatedDateRange: null
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

// 獲取項目類型顏色
const getItemTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    resource: 'primary',
    user: 'success',
    tag: 'warning'
  }
  return colorMap[type] || ''
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

// 獲取項目圖標
const getItemIcon = (item: any) => {
  switch (item.type) {
    case 'resource':
      return getResourceTypeIcon(item.resourceType)
    case 'user':
      return 'UserFilled'
    case 'tag':
      return 'CollectionTag'
    default:
      return 'Document'
  }
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
    ElMessage.warning('請輸入搜索關鍵字或設置篩選條件')
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
    
    ElMessage.success(`搜索完成，找到 ${totalResults.value} 個結果`)
  } catch (error) {
    console.error('Search failed:', error)
    ElMessage.error('搜索失敗')
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
         searchForm.createdDateRange ||
         searchForm.updatedDateRange
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

// 重置搜索
const handleReset = () => {
  if (searchFormRef.value) {
    searchFormRef.value.resetFields()
  }
  
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
  searchForm.createdDateRange = null
  searchForm.updatedDateRange = null
  
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
    ElMessage.warning('請輸入模板名稱')
    return
  }
  
  // 這裡可以保存到本地存儲或發送到服務器
  ElMessage.success('搜索模板已保存')
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
      color: var(--el-text-color-primary);
    }
    
    p {
      margin: 0;
      color: var(--el-text-color-regular);
    }
  }
  
  .search-form-card {
    margin-bottom: 24px;
    
    .search-form {
      .filter-section {
        margin: 16px 0;
        
        h4 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
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
      background: var(--el-bg-color-page);
      border-radius: 8px;
    }
    
    .mixed-results {
      .result-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 8px;
        margin-bottom: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: var(--el-color-primary);
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
          background: var(--el-bg-color-page);
          border-radius: 8px;
          
          .el-icon {
            font-size: 20px;
            color: var(--el-color-primary);
          }
        }
        
        .item-content {
          flex: 1;
          
          .item-title {
            font-size: 16px;
            font-weight: 500;
            color: var(--el-text-color-primary);
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
            color: var(--el-text-color-regular);
            margin-bottom: 8px;
          }
          
          .item-meta {
            display: flex;
            gap: 16px;
            
            .meta-item {
              font-size: 12px;
              color: var(--el-text-color-placeholder);
            }
          }
        }
        
        .item-actions {
          flex-shrink: 0;
        }
      }
    }
  }
  
  .no-results {
    text-align: center;
    padding: 60px 20px;
  }
}

// 響應式設計
@media (max-width: 768px) {
  .search-page {
    .search-form {
      .el-col {
        margin-bottom: 16px;
      }
    }
    
    .results-summary {
      :deep(.el-col) {
        margin-bottom: 16px;
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

// 暗黑模式
.dark {
  .search-page {
    .results-summary {
      background: var(--el-bg-color-page);
    }
    
    .mixed-results {
      .result-item {
        border-color: var(--el-border-color-lighter);
        
        &:hover {
          border-color: var(--el-color-primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        .item-icon {
          background: var(--el-bg-color-page);
        }
        
        .item-content {
          .item-title {
            :deep(mark) {
              background: #2d2419;
              color: #d69e2e;
            }
          }
        }
      }
    }
  }
}
</style>