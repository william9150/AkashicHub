<template>
  <div class="resource-results">
    <div v-if="results.length > 0" class="results-list">
      <div
        v-for="resource in results"
        :key="resource.id"
        class="resource-item"
        @click="$emit('viewDetail', resource.id)"
      >
        <div class="resource-icon">
          <el-icon :color="getResourceTypeColor(resource.resourceType)">
            <component :is="getResourceTypeIcon(resource.resourceType)" />
          </el-icon>
        </div>
        <div class="resource-content">
          <div class="resource-header">
            <h4 class="resource-name" v-html="highlightText(resource.name, keyword)"></h4>
            <el-tag :type="getResourceTypeTagType(resource.resourceType)" size="small">
              {{ resource.resourceType }}
            </el-tag>
          </div>
          <div class="resource-details">
            <div class="detail-item">
              <el-icon><Location /></el-icon>
              <span>{{ resource.ipAddress }}</span>
            </div>
            <div class="detail-item">
              <el-icon><Calendar /></el-icon>
              <span>創建於 {{ formatDate(resource.createdAt) }}</span>
            </div>
            <div class="detail-item">
              <el-icon><Edit /></el-icon>
              <span>更新於 {{ formatDate(resource.updatedAt) }}</span>
            </div>
          </div>
          <div v-if="resource.tags && resource.tags.length > 0" class="resource-tags">
            <el-tag
              v-for="tag in resource.tags.slice(0, 3)"
              :key="tag.id"
              size="small"
              type="info"
              effect="plain"
            >
              {{ tag.name }}
            </el-tag>
            <span v-if="resource.tags.length > 3" class="more-tags">
              +{{ resource.tags.length - 3 }} 更多
            </span>
          </div>
        </div>
        <div class="resource-actions">
          <el-button size="small" type="primary" @click.stop="$emit('viewDetail', resource.id)">
            查看詳情
          </el-button>
        </div>
      </div>
    </div>
    <div v-else class="no-results">
      <el-empty description="沒有找到相關資源" :image-size="80" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Location, Calendar, Edit } from '@element-plus/icons-vue'
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
  return typeMap[type] || ''
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
.resource-results {
  .results-list {
    .resource-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 20px;
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 8px;
      margin-bottom: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: var(--el-color-primary);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      }
      
      .resource-icon {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--el-bg-color-page);
        border-radius: 8px;
        
        .el-icon {
          font-size: 24px;
        }
      }
      
      .resource-content {
        flex: 1;
        
        .resource-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          
          .resource-name {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--el-text-color-primary);
            
            :deep(mark) {
              background: #fff3cd;
              color: #856404;
              padding: 1px 2px;
              border-radius: 2px;
            }
          }
        }
        
        .resource-details {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 12px;
          
          .detail-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            color: var(--el-text-color-regular);
            
            .el-icon {
              font-size: 16px;
              color: var(--el-text-color-placeholder);
            }
          }
        }
        
        .resource-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          
          .more-tags {
            font-size: 12px;
            color: var(--el-text-color-placeholder);
          }
        }
      }
      
      .resource-actions {
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
  .resource-results {
    .results-list {
      .resource-item {
        flex-direction: column;
        align-items: center;
        text-align: center;
        
        .resource-content {
          width: 100%;
          
          .resource-header {
            flex-direction: column;
            gap: 8px;
            align-items: center;
          }
          
          .resource-details {
            justify-content: center;
            
            .detail-item {
              flex-direction: column;
              gap: 4px;
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

// 暗黑模式
.dark {
  .resource-results {
    .results-list {
      .resource-item {
        border-color: var(--el-border-color-lighter);
        
        &:hover {
          border-color: var(--el-color-primary);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
        }
        
        .resource-icon {
          background: var(--el-bg-color-page);
        }
        
        .resource-content {
          .resource-header {
            .resource-name {
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