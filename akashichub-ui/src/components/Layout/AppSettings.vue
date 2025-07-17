<template>
  <!-- Bootstrap Offcanvas -->
  <div 
    class="offcanvas offcanvas-end" 
    tabindex="-1" 
    id="settingsOffcanvas"
    :class="{ show: visible }"
    :style="{ visibility: visible ? 'visible' : 'hidden' }"
    @click.self="closeSettings"
  >
    <div class="offcanvas-header">
      <h5 class="offcanvas-title">個人化設定</h5>
      <button 
        type="button" 
        class="btn-close" 
        @click="closeSettings"
      ></button>
    </div>
    <div class="offcanvas-body">
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
                <i class="bi bi-sun-fill"></i>
                <span>淺色</span>
              </div>
              <div
                class="theme-option"
                :class="{ active: appStore.isDarkMode }"
                @click="setTheme('dark')"
              >
                <i class="bi bi-moon-fill"></i>
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
                <i v-if="appStore.settings.themeColor === color.value" class="bi bi-check"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- 佈局設定 -->
      <div class="settings-section">
        <h4 class="section-title">佈局設定</h4>
        
        <div class="setting-item">
          <label class="setting-label">側邊欄狀態</label>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id="sidebarToggle"
              v-model="sidebarCollapsed"
              @change="toggleSidebar"
            />
            <label class="form-check-label" for="sidebarToggle">
              {{ sidebarCollapsed ? '收起' : '展開' }}
            </label>
          </div>
        </div>

        <div class="setting-item">
          <label class="setting-label">固定頭部</label>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id="fixedHeader"
              v-model="settings.fixedHeader"
              @change="updateSettings"
            />
            <label class="form-check-label" for="fixedHeader"></label>
          </div>
        </div>

        <div class="setting-item">
          <label class="setting-label">顯示標籤頁</label>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id="showTabs"
              v-model="settings.showTabs"
              @change="updateSettings"
            />
            <label class="form-check-label" for="showTabs"></label>
          </div>
        </div>

        <div class="setting-item">
          <label class="setting-label">顯示面包屑</label>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id="showBreadcrumb"
              v-model="settings.showBreadcrumb"
              @change="updateSettings"
            />
            <label class="form-check-label" for="showBreadcrumb"></label>
          </div>
        </div>

        <div class="setting-item">
          <label class="setting-label">顯示底部</label>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id="showFooter"
              v-model="settings.showFooter"
              @change="updateSettings"
            />
            <label class="form-check-label" for="showFooter"></label>
          </div>
        </div>

        <div class="setting-item">
          <label class="setting-label">側邊欄獨佔</label>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id="uniqueOpened"
              v-model="settings.uniqueOpened"
              @change="updateSettings"
            />
            <label class="form-check-label" for="uniqueOpened"></label>
          </div>
        </div>
      </div>

      <!-- 動畫設定 -->
      <div class="settings-section">
        <h4 class="section-title">動畫設定</h4>
        
        <div class="setting-item">
          <label class="setting-label">頁面切換動畫</label>
          <select
            class="form-select"
            v-model="settings.animation"
            @change="updateSettings"
          >
            <option value="" disabled>請選擇動畫效果</option>
            <option value="fade">淡入淡出</option>
            <option value="slide">滑動</option>
            <option value="zoom">縮放</option>
            <option value="none">無動畫</option>
          </select>
        </div>

        <div class="setting-item">
          <label class="setting-label">開啟載入動畫</label>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id="enableLoadingAnimation"
              v-model="settings.enableLoadingAnimation"
              @change="updateSettings"
            />
            <label class="form-check-label" for="enableLoadingAnimation"></label>
          </div>
        </div>
      </div>

      <!-- 功能設定 -->
      <div class="settings-section">
        <h4 class="section-title">功能設定</h4>
        
        <div class="setting-item">
          <label class="setting-label">開啟水印</label>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id="enableWatermark"
              v-model="settings.enableWatermark"
              @change="updateSettings"
            />
            <label class="form-check-label" for="enableWatermark"></label>
          </div>
        </div>

        <div v-if="settings.enableWatermark" class="setting-item">
          <label class="setting-label">水印文字</label>
          <input
            type="text"
            class="form-control"
            v-model="settings.watermarkText"
            placeholder="請輸入水印文字"
            @change="updateSettings"
          />
        </div>

        <div class="setting-item">
          <label class="setting-label">自動保存設定</label>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id="autoSave"
              v-model="settings.autoSave"
              @change="updateSettings"
            />
            <label class="form-check-label" for="autoSave"></label>
          </div>
        </div>

        <div class="setting-item">
          <label class="setting-label">頁面緩存</label>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id="keepAlive"
              v-model="settings.keepAlive"
              @change="updateSettings"
            />
            <label class="form-check-label" for="keepAlive"></label>
          </div>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="settings-actions">
        <div class="d-grid gap-2">
          <button type="button" class="btn btn-primary" @click="saveSettings">
            保存設定
          </button>
          <button type="button" class="btn btn-outline-secondary" @click="resetSettings">
            重置設定
          </button>
          <button type="button" class="btn btn-outline-info" @click="exportSettings">
            導出設定
          </button>
          <button type="button" class="btn btn-outline-warning" @click="importSettings">
            導入設定
          </button>
        </div>
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
  </div>
  
  <!-- Bootstrap backdrop -->
  <div
    v-if="visible"
    class="offcanvas-backdrop fade show"
    @click="closeSettings"
  ></div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { showAlert, showConfirm } from '@/utils/bootstrap-alerts'
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

// 關閉設置
const closeSettings = () => {
  appStore.setSettingsVisible(false)
}

// 設置主題
const setTheme = (theme: 'light' | 'dark') => {
  appStore.setTheme(theme)
  showAlert(`已切換到${theme === 'light' ? '淺色' : '深色'}主題`, 'success')
}

// 設置主題色彩
const setThemeColor = (color: string) => {
  appStore.updateSettings({
    ...appStore.settings,
    themeColor: color
  })
  
  // 動態更新CSS變量
  document.documentElement.style.setProperty('--bs-primary', color)
  
  showAlert('主題色彩已更新', 'success')
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
    showAlert('設定已保存', 'success')
  } catch (error) {
    showAlert('保存設定失敗', 'danger')
  }
}

// 重置設定
const resetSettings = async () => {
  try {
    const confirmed = await showConfirm(
      '確定要重置所有設定嗎？這將清除所有個人化設定。',
      '確認重置'
    )
    
    if (!confirmed) return
    
    appStore.resetSettings()
    localStorage.removeItem('app-settings')
    showAlert('設定已重置', 'success')
  } catch (error) {
    showAlert('重置設定失敗', 'danger')
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
  showAlert('設定已導出', 'success')
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
        showAlert('設定已導入', 'success')
      } else {
        showAlert('無效的設定文件格式', 'danger')
      }
    } catch (error) {
      showAlert('導入設定失敗，請檢查文件格式', 'danger')
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
      document.documentElement.style.setProperty('--bs-primary', newColor)
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
      color: var(--bs-body-color);
      border-bottom: 1px solid var(--bs-border-color);
      padding-bottom: 8px;
    }
    
    .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      
      .setting-label {
        font-size: 14px;
        color: var(--bs-body-color);
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
      border: 1px solid var(--bs-border-color);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: var(--bs-primary);
      }
      
      &.active {
        border-color: var(--bs-primary);
        background: var(--bs-primary-bg);
      }
      
      .el-icon {
        font-size: 18px;
      }
      
      span {
        font-size: 12px;
        color: var(--bs-secondary-color);
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
        border-color: var(--bs-primary);
      }
      
      &.active::after {
        border-color: var(--bs-primary);
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
    border-top: 1px solid var(--bs-border-color);
    
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
    background: var(--bs-light);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--bs-border-color-dark);
    border-radius: 3px;
    
    &:hover {
      background: var(--bs-border-color-dark);
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
        color: var(--bs-body-color);
        border-bottom-color: var(--bs-border-color);
      }
      
      .setting-item {
        .setting-label {
          color: var(--bs-body-color);
        }
      }
    }
    
    .theme-options {
      .theme-option {
        border-color: var(--bs-border-color);
        
        &:hover {
          border-color: var(--bs-primary);
        }
        
        &.active {
          border-color: var(--bs-primary);
          background: var(--bs-primary-bg);
        }
        
        span {
          color: var(--bs-secondary-color);
        }
      }
    }
    
    .settings-actions {
      border-top-color: var(--bs-border-color);
    }
  }
}
</style>