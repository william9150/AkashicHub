<template>
  <div class="tag-results">
    <div v-if="results.length > 0" class="results-list">
      <div
        v-for="tag in results"
        :key="tag.id"
        class="tag-item"
        @click="$emit('filterByTag', tag)"
      >
        <div class="tag-icon">
          <el-icon :color="getCategoryColor(tag.category)">
            <CollectionTag />
          </el-icon>
        </div>
        <div class="tag-content">
          <div class="tag-header">
            <div class="tag-display">
              <el-tag
                :type="getCategoryTagType(tag.category)"
                :color="tag.color"
                effect="light"
                size="large"
                class="tag-element"
              >
                <span v-html="highlightText(tag.name, keyword)"></span>
              </el-tag>
            </div>
            <div class="tag-category">
              <el-tag type="info" size="small" effect="plain">
                {{ getCategoryLabel(tag.category) }}
              </el-tag>
            </div>
          </div>
          <div class="tag-stats">
            <div class="stat-item">
              <el-icon><DataLine /></el-icon>
              <span>使用 {{ tag.usageCount }} 次</span>
            </div>
            <div class="stat-item">
              <el-icon><Calendar /></el-icon>
              <span>創建於 {{ formatDate(tag.createdAt) }}</span>
            </div>
            <div class="stat-item">
              <el-icon><Edit /></el-icon>
              <span>更新於 {{ formatDate(tag.updatedAt) }}</span>
            </div>
          </div>
          <div v-if="tag.description" class="tag-description">
            <p>{{ tag.description }}</p>
          </div>
        </div>
        <div class="tag-actions">
          <el-button size="small" type="primary" @click.stop="$emit('filterByTag', tag)">
            篩選資源
          </el-button>
        </div>
      </div>
    </div>
    <div v-else class="no-results">
      <el-empty description="沒有找到相關標籤" :image-size="80" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CollectionTag,
  DataLine,
  Calendar,
  Edit
} from '@element-plus/icons-vue'
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
const getCategoryTagType = (category: string) => {
  const typeMap: Record<string, string> = {
    Environment: 'success',
    Priority: 'warning',
    Department: 'primary',
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
</script>

<style lang="scss" scoped>
.tag-results {
  .results-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 16px;
    
    .tag-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 20px;
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: var(--el-color-primary);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      }
      
      .tag-icon {
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
        }
      }
      
      .tag-content {
        flex: 1;
        
        .tag-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          
          .tag-display {
            .tag-element {
              font-weight: 500;
              
              :deep(span) {
                :deep(mark) {
                  background: rgba(255, 255, 255, 0.8);
                  color: inherit;
                  padding: 1px 2px;
                  border-radius: 2px;
                  font-weight: 600;
                }
              }
            }
          }
        }
        
        .tag-stats {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
          
          .stat-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: var(--el-text-color-regular);
            
            .el-icon {
              font-size: 14px;
              color: var(--el-text-color-placeholder);
            }
          }
        }
        
        .tag-description {
          p {
            margin: 0;
            font-size: 13px;
            color: var(--el-text-color-placeholder);
            line-height: 1.5;
          }
        }
      }
      
      .tag-actions {
        flex-shrink: 0;
        display: flex;
        align-items: center;
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
  .tag-results {
    .results-list {
      grid-template-columns: 1fr;
      
      .tag-item {
        flex-direction: column;
        align-items: center;
        text-align: center;
        
        .tag-content {
          width: 100%;
          
          .tag-header {
            flex-direction: column;
            gap: 8px;
            align-items: center;
          }
          
          .tag-stats {
            align-items: center;
            
            .stat-item {
              justify-content: center;
            }
          }
        }
      }
    }
  }
}

// 暗黑模式
.dark {
  .tag-results {
    .results-list {
      .tag-item {
        border-color: var(--el-border-color-lighter);
        
        &:hover {
          border-color: var(--el-color-primary);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
        }
        
        .tag-icon {
          background: var(--el-bg-color-page);
        }
        
        .tag-content {
          .tag-header {
            .tag-display {
              .tag-element {
                :deep(span) {
                  :deep(mark) {
                    background: rgba(0, 0, 0, 0.3);
                    color: inherit;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>