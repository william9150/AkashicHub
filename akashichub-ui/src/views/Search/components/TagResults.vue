<template>
  <div class="tag-results">
    <div v-if="results.length > 0" class="results-list">
      <div
        v-for="tag in results"
        :key="tag.id"
        class="tag-item card mb-3"
        @click="$emit('filterByTag', tag)"
        style="cursor: pointer;"
      >
        <div class="card-body">
          <div class="d-flex align-items-start">
            <div class="tag-icon me-3">
              <div class="icon-container" :style="{ backgroundColor: getCategoryColor(tag.category) }">
                <i class="bi bi-tags icon"></i>
              </div>
            </div>
            <div class="tag-content flex-grow-1">
              <div class="tag-header d-flex justify-content-between align-items-start mb-2">
                <div class="tag-display">
                  <span
                    :class="getCategoryTagClass(tag.category)"
                    class="tag-element"
                    :style="{ backgroundColor: tag.color }"
                  >
                    <span v-html="highlightText(tag.name, keyword)"></span>
                  </span>
                </div>
                <div class="tag-category">
                  <span class="badge bg-info">
                    {{ getCategoryLabel(tag.category) }}
                  </span>
                </div>
              </div>
              <div class="tag-stats mb-2">
                <div class="stat-item d-flex align-items-center mb-1">
                  <i class="bi bi-graph-up me-2"></i>
                  <span class="small text-muted">使用 {{ tag.usageCount }} 次</span>
                </div>
                <div class="stat-item d-flex align-items-center mb-1">
                  <i class="bi bi-calendar me-2"></i>
                  <span class="small text-muted">創建於 {{ formatDate(tag.createdAt) }}</span>
                </div>
                <div class="stat-item d-flex align-items-center">
                  <i class="bi bi-pencil me-2"></i>
                  <span class="small text-muted">更新於 {{ formatDate(tag.updatedAt) }}</span>
                </div>
              </div>
              <div v-if="tag.description" class="tag-description">
                <p class="small text-muted mb-0">{{ tag.description }}</p>
              </div>
            </div>
            <div class="tag-actions">
              <button class="btn btn-sm btn-primary" @click.stop="$emit('filterByTag', tag)">
                篩選資源
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-results text-center text-muted py-5">
      <i class="bi bi-search fs-1"></i>
      <p class="mt-2">沒有找到相關標籤</p>
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
  (e: 'filterByTag', tag: any): void
}

defineProps<Props>()
defineEmits<Emits>()

// 獲取分類顏色
const getCategoryColor = (category: string) => {
  const colorMap: Record<string, string> = {
    Environment: '#67c23a',
    Priority: '#e6a23c',
    Department: '#409eff',
    Project: '#722ed1',
    Technology: '#f56c6c',
    Other: '#909399'
  }
  return colorMap[category] || '#909399'
}

// 獲取分類標籤類型
const getCategoryTagClass = (category: string) => {
  const typeMap: Record<string, string> = {
    Environment: 'badge bg-success',
    Priority: 'badge bg-warning',
    Department: 'badge bg-primary',
    Project: 'badge bg-info',
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
.tag-results {
  .results-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1rem;
    
    .tag-item {
      transition: all 0.2s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .tag-icon {
        .icon-container {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          
          .icon {
            font-size: 20px;
            color: white;
          }
        }
      }
      
      .tag-content {
        .tag-element {
          font-weight: 500;
          border-radius: 0.375rem;
          padding: 0.25rem 0.5rem;
          
          :deep(mark) {
            background: rgba(255, 255, 255, 0.8);
            color: inherit;
            padding: 0.1em 0.2em;
            border-radius: 0.2em;
            font-weight: 600;
          }
        }
        
        .stat-item {
          i {
            font-size: 0.875rem;
            color: var(--bs-gray-500);
          }
        }
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
  .tag-results {
    .results-list {
      grid-template-columns: 1fr;
      
      .tag-item {
        .d-flex {
          flex-direction: column;
          align-items: center;
          text-align: center;
          
          .tag-icon {
            margin-bottom: 1rem;
            margin-right: 0 !important;
          }
          
          .tag-content {
            width: 100%;
            
            .tag-header {
              flex-direction: column;
              gap: 0.5rem;
              align-items: center;
            }
            
            .tag-stats {
              .stat-item {
                justify-content: center;
              }
            }
          }
        }
      }
    }
  }
}
</style>