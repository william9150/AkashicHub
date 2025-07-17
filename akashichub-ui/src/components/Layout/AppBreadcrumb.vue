<template>
  <div class="app-breadcrumb">
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li
          v-for="(item, index) in breadcrumbs"
          :key="index"
          :class="['breadcrumb-item', { active: index === breadcrumbs.length - 1 }]"
        >
          <router-link
            v-if="index !== breadcrumbs.length - 1"
            :to="item.path"
            class="breadcrumb-link"
          >
            <div class="breadcrumb-content">
              <i v-if="item.icon" :class="item.icon" class="breadcrumb-icon"></i>
              <span class="breadcrumb-title">{{ item.title }}</span>
            </div>
          </router-link>
          <div v-else class="breadcrumb-content">
            <i v-if="item.icon" :class="item.icon" class="breadcrumb-icon"></i>
            <span class="breadcrumb-title">{{ item.title }}</span>
          </div>
        </li>
      </ol>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

// 狀態管理
const appStore = useAppStore()

// 路由
const route = useRoute()

// 計算屬性
const breadcrumbs = computed(() => {
  const breadcrumbs = appStore.breadcrumbs || []
  
  // 為每個面包屑項添加圖標
  return breadcrumbs.map((item, index) => ({
    ...item,
    icon: getBreadcrumbIcon(item.title, index === 0)
  }))
})

// 獲取面包屑圖標
const getBreadcrumbIcon = (title: string, isFirst: boolean) => {
  if (isFirst) {
    return 'bi bi-house'
  }
  
  const iconMap: Record<string, string> = {
    '資源管理': 'bi bi-server',
    '資源列表': 'bi bi-server',
    '新增資源': 'bi bi-server',
    '資源詳情': 'bi bi-server',
    '編輯資源': 'bi bi-server',
    '標籤管理': 'bi bi-tags',
    '標籤列表': 'bi bi-tags',
    '新增標籤': 'bi bi-tags',
    '編輯標籤': 'bi bi-tags',
    '用戶管理': 'bi bi-person',
    '用戶列表': 'bi bi-person',
    '新增用戶': 'bi bi-person',
    '用戶詳情': 'bi bi-person',
    '編輯用戶': 'bi bi-person',
    '日誌管理': 'bi bi-file-text',
    '系統日誌': 'bi bi-file-text',
    '審計日誌': 'bi bi-file-text',
    '搜尋': 'bi bi-search',
    '系統設定': 'bi bi-gear',
    '一般設定': 'bi bi-gear',
    '安全設定': 'bi bi-gear',
    '系統狀態': 'bi bi-gear',
    '關於系統': 'bi bi-info-circle',
    '個人資料': 'bi bi-person-fill'
  }
  
  return iconMap[title] || null
}
</script>

<style lang="scss" scoped>
.app-breadcrumb {
  display: flex;
  align-items: center;
  height: 100%;
  
  .breadcrumb {
    margin-bottom: 0;
    
    .breadcrumb-item {
      .breadcrumb-link {
        text-decoration: none;
        color: var(--bs-secondary);
        transition: color 0.3s ease;
        
        &:hover {
          color: var(--bs-primary);
        }
      }
      
      &.active {
        .breadcrumb-content {
          color: var(--bs-emphasis-color);
          font-weight: 500;
        }
      }
    }
  }
}

.breadcrumb-content {
  display: flex;
  align-items: center;
  gap: 6px;
  
  .breadcrumb-icon {
    font-size: 14px;
    color: currentColor;
  }
  
  .breadcrumb-title {
    font-size: 14px;
    color: currentColor;
  }
}

// 響應式設計
@media (max-width: 768px) {
  .app-breadcrumb {
    .breadcrumb {
      .breadcrumb-item {
        .breadcrumb-link,
        .breadcrumb-content {
          font-size: 13px;
        }
      }
    }
  }
  
  .breadcrumb-content {
    gap: 4px;
    
    .breadcrumb-icon {
      font-size: 12px;
    }
    
    .breadcrumb-title {
      font-size: 13px;
    }
  }
}

@media (max-width: 480px) {
  .app-breadcrumb {
    .breadcrumb {
      .breadcrumb-item {
        &:not(:last-child) {
          .breadcrumb-content {
            .breadcrumb-title {
              display: none;
            }
          }
        }
      }
    }
  }
}

// 暗黑模式
[data-bs-theme="dark"] {
  .app-breadcrumb {
    .breadcrumb {
      .breadcrumb-item {
        .breadcrumb-link {
          color: var(--bs-secondary);
          
          &:hover {
            color: var(--bs-primary);
          }
        }
        
        &.active {
          .breadcrumb-content {
            color: var(--bs-emphasis-color);
          }
        }
      }
    }
  }
}
</style>