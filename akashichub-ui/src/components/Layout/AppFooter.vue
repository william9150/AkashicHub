<template>
  <div class="app-footer">
    <div class="footer-content">
      <!-- 左側信息 -->
      <div class="footer-left">
        <span class="copyright">
          © {{ currentYear }} 阿卡西 IT 資源管理系統
        </span>
        <span class="version">
          版本 {{ version }}
        </span>
      </div>

      <!-- 右側信息 -->
      <div class="footer-right">
        <div class="footer-links">
          <a href="#" class="footer-link" @click="showAbout">
            關於我們
          </a>
          <a href="#" class="footer-link" @click="showHelp">
            幫助中心
          </a>
          <a href="#" class="footer-link" @click="showPrivacy">
            隱私政策
          </a>
        </div>
        
        <div class="footer-status">
          <div class="status-item">
            <i class="status-icon" :class="getStatusIcon('system')" :style="{ color: getStatusColor('system') }"></i>
            <span class="status-text">系統狀態</span>
          </div>
          
          <div class="status-item">
            <i class="status-icon" :class="getStatusIcon('database')" :style="{ color: getStatusColor('database') }"></i>
            <span class="status-text">資料庫</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 系統信息對話框 -->
    <div class="modal fade" :class="{ show: aboutVisible }" tabindex="-1" :style="{ display: aboutVisible ? 'block' : 'none' }">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">關於系統</h5>
            <button type="button" class="btn-close" @click="aboutVisible = false"></button>
          </div>
          <div class="modal-body">
      <div class="about-content">
        <div class="about-header">
          <img src="/favicon.ico" alt="Logo" class="about-logo" />
          <div class="about-title">
            <h2>阿卡西 IT 資源管理系統</h2>
            <p>AkashicHub IT Resource Management System</p>
          </div>
        </div>
        
        <div class="about-info">
          <div class="info-item">
            <span class="info-label">版本號：</span>
            <span class="info-value">{{ version }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">構建時間：</span>
            <span class="info-value">{{ buildTime }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">技術架構：</span>
            <span class="info-value">Vue 3 + TypeScript + Bootstrap</span>
          </div>
          <div class="info-item">
            <span class="info-label">後端技術：</span>
            <span class="info-value">Node.js + Express + MySQL</span>
          </div>
        </div>
        
        <div class="about-description">
          <p>
            阿卡西 IT 資源管理系統是一個專為 IT 部門設計的綜合性資源管理平台，
            提供伺服器、資料庫、應用程序等 IT 資源的集中管理和監控功能。
          </p>
        </div>
      </div>
      
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="aboutVisible = false">關閉</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="aboutVisible" class="modal-backdrop fade show" @click="aboutVisible = false"></div>

    <!-- 幫助中心對話框 -->
    <div class="modal fade" :class="{ show: helpVisible }" tabindex="-1" :style="{ display: helpVisible ? 'block' : 'none' }">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">幫助中心</h5>
            <button type="button" class="btn-close" @click="helpVisible = false"></button>
          </div>
          <div class="modal-body">
      <div class="help-content">
        <div class="accordion" id="helpAccordion">
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1" :class="{ collapsed: !activeHelp.includes('1') }">
                如何添加新的資源？
              </button>
            </h2>
            <div id="collapse1" class="accordion-collapse collapse" :class="{ show: activeHelp.includes('1') }" data-bs-parent="#helpAccordion">
              <div class="accordion-body">
                <p>1. 進入「資源管理」頁面</p>
                <p>2. 點擊「新增資源」按鈕</p>
                <p>3. 填寫資源的基本信息</p>
                <p>4. 設置資源的標籤和分類</p>
                <p>5. 保存設置</p>
              </div>
            </div>
          </div>
          
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2" :class="{ collapsed: !activeHelp.includes('2') }">
                如何管理用戶權限？
              </button>
            </h2>
            <div id="collapse2" class="accordion-collapse collapse" :class="{ show: activeHelp.includes('2') }" data-bs-parent="#helpAccordion">
              <div class="accordion-body">
                <p>1. 進入「用戶管理」頁面（需管理員權限）</p>
                <p>2. 選擇要編輯的用戶</p>
                <p>3. 修改用戶角色和權限</p>
                <p>4. 保存更改</p>
              </div>
            </div>
          </div>
          
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse3" :class="{ collapsed: !activeHelp.includes('3') }">
                如何查看系統日誌？
              </button>
            </h2>
            <div id="collapse3" class="accordion-collapse collapse" :class="{ show: activeHelp.includes('3') }" data-bs-parent="#helpAccordion">
              <div class="accordion-body">
                <p>1. 進入「日誌管理」頁面</p>
                <p>2. 選擇日誌類型（系統日誌或審計日誌）</p>
                <p>3. 使用篩選條件查找特定日誌</p>
                <p>4. 查看詳細日誌信息</p>
              </div>
            </div>
          </div>
          
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse4" :class="{ collapsed: !activeHelp.includes('4') }">
                如何搜索資源？
              </button>
            </h2>
            <div id="collapse4" class="accordion-collapse collapse" :class="{ show: activeHelp.includes('4') }" data-bs-parent="#helpAccordion">
              <div class="accordion-body">
                <p>1. 使用頂部搜索框進行快速搜索</p>
                <p>2. 進入「搜尋」頁面進行高級搜索</p>
                <p>3. 使用標籤篩選資源</p>
                <p>4. 使用資源類型篩選</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="helpVisible = false">關閉</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="helpVisible" class="modal-backdrop fade show" @click="helpVisible = false"></div>

    <!-- 隱私政策對話框 -->
    <div class="modal fade" :class="{ show: privacyVisible }" tabindex="-1" :style="{ display: privacyVisible ? 'block' : 'none' }">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">隱私政策</h5>
            <button type="button" class="btn-close" @click="privacyVisible = false"></button>
          </div>
          <div class="modal-body">
      <div class="privacy-content">
        <h3>數據收集</h3>
        <p>本系統僅收集必要的用戶信息和操作日誌，用於系統功能的正常運作和安全審計。</p>
        
        <h3>數據使用</h3>
        <p>收集的數據僅用於系統內部功能，不會向第三方披露或用於其他用途。</p>
        
        <h3>數據保護</h3>
        <p>系統採用加密技術保護用戶數據，並定期進行安全更新和備份。</p>
        
        <h3>Cookie 政策</h3>
        <p>系統使用 Cookie 來維持用戶登入狀態和個人化設置。</p>
        
        <h3>聯繫方式</h3>
        <p>如有隱私相關問題，請聯繫系統管理員。</p>
      </div>
      
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="privacyVisible = false">關閉</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="privacyVisible" class="modal-backdrop fade show" @click="privacyVisible = false"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { showAlert } from '@/utils/bootstrap-alerts'
import { useAppStore } from '@/stores/app'

// 狀態管理
const appStore = useAppStore()

// 響應式數據
const aboutVisible = ref(false)
const helpVisible = ref(false)
const privacyVisible = ref(false)
const activeHelp = ref(['1'])

// 系統狀態模擬數據
const systemStatus = ref({
  system: 'healthy',
  database: 'healthy'
})

// 計算屬性
const currentYear = computed(() => new Date().getFullYear())
const version = computed(() => import.meta.env.VITE_APP_VERSION || '1.0.0')
const buildTime = computed(() => import.meta.env.VITE_BUILD_TIME || '2024-01-01 00:00:00')

// 顯示關於對話框
const showAbout = () => {
  aboutVisible.value = true
}

// 顯示幫助對話框
const showHelp = () => {
  helpVisible.value = true
}

// 顯示隱私政策對話框
const showPrivacy = () => {
  privacyVisible.value = true
}

// 獲取狀態圖標
const getStatusIcon = (type: string) => {
  const status = systemStatus.value[type as keyof typeof systemStatus.value]
  
  switch (status) {
    case 'healthy':
      return 'bi bi-check-circle-fill'
    case 'warning':
      return 'bi bi-exclamation-triangle-fill'
    case 'error':
      return 'bi bi-x-circle-fill'
    default:
      return 'bi bi-display'
  }
}

// 獲取狀態顏色
const getStatusColor = (type: string) => {
  const status = systemStatus.value[type as keyof typeof systemStatus.value]
  
  switch (status) {
    case 'healthy':
      return '#67c23a'
    case 'warning':
      return '#e6a23c'
    case 'error':
      return '#f56c6c'
    default:
      return '#909399'
  }
}
</script>

<style lang="scss" scoped>
.app-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--bs-body-bg);
  border-top: 1px solid var(--bs-border-color);
  
  .footer-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 20px;
    
    .footer-left {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .copyright {
        font-size: 13px;
        color: var(--bs-secondary-color);
      }
      
      .version {
        font-size: 12px;
        color: var(--bs-secondary-color);
        padding: 2px 6px;
        background: var(--bs-light);
        border-radius: 4px;
      }
    }
    
    .footer-right {
      display: flex;
      align-items: center;
      gap: 20px;
      
      .footer-links {
        display: flex;
        gap: 16px;
        
        .footer-link {
          font-size: 13px;
          color: var(--bs-secondary-color);
          text-decoration: none;
          cursor: pointer;
          transition: color 0.3s ease;
          
          &:hover {
            color: var(--bs-primary);
          }
        }
      }
      
      .footer-status {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .status-item {
          display: flex;
          align-items: center;
          gap: 4px;
          
          .status-icon {
            font-size: 12px;
          }
          
          .status-text {
            font-size: 12px;
            color: var(--bs-secondary-color);
          }
        }
      }
    }
  }
}

// 對話框樣式
.about-content {
  .about-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    
    .about-logo {
      width: 48px;
      height: 48px;
    }
    
    .about-title {
      h2 {
        margin: 0 0 4px 0;
        font-size: 20px;
        color: var(--bs-body-color);
      }
      
      p {
        margin: 0;
        font-size: 14px;
        color: var(--bs-secondary-color);
      }
    }
  }
  
  .about-info {
    margin-bottom: 20px;
    
    .info-item {
      display: flex;
      margin-bottom: 8px;
      
      .info-label {
        width: 100px;
        font-weight: 500;
        color: var(--bs-body-color);
      }
      
      .info-value {
        color: var(--bs-secondary-color);
      }
    }
  }
  
  .about-description {
    padding: 16px;
    background: var(--bs-light);
    border-radius: 8px;
    border-left: 4px solid var(--bs-primary);
    
    p {
      margin: 0;
      line-height: 1.6;
      color: var(--bs-secondary-color);
    }
  }
}

.help-content {
  .accordion-button {
    font-weight: 500;
  }
  
  .accordion-body {
    p {
      margin: 4px 0;
      line-height: 1.5;
    }
  }
}

.privacy-content {
  h3 {
    margin-top: 20px;
    margin-bottom: 8px;
    color: var(--bs-body-color);
    font-size: 16px;
    
    &:first-child {
      margin-top: 0;
    }
  }
  
  p {
    margin-bottom: 12px;
    line-height: 1.6;
    color: var(--bs-secondary-color);
  }
}

// 響應式設計
@media (max-width: 768px) {
  .app-footer {
    .footer-content {
      flex-direction: column;
      gap: 12px;
      padding: 0 16px;
      
      .footer-left {
        gap: 12px;
      }
      
      .footer-right {
        gap: 16px;
        
        .footer-links {
          gap: 12px;
        }
        
        .footer-status {
          gap: 8px;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .app-footer {
    .footer-content {
      .footer-left {
        flex-direction: column;
        gap: 8px;
      }
      
      .footer-right {
        flex-direction: column;
        gap: 8px;
        
        .footer-status {
          .status-item {
            .status-text {
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
  .app-footer {
    background: var(--bs-body-bg);
    border-top-color: var(--bs-border-color);
    
    .footer-content {
      .footer-left {
        .copyright {
          color: var(--bs-secondary-color);
        }
        
        .version {
          color: var(--bs-secondary-color);
          background: var(--bs-light);
        }
      }
      
      .footer-right {
        .footer-links {
          .footer-link {
            color: var(--bs-secondary-color);
            
            &:hover {
              color: var(--bs-primary);
            }
          }
        }
        
        .footer-status {
          .status-item {
            .status-text {
              color: var(--bs-secondary-color);
            }
          }
        }
      }
    }
  }
}
</style>