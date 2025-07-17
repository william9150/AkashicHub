<template>
  <div class="resource-results">
    <div v-if="results.length > 0" class="results-list">
      <div
        v-for="resource in results"
        :key="resource.id"
        class="resource-item card mb-3"
        @click="$emit('viewDetail', resource.id)"
        style="cursor: pointer;"
      >
        <div class="card-body">
          <div class="d-flex align-items-start">
            <div class="resource-icon me-3">
              <div class="icon-container" :style="{ backgroundColor: getResourceTypeColor(resource.resourceType) }">
                <i :class="getResourceTypeIcon(resource.resourceType)" class="icon"></i>
              </div>
            </div>
            <div class="resource-content flex-grow-1">
              <div class="resource-header d-flex justify-content-between align-items-start mb-2">
                <h5 class="resource-name mb-0" v-html="highlightText(resource.name, keyword)"></h5>
                <span :class="getResourceTypeTagClass(resource.resourceType)">
                  {{ resource.resourceType }}
                </span>
              </div>
              <div class="resource-details mb-2">
                <div class="detail-item d-flex align-items-center me-3">
                  <i class="bi bi-geo-alt me-1"></i>
                  <span>{{ resource.ipAddress }}</span>
                </div>
                <div class="detail-item d-flex align-items-center me-3">
                  <i class="bi bi-calendar me-1"></i>
                  <span>創建於 {{ formatDate(resource.createdAt) }}</span>
                </div>
                <div class="detail-item d-flex align-items-center">
                  <i class="bi bi-pencil me-1"></i>
                  <span>更新於 {{ formatDate(resource.updatedAt) }}</span>
                </div>
              </div>
              <div v-if="resource.tags && resource.tags.length > 0" class="resource-tags">
                <span
                  v-for="tag in resource.tags.slice(0, 3)"
                  :key="tag.id"
                  class="badge bg-info me-1"
                >
                  {{ tag.name }}
                </span>
                <span v-if="resource.tags.length > 3" class="more-tags text-muted">
                  +{{ resource.tags.length - 3 }} 更多
                </span>
              </div>
            </div>
            <div class="resource-actions">
              <button class="btn btn-sm btn-primary" @click.stop="$emit('viewDetail', resource.id)">
                查看詳情
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-results text-center text-muted py-5">
      <i class="bi bi-search fs-1"></i>
      <p class="mt-2">沒有找到相關資源</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

interface Props {
  results: any[]
  keyword: string
}

interface Emits {
  (e: 'viewDetail', id: number): void
}

defineProps<Props>()
defineEmits<Emits>()

// 獲取資源類型圖標
const getResourceTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    Server: 'bi bi-server',
    Database: 'bi bi-database',
    Website: 'bi bi-globe',
    Storage: 'bi bi-folder',
    Cache: 'bi bi-hdd'
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

// 獲取資源類型標籤類型
const getResourceTypeTagClass = (type: string) => {
  const typeMap: Record<string, string> = {
    Server: 'badge bg-primary',
    Database: 'badge bg-success',
    Website: 'badge bg-warning',
    Storage: 'badge bg-danger',
    Cache: 'badge bg-info'
  }
  return typeMap[type] || 'badge bg-secondary'
}

// 高亮文字
const highlightText = (text: string, query: string) => {
  if (!query) return text
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark class="bg-warning">$1</mark>')
}

// 格式化日期
const formatDate = (date: Date) => {
  return format(date, 'yyyy-MM-dd')
}
</script>

<style lang="scss" scoped>
.resource-results {
  .resource-item {
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .resource-icon {
      .icon-container {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        
        .icon {
          font-size: 24px;
          color: white;
        }
      }
    }
    
    .resource-name {
      color: var(--bs-primary);
      font-weight: 600;
      
      :deep(mark) {
        padding: 0.1em 0.2em;
        border-radius: 0.2em;
      }
    }
    
    .resource-details {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      
      .detail-item {
        font-size: 0.875rem;
        color: var(--bs-gray-600);
        
        i {
          font-size: 0.875rem;
          color: var(--bs-gray-500);
        }
      }
    }
    
    .resource-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      
      .more-tags {
        font-size: 0.75rem;
      }
    }
  }
  
  .no-results {
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
}

// 響應式設計
@media (max-width: 768px) {
  .resource-results {
    .resource-item {
      .d-flex {
        flex-direction: column;
        align-items: center;
        text-align: center;
        
        .resource-icon {
          margin-bottom: 1rem;
          margin-right: 0 !important;
        }
        
        .resource-content {
          width: 100%;
          
          .resource-header {
            flex-direction: column;
            gap: 0.5rem;
            align-items: center;
          }
          
          .resource-details {
            justify-content: center;
            
            .detail-item {
              flex-direction: column;
              gap: 0.25rem;
              text-align: center;
            }
          }
          
          .resource-tags {
            justify-content: center;
          }
        }
      }
    }
  }
}
</style>