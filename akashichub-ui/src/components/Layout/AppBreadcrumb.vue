<template>
  <div class="app-breadcrumb">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item
        v-for="(item, index) in breadcrumbs"
        :key="index"
        :to="item.path"
      >
        <div class="breadcrumb-item">
          <el-icon v-if="item.icon" class="breadcrumb-icon">
            <component :is="item.icon" />
          </el-icon>
          <span class="breadcrumb-title">{{ item.title }}</span>
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  House,
  Server,
  CollectionTag,
  User,
  Document,
  Search,
  Setting,
  InfoFilled,
  UserFilled
} from '@element-plus/icons-vue'
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
    return 'House'
  }
  
  const iconMap: Record<string, string> = {
    '資源管理': 'Server',
    '資源列表': 'Server',
    '新增資源': 'Server',
    '資源詳情': 'Server',
    '編輯資源': 'Server',
    '標籤管理': 'CollectionTag',
    '標籤列表': 'CollectionTag',
    '新增標籤': 'CollectionTag',
    '編輯標籤': 'CollectionTag',
    '用戶管理': 'User',
    '用戶列表': 'User',
    '新增用戶': 'User',
    '用戶詳情': 'User',
    '編輯用戶': 'User',
    '日誌管理': 'Document',
    '系統日誌': 'Document',
    '審計日誌': 'Document',
    '搜尋': 'Search',
    '系統設定': 'Setting',
    '一般設定': 'Setting',
    '安全設定': 'Setting',
    '系統狀態': 'Setting',
    '關於系統': 'InfoFilled',
    '個人資料': 'UserFilled'
  }
  
  return iconMap[title] || null
}
</script>

<style lang="scss" scoped>
.app-breadcrumb {
  display: flex;
  align-items: center;
  height: 100%;
  
  :deep(.el-breadcrumb) {
    .el-breadcrumb__item {
      .el-breadcrumb__inner {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: var(--el-text-color-regular);
        text-decoration: none;
        transition: color 0.3s ease;
        
        &:hover {
          color: var(--el-color-primary);
        }
        
        &.is-link {
          &:hover {
            color: var(--el-color-primary);
          }
        }
      }
      
      &:last-child {
        .el-breadcrumb__inner {
          color: var(--el-text-color-primary);
          font-weight: 500;
          
          &:hover {
            color: var(--el-text-color-primary);
          }
        }
      }
      
      .el-breadcrumb__separator {
        margin: 0 8px;
        color: var(--el-text-color-placeholder);
      }
    }
  }
}

.breadcrumb-item {
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
    :deep(.el-breadcrumb) {
      .el-breadcrumb__item {
        .el-breadcrumb__inner {
          font-size: 13px;
        }
        
        .el-breadcrumb__separator {
          margin: 0 6px;
        }
      }
    }
  }
  
  .breadcrumb-item {
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
    :deep(.el-breadcrumb) {
      .el-breadcrumb__item {
        &:not(:last-child) {
          .breadcrumb-item {
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
.dark {
  .app-breadcrumb {
    :deep(.el-breadcrumb) {
      .el-breadcrumb__item {
        .el-breadcrumb__inner {
          color: var(--el-text-color-regular);
          
          &:hover {
            color: var(--el-color-primary);
          }
        }
        
        &:last-child {
          .el-breadcrumb__inner {
            color: var(--el-text-color-primary);
            
            &:hover {
              color: var(--el-text-color-primary);
            }
          }
        }
        
        .el-breadcrumb__separator {
          color: var(--el-text-color-placeholder);
        }
      }
    }
  }
}
</style>