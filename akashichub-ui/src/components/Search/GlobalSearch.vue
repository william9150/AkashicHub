<template>
  <div class="global-search">
    <div class="dropdown">
      <div class="search-trigger" @click="handleTriggerClick">
        <div class="input-group">
          <span class="input-group-text">
            <i class="bi bi-search"></i>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            class="form-control search-input"
            placeholder="搜索資源、用戶、標籤..."
            @keyup.enter="handleSearch"
            @input="handleInput"
            @focus="searchVisible = true"
          />
          <div class="search-shortcut">
            <span class="badge bg-secondary">Ctrl + K</span>
          </div>
        </div>
      </div>

      <div 
        v-if="searchVisible" 
        class="dropdown-menu search-dropdown show" 
        @click.stop
      >
        <div class="search-content">
          <!-- 搜索結果 -->
          <div v-if="searchQuery && !searching" class="search-results">
            <!-- 快速操作 -->
            <div v-if="searchQuery" class="quick-actions">
              <div class="section-title">
                <i class="bi bi-lightning"></i>
                快速操作
              </div>
              <div
                class="action-item dropdown-item"
                @click="goToAdvancedSearch"
              >
                <i class="bi bi-search text-primary"></i>
                <span>在 "{{ searchQuery }}" 中進行高級搜索</span>
              </div>
              <div
                v-if="authStore.isAdmin"
                class="action-item dropdown-item"
                @click="createResourceWithName"
              >
                <i class="bi bi-plus-circle text-success"></i>
                <span>創建名為 "{{ searchQuery }}" 的資源</span>
              </div>
            </div>

            <!-- 資源結果 -->
            <div v-if="results.resources.length > 0" class="result-section">
              <div class="section-title">
                <i class="bi bi-server"></i>
                資源 ({{ results.resources.length }})
              </div>
              <div
                v-for="item in results.resources.slice(0, 5)"
                :key="`resource-${item.id}`"
                class="result-item dropdown-item"
                @click="goToResource(item.id)"
              >
                <div class="item-icon">
                  <i 
                    :class="getResourceTypeIcon(item.resourceType)" 
                    :style="{ color: getResourceTypeColor(item.resourceType) }"
                  ></i>
                </div>
                <div class="item-content">
                  <div class="item-name" v-html="highlightText(item.name, searchQuery)"></div>
                  <div class="item-description">{{ item.resourceType }} · {{ item.ipAddress }}</div>
                </div>
                <div class="item-tags">
                  <span
                    v-for="tag in item.tags?.slice(0, 2)"
                    :key="tag.id"
                    class="badge bg-info text-dark me-1"
                  >
                    {{ tag.name }}
                  </span>
                </div>
              </div>
              <div v-if="results.resources.length > 5" class="show-more dropdown-item" @click="showAllResources">
                查看全部 {{ results.resources.length }} 個資源結果
              </div>
            </div>

            <!-- 用戶結果 -->
            <div v-if="results.users.length > 0" class="result-section">
              <div class="section-title">
                <i class="bi bi-person"></i>
                用戶 ({{ results.users.length }})
              </div>
              <div
                v-for="item in results.users.slice(0, 3)"
                :key="`user-${item.id}`"
                class="result-item dropdown-item"
                @click="goToUser(item.id)"
              >
                <div class="item-icon">
                  <div class="avatar-circle">
                    <i class="bi bi-person-fill"></i>
                  </div>
                </div>
                <div class="item-content">
                  <div class="item-name" v-html="highlightText(item.displayName, searchQuery)"></div>
                  <div class="item-description">{{ item.department }} · {{ item.loginAccount }}</div>
                </div>
                <div class="item-status">
                  <span 
                    :class="item.role === 'Admin' ? 'badge bg-danger' : 'badge bg-primary'"
                  >
                    {{ item.role === 'Admin' ? '管理員' : '用戶' }}
                  </span>
                </div>
              </div>
              <div v-if="results.users.length > 3" class="show-more dropdown-item" @click="showAllUsers">
                查看全部 {{ results.users.length }} 個用戶結果
              </div>
            </div>

            <!-- 標籤結果 -->
            <div v-if="results.tags.length > 0" class="result-section">
              <div class="section-title">
                <i class="bi bi-tags"></i>
                標籤 ({{ results.tags.length }})
              </div>
              <div
                v-for="item in results.tags.slice(0, 6)"
                :key="`tag-${item.id}`"
                class="result-item dropdown-item tag-item"
                @click="filterByTag(item)"
              >
                <div class="item-content">
                  <span
                    :class="getCategoryTagClass(item.category)"
                    :style="{ backgroundColor: item.color }"
                  >
                    <span v-html="highlightText(item.name, searchQuery)"></span>
                  </span>
                  <div class="item-description">{{ getCategoryLabel(item.category) }} · {{ item.usageCount }} 次使用</div>
                </div>
              </div>
              <div v-if="results.tags.length > 6" class="show-more dropdown-item" @click="showAllTags">
                查看全部 {{ results.tags.length }} 個標籤結果
              </div>
            </div>

            <!-- 無結果 -->
            <div v-if="!hasResults" class="no-results">
              <div class="text-center py-4">
                <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
                <p class="mt-2 text-muted">沒有找到相關結果</p>
                <button 
                  class="btn btn-primary btn-sm" 
                  @click="goToAdvancedSearch"
                >
                  嘗試高級搜索
                </button>
              </div>
            </div>
          </div>

          <!-- 搜索建議 -->
          <div v-else-if="!searchQuery" class="search-suggestions">
            <div class="section-title">
              <i class="bi bi-lightbulb"></i>
              搜索建議
            </div>
            
            <div class="suggestion-group">
              <div class="group-title">最近搜索</div>
              <div
                v-for="item in recentSearches"
                :key="item"
                class="suggestion-item dropdown-item"
                @click="setSearchQuery(item)"
              >
                <i class="bi bi-clock-history text-muted"></i>
                <span>{{ item }}</span>
              </div>
            </div>

            <div class="suggestion-group">
              <div class="group-title">熱門搜索</div>
              <div
                v-for="item in popularSearches"
                :key="item"
                class="suggestion-item dropdown-item"
                @click="setSearchQuery(item)"
              >
                <i class="bi bi-graph-up text-muted"></i>
                <span>{{ item }}</span>
              </div>
            </div>

            <div class="suggestion-group">
              <div class="group-title">快捷入口</div>
              <div class="suggestion-item dropdown-item" @click="goToPage('/resources')">
                <i class="bi bi-server text-muted"></i>
                <span>所有資源</span>
              </div>
              <div class="suggestion-item dropdown-item" @click="goToPage('/users')">
                <i class="bi bi-person text-muted"></i>
                <span>用戶管理</span>
              </div>
              <div class="suggestion-item dropdown-item" @click="goToPage('/tags')">
                <i class="bi bi-tags text-muted"></i>
                <span>標籤管理</span>
              </div>
            </div>
          </div>

          <!-- 載入中 -->
          <div v-else class="search-loading">
            <div class="text-center py-4">
              <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2 text-muted">搜索中...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { showAlert, showConfirm } from '@/utils/bootstrap-alerts'

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
    showAlert('搜索失敗', 'danger')
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
    Server: 'bi bi-server',
    Database: 'bi bi-database',
    Website: 'bi bi-globe',
    Storage: 'bi bi-hdd',
    Cache: 'bi bi-lightning'
  }
  return iconMap[type] || 'bi bi-server'
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
const getCategoryTagClass = (category: string) => {
  const typeMap: Record<string, string> = {
    Environment: 'badge bg-primary',
    Priority: 'badge bg-warning text-dark',
    Department: 'badge bg-success',
    Project: 'badge bg-info text-dark',
    Technology: 'badge bg-danger',
    Other: 'badge bg-secondary'
  }
  return typeMap[category] || 'badge bg-secondary'
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

// 處理點擊外部關閉
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.global-search')) {
    searchVisible.value = false
  }
}

// 組件掛載
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)
})

// 組件卸載
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.global-search {
  .search-trigger {
    position: relative;
    width: 300px;
    
    .input-group {
      border-radius: 8px;
      transition: all 0.3s ease;
      
      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
    
    .search-shortcut {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;
    }
  }
  
  .search-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    width: 480px;
    max-height: 500px;
    overflow-y: auto;
    margin-top: 4px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    z-index: 1000;
    
    .search-content {
      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px 8px;
        font-size: 14px;
        font-weight: 600;
        color: var(--bs-dark);
        border-bottom: 1px solid var(--bs-border-color);
        margin-bottom: 8px;
        background: var(--bs-light);
        
        i {
          font-size: 16px;
        }
      }
      
      .quick-actions {
        .action-item {
          display: flex;
          align-items: center;
          gap: 12px;
          
          i {
            font-size: 16px;
          }
        }
      }
      
      .result-section {
        margin-bottom: 16px;
        
        .result-item {
          display: flex;
          align-items: center;
          gap: 12px;
          
          .item-icon {
            i {
              font-size: 18px;
            }
            
            .avatar-circle {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: var(--bs-primary);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 14px;
            }
          }
          
          .item-content {
            flex: 1;
            
            .item-name {
              font-size: 14px;
              font-weight: 500;
              color: var(--bs-dark);
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
              color: var(--bs-secondary);
            }
          }
          
          .item-tags {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
          }
          
          .item-status {
            .badge {
              font-size: 11px;
            }
          }
          
          &.tag-item {
            .item-content {
              .badge {
                margin-bottom: 4px;
              }
            }
          }
        }
        
        .show-more {
          text-align: center;
          color: var(--bs-primary);
          font-size: 13px;
          border-top: 1px solid var(--bs-border-color);
        }
      }
      
      .search-suggestions {
        .suggestion-group {
          margin-bottom: 16px;
          
          .group-title {
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 500;
            color: var(--bs-secondary);
          }
          
          .suggestion-item {
            display: flex;
            align-items: center;
            gap: 12px;
            
            i {
              font-size: 16px;
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
}

// 暗黑模式
[data-bs-theme="dark"] {
  .global-search {
    .search-dropdown {
      .search-content {
        .section-title {
          color: var(--bs-light);
          background: var(--bs-dark);
        }
        
        .result-item {
          .item-content {
            .item-name {
              color: var(--bs-light);
              
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
}
</style>