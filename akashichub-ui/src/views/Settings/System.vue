<template>
  <div class="system-settings">
    <el-card>
      <template #header>
        <h3>系統設定</h3>
      </template>

      <el-form 
        :model="systemSettings" 
        label-width="180px"
        class="settings-form"
      >
        <el-form-item label="系統維護模式">
          <el-switch v-model="systemSettings.maintenanceMode" />
          <span class="setting-desc">啟用後，只有管理員可以訪問系統</span>
        </el-form-item>

        <el-form-item label="新用戶註冊">
          <el-switch v-model="systemSettings.allowRegistration" />
          <span class="setting-desc">允許新用戶自行註冊</span>
        </el-form-item>

        <el-form-item label="啟用系統日誌">
          <el-switch v-model="systemSettings.enableSystemLogs" />
          <span class="setting-desc">記錄系統操作日誌</span>
        </el-form-item>

        <el-form-item label="啟用稽核日誌">
          <el-switch v-model="systemSettings.enableAuditLogs" />
          <span class="setting-desc">記錄用戶操作稽核日誌</span>
        </el-form-item>

        <el-form-item label="自動備份">
          <el-switch v-model="systemSettings.autoBackup" />
          <span class="setting-desc">啟用資料庫自動備份</span>
        </el-form-item>

        <el-form-item label="備份頻率" v-if="systemSettings.autoBackup">
          <el-select v-model="systemSettings.backupFrequency">
            <el-option label="每日" value="daily" />
            <el-option label="每週" value="weekly" />
            <el-option label="每月" value="monthly" />
          </el-select>
        </el-form-item>

        <el-form-item label="保留備份數量" v-if="systemSettings.autoBackup">
          <el-input-number 
            v-model="systemSettings.backupRetention" 
            :min="1" 
            :max="30"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveSystemSettings">
            儲存設定
          </el-button>
          <el-button @click="resetSystemSettings">
            重設
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top: 20px;">
      <template #header>
        <h3>系統操作</h3>
      </template>

      <div class="system-actions">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-button 
              type="warning" 
              @click="clearCache"
              :loading="loading.clearCache"
              block
            >
              清除快取
            </el-button>
          </el-col>
          <el-col :span="8">
            <el-button 
              type="info" 
              @click="exportData"
              :loading="loading.exportData"
              block
            >
              匯出資料
            </el-button>
          </el-col>
          <el-col :span="8">
            <el-button 
              type="success" 
              @click="createBackup"
              :loading="loading.createBackup"
              block
            >
              立即備份
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

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
  ElMessage.success('系統設定已儲存')
  originalSystemSettings.value = { ...systemSettings.value }
}

const resetSystemSettings = () => {
  systemSettings.value = { ...originalSystemSettings.value }
  ElMessage.info('系統設定已重設')
}

const clearCache = async () => {
  try {
    await ElMessageBox.confirm(
      '清除快取可能會暫時影響系統性能，是否繼續？',
      '確認清除快取',
      {
        confirmButtonText: '確認',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value.clearCache = true
    // TODO: 調用API清除快取
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('快取已清除')
  } catch (error) {
    // 用戶取消操作
  } finally {
    loading.value.clearCache = false
  }
}

const exportData = async () => {
  loading.value.exportData = true
  try {
    // TODO: 調用API匯出資料
    await new Promise(resolve => setTimeout(resolve, 3000))
    ElMessage.success('資料匯出成功')
  } catch (error) {
    ElMessage.error('資料匯出失敗')
  } finally {
    loading.value.exportData = false
  }
}

const createBackup = async () => {
  loading.value.createBackup = true
  try {
    // TODO: 調用API創建備份
    await new Promise(resolve => setTimeout(resolve, 5000))
    ElMessage.success('備份創建成功')
  } catch (error) {
    ElMessage.error('備份創建失敗')
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
  padding: 20px;
}

.setting-desc {
  margin-left: 10px;
  color: #666;
  font-size: 12px;
}

.system-actions {
  padding: 20px;
}
</style>