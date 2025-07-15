<template>
  <div class="global-search">
    <el-popover
      v-model:visible="searchVisible"
      placement="bottom-start"
      :width="480"
      trigger="click"
      popper-class="search-popover"
    >
      <template #reference>
        <div class="search-trigger" @click="handleTriggerClick">
          <el-input
            v-model="searchQuery"
            placeholder="搜索資源、用戶、標籤..."
            :prefix-icon="Search"
            class="search-input"
            @keyup.enter="handleSearch"
            @input="handleInput"
            @focus="searchVisible = true"
          />
          <div class="search-shortcut">
            <span>Ctrl + K</span>
          </div>
        </div>
      </template>

      <div class="search-content">
        <!-- 搜索結果 -->
        <div v-if="searchQuery && !searching" class="search-results">
          <!-- 快速操作 -->
          <div v-if="searchQuery" class="quick-actions">
            <div class="section-title">快速操作</div>
            <div
              class="action-item"
              @click="goToAdvancedSearch"
            >
              <el-icon><Search /></el-icon>
              <span>在 "{{ searchQuery }}" 中進行高級搜索</span>
            </div>
            <div
              v-if="authStore.isAdmin"
              class="action-item"
              @click="createResourceWithName"
            >
              <el-icon><Plus /></el-icon>
              <span>創建名為 "{{ searchQuery }}" 的資源</span>
            </div>
          </div>

          <!-- 資源結果 -->
          <div v-if="results.resources.length > 0" class="result-section">
            <div class="section-title">
              <el-icon><Server /></el-icon>
              資源 ({{ results.resources.length }})
            </div>
            <div
              v-for="item in results.resources.slice(0, 5)"
              :key="`resource-${item.id}`"
              class="result-item"
              @click="goToResource(item.id)"
            >
              <div class="item-icon">
                <el-icon :color="getResourceTypeColor(item.resourceType)">
                  <component :is="getResourceTypeIcon(item.resourceType)" />
                </el-icon>
              </div>
              <div class="item-content">
                <div class="item-name" v-html="highlightText(item.name, searchQuery)"></div>
                <div class="item-description">{{ item.resourceType }} · {{ item.ipAddress }}</div>
              </div>
              <div class="item-tags">
                <el-tag
                  v-for="tag in item.tags?.slice(0, 2)"
                  :key="tag.id"
                  size="small"
                  type="info"
                >
                  {{ tag.name }}
                </el-tag>
              </div>
            </div>
            <div v-if="results.resources.length > 5" class="show-more" @click="showAllResources">
              查看全部 {{ results.resources.length }} 個資源結果
            </div>
          </div>

          <!-- 用戶結果 -->
          <div v-if="results.users.length > 0" class="result-section">
            <div class="section-title">
              <el-icon><User /></el-icon>
              用戶 ({{ results.users.length }})
            </div>
            <div
              v-for="item in results.users.slice(0, 3)"
              :key="`user-${item.id}`"
              class="result-item"
              @click="goToUser(item.id)"
            >
              <div class="item-icon">
                <el-avatar :size="32" :src="item.avatar">
                  <el-icon><UserFilled /></el-icon>
                </el-avatar>
              </div>
              <div class="item-content">
                <div class="item-name" v-html="highlightText(item.displayName, searchQuery)"></div>
                <div class="item-description">{{ item.department }} · {{ item.loginAccount }}</div>
              </div>
              <div class="item-status">
                <el-tag :type="item.role === 'Admin' ? 'danger' : 'primary'" size="small">
                  {{ item.role === 'Admin' ? '管理員' : '用戶' }}
                </el-tag>
              </div>
            </div>
            <div v-if="results.users.length > 3" class="show-more" @click="showAllUsers">
              查看全部 {{ results.users.length }} 個用戶結果
            </div>
          </div>

          <!-- 標籤結果 -->
          <div v-if="results.tags.length > 0" class="result-section">
            <div class="section-title">
              <el-icon><CollectionTag /></el-icon>
              標籤 ({{ results.tags.length }})
            </div>
            <div
              v-for="item in results.tags.slice(0, 6)"
              :key="`tag-${item.id}`"
              class="result-item tag-item"
              @click="filterByTag(item)"
            >
              <div class="item-content">
                <el-tag
                  :type="getCategoryTagType(item.category)"
                  :color="item.color"
                  effect="light"
                >
                  <span v-html="highlightText(item.name, searchQuery)"></span>
                </el-tag>
                <div class="item-description">{{ getCategoryLabel(item.category) }} · {{ item.usageCount }} 次使用</div>
              </div>
            </div>
            <div v-if="results.tags.length > 6" class="show-more" @click="showAllTags">
              查看全部 {{ results.tags.length }} 個標籤結果
            </div>
          </div>

          <!-- 無結果 -->
          <div v-if="!hasResults" class="no-results">
            <el-empty
              description="沒有找到相關結果"
              :image-size="60"
            >
              <el-button type="primary" @click="goToAdvancedSearch">
                嘗試高級搜索
              </el-button>
            </el-empty>
          </div>
        </div>

        <!-- 搜索建議 -->
        <div v-else-if="!searchQuery" class="search-suggestions">
          <div class="section-title">搜索建議</div>
          
          <div class="suggestion-group">
            <div class="group-title">最近搜索</div>
            <div
              v-for="item in recentSearches"
              :key="item"
              class="suggestion-item"
              @click="setSearchQuery(item)"
            >
              <el-icon><Clock /></el-icon>
              <span>{{ item }}</span>
            </div>
          </div>

          <div class="suggestion-group">
            <div class="group-title">熱門搜索</div>
            <div
              v-for="item in popularSearches"
              :key="item"
              class="suggestion-item"
              @click="setSearchQuery(item)"
            >
              <el-icon><TrendCharts /></el-icon>
              <span>{{ item }}</span>
            </div>
          </div>

          <div class="suggestion-group">
            <div class="group-title">快捷入口</div>
            <div class="suggestion-item" @click="goToPage('/resources')">
              <el-icon><Server /></el-icon>
              <span>所有資源</span>
            </div>
            <div class="suggestion-item" @click="goToPage('/users')">
              <el-icon><User /></el-icon>
              <span>用戶管理</span>
            </div>
            <div class="suggestion-item" @click="goToPage('/tags')">
              <el-icon><CollectionTag /></el-icon>
              <span>標籤管理</span>
            </div>
          </div>
        </div>

        <!-- 載入中 -->
        <div v-else class="search-loading">
          <el-skeleton :rows="3" animated />
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Search,
  Plus,
  Server,
  User,
  UserFilled,
  CollectionTag,
  Clock,
  TrendCharts
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

// 狀態管理
const authStore = useAuthStore()

// 路由
const router = useRouter()

// 響應式數據
const searchVisible = ref(false)
const searchQuery = ref('')
const searching = ref(false)
const recentSearches = ref(['Web Server', 'MySQL', '生產環境', 'admin'])
const popularSearches = ref(['伺服器', '資料庫', '測試環境', '網站'])

// 搜索結果
const results = ref({
  resources: [] as any[],
  users: [] as any[],
  tags: [] as any[]
})

// 模擬數據
const mockData = ref({
  resources: [
    {
      id: 1,
      name: 'Web Server 01',
      resourceType: 'Server',
      ipAddress: '192.168.1.100',
      tags: [
        { id: 1, name: '生產環境', category: 'Environment' },
        { id: 2, name: 'Web服務', category: 'Technology' }
      ]
    },
    {
      id: 2,
      name: 'MySQL Database',
      resourceType: 'Database',
      ipAddress: '192.168.1.101',
      tags: [
        { id: 1, name: '生產環境', category: 'Environment' },
        { id: 3, name: '數據庫', category: 'Technology' }
      ]
    },
    {
      id: 3,
      name: 'Redis Cache Server',
      resourceType: 'Cache',
      ipAddress: '192.168.1.102',
      tags: [
        { id: 4, name: '緩存', category: 'Technology' }
      ]
    }
  ],
  users: [
    {
      id: 1,
      displayName: '系統管理員',
      loginAccount: 'admin',
      department: 'IT部門',
      role: 'Admin',
      avatar: ''
    },
    {
      id: 2,
      displayName: '張三',
      loginAccount: 'zhangsan',
      department: '開發部',
      role: 'User',
      avatar: ''
    }
  ],
  tags: [
    {
      id: 1,
      name: '生產環境',
      category: 'Environment',
      color: '#f56c6c',
      usageCount: 25
    },
    {
      id: 2,
      name: 'Web服務',
      category: 'Technology',
      color: '#409eff',
      usageCount: 15
    },
    {
      id: 3,
      name: '數據庫',
      category: 'Technology',
      color: '#67c23a',
      usageCount: 12
    }
  ]
})

// 計算屬性
const hasResults = computed(() => {
  return results.value.resources.length > 0 ||
         results.value.users.length > 0 ||
         results.value.tags.length > 0
})

// 監聽搜索查詢變化
watch(searchQuery, (newValue) => {
  if (newValue) {
    performSearch(newValue)
  } else {
    clearResults()
  }
})

// 執行搜索
const performSearch = async (query: string) => {
  if (!query.trim()) {
    clearResults()
    return
  }

  searching.value = true
  
  try {
    // 模擬API請求延遲
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 模擬搜索邏輯
    const lowercaseQuery = query.toLowerCase()
    
    results.value = {
      resources: mockData.value.resources.filter(item =>
        item.name.toLowerCase().includes(lowercaseQuery) ||
        item.resourceType.toLowerCase().includes(lowercaseQuery) ||
        item.ipAddress.includes(query) ||
        item.tags?.some(tag => tag.name.toLowerCase().includes(lowercaseQuery))
      ),
      users: mockData.value.users.filter(item =>
        item.displayName.toLowerCase().includes(lowercaseQuery) ||
        item.loginAccount.toLowerCase().includes(lowercaseQuery) ||
        item.department.toLowerCase().includes(lowercaseQuery)
      ),
      tags: mockData.value.tags.filter(item =>
        item.name.toLowerCase().includes(lowercaseQuery)
      )
    }
    
  } catch (error) {
    console.error('Search failed:', error)
    ElMessage.error('搜索失敗')
  } finally {
    searching.value = false
  }
}

// 清空結果
const clearResults = () => {
  results.value = {
    resources: [],
    users: [],
    tags: []
  }
}

// 高亮文字
const highlightText = (text: string, query: string) => {
  if (!query) return text
  
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
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

// 處理輸入
const handleInput = () => {
  searchVisible.value = true
}

// 處理觸發點擊
const handleTriggerClick = () => {
  searchVisible.value = true
}

// 處理搜索
const handleSearch = () => {
  if (searchQuery.value) {
    addToRecentSearches(searchQuery.value)
    goToAdvancedSearch()
  }
}

// 設置搜索查詢
const setSearchQuery = (query: string) => {
  searchQuery.value = query
  searchVisible.value = true
}

// 添加到最近搜索
const addToRecentSearches = (query: string) => {
  if (!recentSearches.value.includes(query)) {
    recentSearches.value.unshift(query)
    if (recentSearches.value.length > 5) {
      recentSearches.value = recentSearches.value.slice(0, 5)
    }
  }
}

// 導航方法
const goToAdvancedSearch = () => {
  router.push({
    path: '/search',
    query: { q: searchQuery.value }
  })
  searchVisible.value = false
}

const goToResource = (id: number) => {
  router.push(`/resources/${id}`)
  searchVisible.value = false
}

const goToUser = (id: number) => {
  router.push(`/users/${id}`)
  searchVisible.value = false
}

const goToPage = (path: string) => {
  router.push(path)
  searchVisible.value = false
}

const filterByTag = (tag: any) => {
  router.push({
    path: '/resources',
    query: { tag: tag.name }
  })
  searchVisible.value = false
}

const createResourceWithName = () => {
  router.push({
    path: '/resources/create',
    query: { name: searchQuery.value }
  })
  searchVisible.value = false
}

const showAllResources = () => {
  router.push({
    path: '/resources',
    query: { search: searchQuery.value }
  })
  searchVisible.value = false
}

const showAllUsers = () => {
  router.push({
    path: '/users',
    query: { search: searchQuery.value }
  })
  searchVisible.value = false
}

const showAllTags = () => {
  router.push({
    path: '/tags',
    query: { search: searchQuery.value }
  })
  searchVisible.value = false
}

// 鍵盤快捷鍵
const handleKeydown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    searchVisible.value = true
  }
  
  if (event.key === 'Escape') {
    searchVisible.value = false
  }
}

// 組件掛載
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

// 組件卸載
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="scss" scoped>
.global-search {
  .search-trigger {
    position: relative;
    width: 300px;
    
    .search-input {
      :deep(.el-input__wrapper) {
        border-radius: 8px;
        transition: all 0.3s ease;
        
        &:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
    }
    
    .search-shortcut {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      
      span {
        background: var(--el-bg-color-page);
        color: var(--el-text-color-placeholder);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
        border: 1px solid var(--el-border-color);
      }
    }
  }
}

:deep(.search-popover) {
  padding: 0 !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
}
</style>

<style lang="scss">
.search-popover {
  .search-content {
    max-height: 500px;
    overflow-y: auto;
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px 8px;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      border-bottom: 1px solid var(--el-border-color-lighter);
      margin-bottom: 8px;
      
      .el-icon {
        font-size: 16px;
      }
    }
    
    .quick-actions {
      .action-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 16px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        
        &:hover {
          background: var(--el-bg-color-page);
        }
        
        .el-icon {
          font-size: 16px;
          color: var(--el-color-primary);
        }
        
        span {
          font-size: 14px;
          color: var(--el-text-color-primary);
        }
      }
    }
    
    .result-section {
      margin-bottom: 16px;
      
      .result-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        
        &:hover {
          background: var(--el-bg-color-page);
        }
        
        .item-icon {
          .el-icon {
            font-size: 18px;
          }
        }
        
        .item-content {
          flex: 1;
          
          .item-name {
            font-size: 14px;
            font-weight: 500;
            color: var(--el-text-color-primary);
            margin-bottom: 2px;
            
            :deep(mark) {
              background: #fff3cd;
              color: #856404;
              padding: 1px 2px;
              border-radius: 2px;
            }
          }
          
          .item-description {
            font-size: 12px;
            color: var(--el-text-color-placeholder);
          }
        }
        
        .item-tags {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        
        .item-status {
          .el-tag {
            font-size: 11px;
          }
        }
        
        &.tag-item {
          .item-content {
            .el-tag {
              margin-bottom: 4px;
            }
          }
        }
      }
      
      .show-more {
        padding: 8px 16px;
        text-align: center;
        color: var(--el-color-primary);
        font-size: 13px;
        cursor: pointer;
        border-top: 1px solid var(--el-border-color-lighter);
        
        &:hover {
          background: var(--el-bg-color-page);
        }
      }
    }
    
    .search-suggestions {
      .suggestion-group {
        margin-bottom: 16px;
        
        .group-title {
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          color: var(--el-text-color-regular);
        }
        
        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          
          &:hover {
            background: var(--el-bg-color-page);
          }
          
          .el-icon {
            font-size: 16px;
            color: var(--el-text-color-placeholder);
          }
          
          span {
            font-size: 14px;
            color: var(--el-text-color-primary);
          }
        }
      }
    }
    
    .no-results {
      padding: 40px 16px;
      text-align: center;
    }
    
    .search-loading {
      padding: 16px;
    }
  }
}

// 暗黑模式
.dark {
  .search-popover {
    .search-content {
      .section-title {
        color: var(--el-text-color-primary);
        border-bottom-color: var(--el-border-color-lighter);
      }
      
      .result-section {
        .result-item {
          &:hover {
            background: var(--el-bg-color-page);
          }
          
          .item-content {
            .item-name {
              :deep(mark) {
                background: #2d2419;
                color: #d69e2e;
              }
            }
          }
        }
        
        .show-more {
          border-top-color: var(--el-border-color-lighter);
          
          &:hover {
            background: var(--el-bg-color-page);
          }
        }
      }
      
      .search-suggestions {
        .suggestion-group {
          .suggestion-item {
            &:hover {
              background: var(--el-bg-color-page);
            }
          }
        }
      }
    }
  }
}
</style>