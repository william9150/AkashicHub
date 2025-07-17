<template>
  <div class="about-page">
    <div class="page-header">
      <h1>關於系統</h1>
      <p>AkashicHub - IT內部資源檢索系統</p>
    </div>

    <div class="row g-4">
      <div class="col-lg-6">
        <div class="card">
          <div class="card-header">
            <h3>系統資訊</h3>
          </div>
          <div class="card-body">
            <table class="table table-striped">
              <tbody>
                <tr>
                  <td class="fw-bold">系統名稱</td>
                  <td>AkashicHub (阿卡西)</td>
                </tr>
                <tr>
                  <td class="fw-bold">版本</td>
                  <td>v1.0.0</td>
                </tr>
                <tr>
                  <td class="fw-bold">建置時間</td>
                  <td>2024-01-15</td>
                </tr>
                <tr>
                  <td class="fw-bold">後端版本</td>
                  <td>Node.js v22 + Express</td>
                </tr>
                <tr>
                  <td class="fw-bold">前端版本</td>
                  <td>Vue 3 + TypeScript + Bootstrap</td>
                </tr>
                <tr>
                  <td class="fw-bold">資料庫</td>
                  <td>MySQL 8.x</td>
                </tr>
                <tr>
                  <td class="fw-bold">開發團隊</td>
                  <td>IT部門</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="card">
          <div class="card-header">
            <h3>系統狀態</h3>
          </div>
          <div class="card-body">
            <div class="system-status">
              <div class="status-item d-flex justify-content-between align-items-center mb-3">
                <div class="status-label">系統狀態</div>
                <div class="status-value">
                  <span class="badge bg-success">正常運行</span>
                </div>
              </div>
              
              <div class="status-item d-flex justify-content-between align-items-center mb-3">
                <div class="status-label">運行時間</div>
                <div class="status-value">{{ uptime }}</div>
              </div>
              
              <div class="status-item d-flex justify-content-between align-items-center mb-3">
                <div class="status-label">總用戶數</div>
                <div class="status-value">{{ stats.totalUsers }}</div>
              </div>
              
              <div class="status-item d-flex justify-content-between align-items-center mb-3">
                <div class="status-label">總資源數</div>
                <div class="status-value">{{ stats.totalResources }}</div>
              </div>
              
              <div class="status-item d-flex justify-content-between align-items-center mb-3">
                <div class="status-label">今日訪問次數</div>
                <div class="status-value">{{ stats.todayVisits }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4 mt-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h3>功能特色</h3>
          </div>
          <div class="card-body">
            <div class="row g-4">
              <div class="col-md-4">
                <div class="feature-item text-center">
                  <i class="bi bi-search" style="font-size: 48px; color: #409EFF;"></i>
                  <h4>強大搜索</h4>
                  <p>支援多維度搜索和智慧過濾，快速找到所需資源</p>
                </div>
              </div>
              
              <div class="col-md-4">
                <div class="feature-item text-center">
                  <i class="bi bi-lock" style="font-size: 48px; color: #67C23A;"></i>
                  <h4>安全控制</h4>
                  <p>完善的權限管理和安全機制，保護敏感資訊</p>
                </div>
              </div>
              
              <div class="col-md-4">
                <div class="feature-item text-center">
                  <i class="bi bi-file-text" style="font-size: 48px; color: #E6A23C;"></i>
                  <h4>統一管理</h4>
                  <p>集中管理IT資源，提高工作效率和協作能力</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4 mt-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h3>技術架構</h3>
          </div>
          <div class="card-body">
            <div class="tech-stack">
              <div class="row g-4">
                <div class="col-md-4">
                  <div class="tech-category">
                    <h4>前端技術</h4>
                    <ul>
                      <li>Vue.js 3.x - 漸進式JavaScript框架</li>
                      <li>TypeScript - 靜態類型檢查</li>
                      <li>Bootstrap - UI組件庫</li>
                      <li>Pinia - 狀態管理</li>
                      <li>Vue Router - 路由管理</li>
                      <li>Vite - 建置工具</li>
                    </ul>
                  </div>
                </div>
                
                <div class="col-md-4">
                  <div class="tech-category">
                    <h4>後端技術</h4>
                    <ul>
                      <li>Node.js - JavaScript運行環境</li>
                      <li>Express.js - Web應用框架</li>
                      <li>Sequelize - ORM資料庫操作</li>
                      <li>JWT - 身份驗證</li>
                      <li>Winston - 日誌記錄</li>
                      <li>MySQL - 關聯式資料庫</li>
                    </ul>
                  </div>
                </div>
                
                <div class="col-md-4">
                  <div class="tech-category">
                    <h4>部署運維</h4>
                    <ul>
                      <li>Docker - 容器化部署</li>
                      <li>Docker Compose - 多容器編排</li>
                      <li>Seq - 結構化日誌平台</li>
                      <li>nginx - 反向代理</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const uptime = ref('7 天 12 小時 30 分鐘')
const stats = ref({
  totalUsers: 25,
  totalResources: 156,
  todayVisits: 89
})

const updateUptime = () => {
  // TODO: 實際從API獲取系統運行時間
  const now = new Date()
  const startTime = new Date('2024-01-08T10:00:00')
  const diff = now.getTime() - startTime.getTime()
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  uptime.value = `${days} 天 ${hours} 小時 ${minutes} 分鐘`
}

onMounted(() => {
  updateUptime()
  // 每分鐘更新一次運行時間
  setInterval(updateUptime, 60000)
  
  // TODO: 從API獲取系統統計數據
})
</script>

<style scoped>
.about-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.system-status {
  padding: 20px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.status-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.status-label {
  font-weight: 500;
  color: #666;
}

.status-value {
  font-weight: 600;
  color: #333;
}

.feature-item {
  text-align: center;
  padding: 20px;
}

.feature-item h4 {
  margin: 16px 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.feature-item p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.tech-stack {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.tech-category h4 {
  margin: 0 0 12px 0;
  color: #409EFF;
  font-size: 16px;
  font-weight: 600;
}

.tech-category ul {
  margin: 0;
  padding-left: 20px;
}

.tech-category li {
  margin-bottom: 8px;
  line-height: 1.5;
}
</style>