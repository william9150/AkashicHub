<template>
  <div class="user-results">
    <div v-if="results.length > 0" class="results-list">
      <div
        v-for="user in results"
        :key="user.id"
        class="user-item"
        @click="$emit('viewDetail', user.id)"
      >
        <div class="user-avatar">
          <el-avatar :size="48" :src="user.avatar">
            <el-icon><UserFilled /></el-icon>
          </el-avatar>
        </div>
        <div class="user-content">
          <div class="user-header">
            <h4 class="user-name" v-html="highlightText(user.displayName, keyword)"></h4>
            <div class="user-badges">
              <el-tag :type="user.role === 'Admin' ? 'danger' : 'primary'" size="small">
                {{ user.role === 'Admin' ? '管理員' : '用戶' }}
              </el-tag>
              <el-tag :type="getStatusTagType(user.status)" size="small">
                {{ getStatusLabel(user.status) }}
              </el-tag>
            </div>
          </div>
          <div class="user-details">
            <div class="detail-item">
              <el-icon><User /></el-icon>
              <span class="login-account" v-html="highlightText(user.loginAccount, keyword)"></span>
            </div>
            <div class="detail-item">
              <el-icon><OfficeBuilding /></el-icon>
              <span v-html="highlightText(user.department, keyword)"></span>
            </div>
            <div v-if="user.email" class="detail-item">
              <el-icon><Message /></el-icon>
              <span>{{ user.email }}</span>
            </div>
          </div>
          <div class="user-meta">
            <div class="meta-item">
              <el-icon><Calendar /></el-icon>
              <span>創建於 {{ formatDate(user.createdAt) }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Edit /></el-icon>
              <span>更新於 {{ formatDate(user.updatedAt) }}</span>
            </div>
            <div v-if="user.lastLoginAt" class="meta-item">
              <el-icon><Clock /></el-icon>
              <span>最後登入 {{ formatTimeAgo(user.lastLoginAt) }}</span>
            </div>
          </div>
        </div>
        <div class="user-actions">
          <el-button size="small" type="primary" @click.stop="$emit('viewDetail', user.id)">
            查看詳情
          </el-button>
        </div>
      </div>
    </div>
    <div v-else class="no-results">
      <el-empty description="沒有找到相關用戶" :image-size="80" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  UserFilled,
  User,
  OfficeBuilding,
  Message,
  Calendar,
  Edit,
  Clock
} from '@element-plus/icons-vue'
import { format, formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'

interface Props {
  results: any[]
  keyword: string
}

interface Emits {
  (e: 'viewDetail', id: number): void
}

defineProps<Props>()
defineEmits<Emits>()

// 獲取狀態標籤類型
const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    locked: 'warning'
  }
  return typeMap[status] || 'info'
}

// 獲取狀態標籤
const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    active: '啟用',
    inactive: '停用',
    locked: '鎖定'
  }
  return labelMap[status] || '未知'
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

// 格式化時間差
const formatTimeAgo = (date: Date | null) => {
  if (!date) return '從未登入'
  return formatDistanceToNow(date, { 
    addSuffix: true, 
    locale: zhTW 
  })
}
</script>

<style lang="scss" scoped>
.user-results {
  .results-list {
    .user-item {
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
      
      .user-avatar {
        flex-shrink: 0;
      }
      
      .user-content {
        flex: 1;
        
        .user-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          
          .user-name {
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
          
          .user-badges {
            display: flex;
            gap: 8px;
          }
        }
        
        .user-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
          
          .detail-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: var(--el-text-color-regular);
            
            .el-icon {
              font-size: 16px;
              color: var(--el-text-color-placeholder);
              flex-shrink: 0;
            }
            
            .login-account {
              font-family: monospace;
              background: var(--el-bg-color-page);
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 13px;
            }
          }
        }
        
        .user-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          
          .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: var(--el-text-color-placeholder);
            
            .el-icon {
              font-size: 14px;
            }
          }
        }
      }
      
      .user-actions {
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
  .user-results {
    .results-list {
      .user-item {
        flex-direction: column;
        align-items: center;
        text-align: center;
        
        .user-content {
          width: 100%;
          
          .user-header {
            flex-direction: column;
            gap: 8px;
            align-items: center;
          }
          
          .user-details {
            align-items: center;
            
            .detail-item {
              justify-content: center;
            }
          }
          
          .user-meta {
            justify-content: center;
            
            .meta-item {
              flex-direction: column;
              gap: 4px;
              text-align: center;
            }
          }
        }
      }
    }
  }
}

// 暗黑模式
.dark {
  .user-results {
    .results-list {
      .user-item {
        border-color: var(--el-border-color-lighter);
        
        &:hover {
          border-color: var(--el-color-primary);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
        }
        
        .user-content {
          .user-header {
            .user-name {
              :deep(mark) {
                background: #2d2419;
                color: #d69e2e;
              }
            }
          }
          
          .user-details {
            .detail-item {
              .login-account {
                background: var(--el-bg-color-page);
              }
            }
          }
        }
      }
    }
  }
}
</style>