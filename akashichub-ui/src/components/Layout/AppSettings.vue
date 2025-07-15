<template>
  <el-drawer
    v-model="visible"
    title="個人化設定"
    direction="rtl"
    size="350px"
    :with-header="true"
    :close-on-click-modal="false"
  >
    <div class="settings-content">
      <!-- 主題設定 -->
      <div class="settings-section">
        <h4 class="section-title">主題設定</h4>
        
        <div class="setting-item">
          <label class="setting-label">主題模式</label>
          <div class="theme-options">
            <div
              class="theme-option"
              :class="{ active: !appStore.isDarkMode }"
              @click="setTheme('light')"
            >
              <el-icon><Sunny /></el-icon>
              <span>淺色</span>
            </div>
            <div
              class="theme-option"
              :class="{ active: appStore.isDarkMode }"
              @click="setTheme('dark')"
            >
              <el-icon><Moon /></el-icon>
              <span>深色</span>
            </div>
          </div>
        </div>

        <div class="setting-item">
          <label class="setting-label">主題色彩</label>
          <div class="color-options">
            <div
              v-for="color in themeColors"
              :key="color.name"
              class="color-option"
              :class="{ active: appStore.settings.themeColor === color.value }"
              :style="{ backgroundColor: color.value }"
              @click="setThemeColor(color.value)"
            >
              <el-icon v-if="appStore.settings.themeColor === color.value">
                <Check />
              </el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 佈局設定 -->
      <div class="settings-section">
        <h4 class="section-title">佈局設定</h4>
        
        <div class="setting-item">
          <label class="setting-label">側邊欄狀態</label>
          <el-switch
            v-model="sidebarCollapsed"
            active-text="收起"
            inactive-text="展開"
            @change="toggleSidebar"
          />
        </div>

        <div class="setting-item">
          <label class="setting-label">固定頭部</label>
          <el-switch
            v-model="settings.fixedHeader"
            @change="updateSettings"
          />
        </div>

        <div class="setting-item">
          <label class="setting-label">顯示標籤頁</label>
          <el-switch
            v-model="settings.showTabs"
            @change="updateSettings"
          />
        </div>

        <div class="setting-item">
          <label class="setting-label">顯示面包屑</label>
          <el-switch
            v-model="settings.showBreadcrumb"
            @change="updateSettings"
          />
        </div>

        <div class="setting-item">
          <label class="setting-label">顯示底部</label>
          <el-switch
            v-model="settings.showFooter"
            @change="updateSettings"
          />
        </div>

        <div class="setting-item">
          <label class="setting-label">側邊欄獨佔</label>
          <el-switch
            v-model="settings.uniqueOpened"
            @change="updateSettings"
          />
        </div>
      </div>

      <!-- 動畫設定 -->
      <div class="settings-section">
        <h4 class="section-title">動畫設定</h4>
        
        <div class="setting-item">
          <label class="setting-label">頁面切換動畫</label>
          <el-select
            v-model="settings.animation"
            placeholder="請選擇動畫效果"
            @change="updateSettings"
          >
            <el-option label="淡入淡出" value="fade" />
            <el-option label="滑動" value="slide" />
            <el-option label="縮放" value="zoom" />
            <el-option label="無動畫" value="none" />
          </el-select>
        </div>

        <div class="setting-item">
          <label class="setting-label">開啟載入動畫</label>
          <el-switch
            v-model="settings.enableLoadingAnimation"
            @change="updateSettings"
          />
        </div>
      </div>

      <!-- 功能設定 -->
      <div class="settings-section">
        <h4 class="section-title">功能設定</h4>
        
        <div class="setting-item">
          <label class="setting-label">開啟水印</label>
          <el-switch
            v-model="settings.enableWatermark"
            @change="updateSettings"
          />
        </div>

        <div v-if="settings.enableWatermark" class="setting-item">
          <label class="setting-label">水印文字</label>
          <el-input
            v-model="settings.watermarkText"
            placeholder="請輸入水印文字"
            @change="updateSettings"
          />
        </div>

        <div class="setting-item">
          <label class="setting-label">自動保存設定</label>
          <el-switch
            v-model="settings.autoSave"
            @change="updateSettings"
          />
        </div>

        <div class="setting-item">
          <label class="setting-label">頁面緩存</label>
          <el-switch
            v-model="settings.keepAlive"
            @change="updateSettings"
          />
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="settings-actions">
        <el-button type="primary" @click="saveSettings">
          保存設定
        </el-button>
        <el-button @click="resetSettings">
          重置設定
        </el-button>
        <el-button @click="exportSettings">
          導出設定
        </el-button>
        <el-button @click="importSettings">
          導入設定
        </el-button>
      </div>
    </div>

    <!-- 隱藏的文件輸入 -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileImport"
    />
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Sunny,
  Moon,
  Check
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'

// 狀態管理
const appStore = useAppStore()

// 響應式數據
const fileInput = ref<HTMLInputElement>()

// 主題色彩選項
const themeColors = ref([
  { name: '默認藍', value: '#409eff' },
  { name: '成功綠', value: '#67c23a' },
  { name: '警告橙', value: '#e6a23c' },
  { name: '危險紅', value: '#f56c6c' },
  { name: '紫色', value: '#722ed1' },
  { name: '粉色', value: '#eb2f96' },
  { name: '青色', value: '#13c2c2' },
  { name: '橙色', value: '#fa8c16' }
])

// 計算屬性
const visible = computed({
  get: () => appStore.settingsVisible,
  set: (value: boolean) => appStore.setSettingsVisible(value)
})

const sidebarCollapsed = computed({
  get: () => appStore.sidebarCollapsed,
  set: (value: boolean) => appStore.setSidebarCollapsed(value)
})

const settings = computed({
  get: () => appStore.settings,
  set: (value: any) => appStore.updateSettings(value)
})

// 設置主題
const setTheme = (theme: 'light' | 'dark') => {
  appStore.setTheme(theme)
  ElMessage.success(`已切換到${theme === 'light' ? '淺色' : '深色'}主題`)
}

// 設置主題色彩
const setThemeColor = (color: string) => {
  appStore.updateSettings({
    ...appStore.settings,
    themeColor: color
  })
  
  // 動態更新CSS變量
  document.documentElement.style.setProperty('--el-color-primary', color)
  
  ElMessage.success('主題色彩已更新')
}

// 切換側邊欄
const toggleSidebar = () => {
  appStore.toggleSidebar()
}

// 更新設定
const updateSettings = () => {
  if (appStore.settings.autoSave) {
    saveSettings()
  }
}

// 保存設定
const saveSettings = () => {
  try {
    localStorage.setItem('app-settings', JSON.stringify(appStore.settings))
    ElMessage.success('設定已保存')
  } catch (error) {
    ElMessage.error('保存設定失敗')
  }
}

// 重置設定
const resetSettings = async () => {
  try {
    await ElMessageBox.confirm(
      '確定要重置所有設定嗎？這將清除所有個人化設定。',
      '確認重置',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    appStore.resetSettings()
    localStorage.removeItem('app-settings')
    ElMessage.success('設定已重置')
  } catch (error) {
    // 用戶取消操作
  }
}

// 導出設定
const exportSettings = () => {
  const settingsData = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    settings: appStore.settings
  }
  
  const blob = new Blob([JSON.stringify(settingsData, null, 2)], {
    type: 'application/json'
  })
  
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `akashichub-settings-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  
  URL.revokeObjectURL(url)
  ElMessage.success('設定已導出')
}

// 導入設定
const importSettings = () => {
  fileInput.value?.click()
}

// 處理文件導入
const handleFileImport = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const data = JSON.parse(content)
      
      if (data.settings) {
        appStore.updateSettings(data.settings)
        saveSettings()
        ElMessage.success('設定已導入')
      } else {
        ElMessage.error('無效的設定文件格式')
      }
    } catch (error) {
      ElMessage.error('導入設定失敗，請檢查文件格式')
    }
  }
  
  reader.readAsText(file)
  
  // 清空文件輸入
  target.value = ''
}

// 監聽主題色彩變化
watch(
  () => appStore.settings.themeColor,
  (newColor) => {
    if (newColor) {
      document.documentElement.style.setProperty('--el-color-primary', newColor)
    }
  },
  { immediate: true }
)

// 監聽設定變化自動保存
watch(
  () => appStore.settings,
  (newSettings) => {
    if (newSettings.autoSave) {
      saveSettings()
    }
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.settings-content {
  padding: 0 4px;
  
  .settings-section {
    margin-bottom: 24px;
    
    .section-title {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      border-bottom: 1px solid var(--el-border-color-lighter);
      padding-bottom: 8px;
    }
    
    .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      
      .setting-label {
        font-size: 14px;
        color: var(--el-text-color-primary);
        font-weight: 500;
      }
      
      &.column {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  }
  
  .theme-options {
    display: flex;
    gap: 8px;
    
    .theme-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
      border: 1px solid var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: var(--el-color-primary);
      }
      
      &.active {
        border-color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
      }
      
      .el-icon {
        font-size: 18px;
      }
      
      span {
        font-size: 12px;
        color: var(--el-text-color-regular);
      }
    }
  }
  
  .color-options {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    
    .color-option {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        inset: -2px;
        border: 2px solid transparent;
        border-radius: 8px;
        transition: border-color 0.3s ease;
      }
      
      &:hover::after {
        border-color: var(--el-color-primary);
      }
      
      &.active::after {
        border-color: var(--el-color-primary);
      }
      
      .el-icon {
        color: white;
        font-size: 16px;
        drop-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }
    }
  }
  
  .settings-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
    
    .el-button {
      width: 100%;
    }
  }
}

// 自定義滾動條
:deep(.el-drawer__body) {
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--el-bg-color-page);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color-darker);
    border-radius: 3px;
    
    &:hover {
      background: var(--el-border-color-dark);
    }
  }
}

// 響應式設計
@media (max-width: 768px) {
  .settings-content {
    padding: 0 2px;
    
    .settings-section {
      margin-bottom: 20px;
      
      .setting-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
    
    .theme-options {
      width: 100%;
      justify-content: space-between;
      
      .theme-option {
        flex: 1;
      }
    }
    
    .color-options {
      grid-template-columns: repeat(4, 1fr);
      width: 100%;
    }
  }
}

// 暗黑模式
.dark {
  .settings-content {
    .settings-section {
      .section-title {
        color: var(--el-text-color-primary);
        border-bottom-color: var(--el-border-color-lighter);
      }
      
      .setting-item {
        .setting-label {
          color: var(--el-text-color-primary);
        }
      }
    }
    
    .theme-options {
      .theme-option {
        border-color: var(--el-border-color);
        
        &:hover {
          border-color: var(--el-color-primary);
        }
        
        &.active {
          border-color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }
        
        span {
          color: var(--el-text-color-regular);
        }
      }
    }
    
    .settings-actions {
      border-top-color: var(--el-border-color-lighter);
    }
  }
}
</style>