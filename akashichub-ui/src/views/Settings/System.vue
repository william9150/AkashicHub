<template>
  <div class="system-settings">
    <div class="card">
      <div class="card-header">
        <h3 class="card-title mb-0">系統設定</h3>
      </div>
      <div class="card-body">
        <form class="settings-form">
          <div class="row mb-3">
            <label class="col-sm-3 col-form-label">系統維護模式</label>
            <div class="col-sm-9">
              <div class="form-check form-switch">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  id="maintenanceMode"
                  v-model="systemSettings.maintenanceMode"
                >
                <label class="form-check-label" for="maintenanceMode"></label>
              </div>
              <small class="form-text text-muted">啟用後，只有管理員可以訪問系統</small>
            </div>
          </div>

          <div class="row mb-3">
            <label class="col-sm-3 col-form-label">新用戶註冊</label>
            <div class="col-sm-9">
              <div class="form-check form-switch">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  id="allowRegistration"
                  v-model="systemSettings.allowRegistration"
                >
                <label class="form-check-label" for="allowRegistration"></label>
              </div>
              <small class="form-text text-muted">允許新用戶自行註冊</small>
            </div>
          </div>

          <div class="row mb-3">
            <label class="col-sm-3 col-form-label">啟用系統日誌</label>
            <div class="col-sm-9">
              <div class="form-check form-switch">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  id="enableSystemLogs"
                  v-model="systemSettings.enableSystemLogs"
                >
                <label class="form-check-label" for="enableSystemLogs"></label>
              </div>
              <small class="form-text text-muted">記錄系統操作日誌</small>
            </div>
          </div>

          <div class="row mb-3">
            <label class="col-sm-3 col-form-label">啟用稽核日誌</label>
            <div class="col-sm-9">
              <div class="form-check form-switch">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  id="enableAuditLogs"
                  v-model="systemSettings.enableAuditLogs"
                >
                <label class="form-check-label" for="enableAuditLogs"></label>
              </div>
              <small class="form-text text-muted">記錄用戶操作稽核日誌</small>
            </div>
          </div>

          <div class="row mb-3">
            <label class="col-sm-3 col-form-label">自動備份</label>
            <div class="col-sm-9">
              <div class="form-check form-switch">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  id="autoBackup"
                  v-model="systemSettings.autoBackup"
                >
                <label class="form-check-label" for="autoBackup"></label>
              </div>
              <small class="form-text text-muted">啟用資料庫自動備份</small>
            </div>
          </div>

          <div class="row mb-3" v-if="systemSettings.autoBackup">
            <label class="col-sm-3 col-form-label">備份頻率</label>
            <div class="col-sm-9">
              <select class="form-select" v-model="systemSettings.backupFrequency">
                <option value="daily">每日</option>
                <option value="weekly">每週</option>
                <option value="monthly">每月</option>
              </select>
            </div>
          </div>

          <div class="row mb-3" v-if="systemSettings.autoBackup">
            <label class="col-sm-3 col-form-label">保留備份數量</label>
            <div class="col-sm-9">
              <input 
                type="number" 
                class="form-control" 
                v-model.number="systemSettings.backupRetention"
                min="1" 
                max="30"
                style="max-width: 150px;"
              >
            </div>
          </div>

          <div class="row">
            <div class="col-sm-9 offset-sm-3">
              <button 
                type="button" 
                class="btn btn-primary me-2" 
                @click="saveSystemSettings"
              >
                儲存設定
              </button>
              <button 
                type="button" 
                class="btn btn-secondary" 
                @click="resetSystemSettings"
              >
                重設
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header">
        <h3 class="card-title mb-0">系統操作</h3>
      </div>
      <div class="card-body">
        <div class="system-actions">
          <div class="row g-3">
            <div class="col-md-4">
              <button 
                type="button"
                class="btn btn-warning w-100" 
                @click="clearCache"
                :disabled="loading.clearCache"
              >
                <span v-if="loading.clearCache" class="spinner-border spinner-border-sm me-2" role="status"></span>
                清除快取
              </button>
            </div>
            <div class="col-md-4">
              <button 
                type="button"
                class="btn btn-info w-100" 
                @click="exportData"
                :disabled="loading.exportData"
              >
                <span v-if="loading.exportData" class="spinner-border spinner-border-sm me-2" role="status"></span>
                匯出資料
              </button>
            </div>
            <div class="col-md-4">
              <button 
                type="button"
                class="btn btn-success w-100" 
                @click="createBackup"
                :disabled="loading.createBackup"
              >
                <span v-if="loading.createBackup" class="spinner-border spinner-border-sm me-2" role="status"></span>
                立即備份
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showAlert, showConfirm } from '@/utils/bootstrap-alerts'

const systemSettings = ref({
  maintenanceMode: false,
  allowRegistration: true,
  enableSystemLogs: true,
  enableAuditLogs: true,
  autoBackup: false,
  backupFrequency: 'weekly',
  backupRetention: 7
})

const loading = ref({
  clearCache: false,
  exportData: false,
  createBackup: false
})

const originalSystemSettings = ref({ ...systemSettings.value })

const saveSystemSettings = () => {
  // TODO: 調用API保存系統設定
  showAlert('系統設定已儲存', 'success')
  originalSystemSettings.value = { ...systemSettings.value }
}

const resetSystemSettings = () => {
  systemSettings.value = { ...originalSystemSettings.value }
  showAlert('系統設定已重設', 'info')
}

const clearCache = async () => {
  try {
    const confirmed = await showConfirm(
      '清除快取可能會暫時影響系統性能，是否繼續？',
      '確認清除快取',
      {
        confirmText: '確認',
        cancelText: '取消',
        type: 'warning'
      }
    )

    if (!confirmed) return

    loading.value.clearCache = true
    // TODO: 調用API清除快取
    await new Promise(resolve => setTimeout(resolve, 2000))
    showAlert('快取已清除', 'success')
  } catch (error) {
    showAlert('清除快取失敗', 'error')
  } finally {
    loading.value.clearCache = false
  }
}

const exportData = async () => {
  loading.value.exportData = true
  try {
    // TODO: 調用API匯出資料
    await new Promise(resolve => setTimeout(resolve, 3000))
    showAlert('資料匯出成功', 'success')
  } catch (error) {
    showAlert('資料匯出失敗', 'error')
  } finally {
    loading.value.exportData = false
  }
}

const createBackup = async () => {
  loading.value.createBackup = true
  try {
    // TODO: 調用API創建備份
    await new Promise(resolve => setTimeout(resolve, 5000))
    showAlert('備份創建成功', 'success')
  } catch (error) {
    showAlert('備份創建失敗', 'error')
  } finally {
    loading.value.createBackup = false
  }
}
</script>

<style scoped>
.system-settings {
  max-width: 800px;
}

.settings-form {
  padding: 0;
}

.form-text {
  display: block;
  margin-top: 0.25rem;
}

.system-actions {
  padding: 0;
}

.form-check-input:checked {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

.card-title {
  color: var(--bs-dark);
  font-weight: 600;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>