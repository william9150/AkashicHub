<template>
  <div class="user-results">
    <div v-if="results.length > 0" class="results-list">
      <div
        v-for="user in results"
        :key="user.id"
        class="user-item card mb-3"
        @click="$emit('viewDetail', user.id)"
        style="cursor: pointer;"
      >
        <div class="card-body">
          <div class="d-flex align-items-center">
            <div class="user-avatar me-3">
              <img v-if="user.avatar" :src="user.avatar" class="rounded-circle" width="48" height="48" alt="用戶頭像">
              <i v-else class="bi bi-person-circle fs-1 text-muted"></i>
            </div>
            <div class="user-content flex-grow-1">
              <div class="d-flex justify-content-between align-items-start">
                <h5 class="user-name mb-1" v-html="highlightText(user.displayName, keyword)"></h5>
                <div class="user-badges">
                  <span :class="`badge ${user.role === 'Admin' ? 'bg-danger' : 'bg-primary'} me-1`">
                    {{ user.role === 'Admin' ? '管理員' : '用戶' }}
                  </span>
                  <span :class="`badge ${getStatusBadgeClass(user.status)}`">
                    {{ getStatusLabel(user.status) }}
                  </span>
                </div>
              </div>
              <div class="user-details">
                <div class="detail-item d-flex align-items-center mb-1">
                  <i class="bi bi-person me-2"></i>
                  <span class="login-account" v-html="highlightText(user.loginAccount, keyword)"></span>
                </div>
                <div v-if="user.email" class="detail-item d-flex align-items-center mb-1">
                  <i class="bi bi-envelope me-2"></i>
                  <span class="email" v-html="highlightText(user.email, keyword)"></span>
                </div>
                <div class="detail-item d-flex align-items-center">
                  <i class="bi bi-calendar me-2"></i>
                  <span class="created-date">{{ formatDate(user.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-results text-center text-muted py-4">
      <i class="bi bi-search fs-1"></i>
      <p class="mt-2">沒有找到相關用戶</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue'

// Props
defineProps<{
  results: any[]
  keyword: string
}>()

// Emits
defineEmits<{
  viewDetail: [id: number]
}>()

// 高亮文本
const highlightText = (text: string, keyword: string) => {
  if (!keyword || !text) return text
  const regex = new RegExp(`(${keyword})`, 'gi')
  return text.replace(regex, '<mark class="bg-warning">$1</mark>')
}

// 獲取狀態標籤類別
const getStatusBadgeClass = (status: string) => {
  const statusMap: Record<string, string> = {
    active: 'bg-success',
    inactive: 'bg-secondary',
    suspended: 'bg-warning'
  }
  return statusMap[status] || 'bg-secondary'
}

// 獲取狀態標籤
const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '啟用',
    inactive: '停用',
    suspended: '暫停'
  }
  return statusMap[status] || '未知'
}

// 格式化日期
const formatDate = (date: string | Date) => {
  const d = new Date(date)
  return d.toLocaleDateString('zh-TW')
}
</script>

<style scoped>
.user-item {
  transition: all 0.2s ease;
}

.user-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-name {
  color: var(--bs-primary);
  font-weight: 600;
}

.detail-item {
  font-size: 0.875rem;
  color: var(--bs-gray-600);
}

.login-account {
  font-family: 'Consolas', 'Monaco', monospace;
  font-weight: 500;
}

.no-results {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

:deep(mark) {
  padding: 0.1em 0.2em;
  border-radius: 0.2em;
}
</style>