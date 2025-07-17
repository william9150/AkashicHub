<template>
  <div class="general-settings">
    <div class="card">
      <div class="card-header">
        <h3 class="card-title mb-0">一般設定</h3>
      </div>
      <div class="card-body">
        <form class="settings-form">
          <div class="row mb-3">
            <label for="systemName" class="col-sm-3 col-form-label">系統名稱</label>
            <div class="col-sm-9">
              <input 
                type="text" 
                class="form-control" 
                id="systemName"
                v-model="settings.systemName" 
              />
            </div>
          </div>

          <div class="row mb-3">
            <label for="systemDescription" class="col-sm-3 col-form-label">系統描述</label>
            <div class="col-sm-9">
              <textarea 
                class="form-control" 
                id="systemDescription"
                rows="3"
                v-model="settings.systemDescription"
              ></textarea>
            </div>
          </div>

          <div class="row mb-3">
            <label for="defaultLanguage" class="col-sm-3 col-form-label">預設語言</label>
            <div class="col-sm-9">
              <select 
                class="form-select" 
                id="defaultLanguage"
                v-model="settings.defaultLanguage"
              >
                <option value="zh-TW">繁體中文</option>
                <option value="en-US">English</option>
              </select>
            </div>
          </div>

          <div class="row mb-3">
            <label for="timezone" class="col-sm-3 col-form-label">時區</label>
            <div class="col-sm-9">
              <select 
                class="form-select" 
                id="timezone"
                v-model="settings.timezone"
              >
                <option value="Asia/Taipei">台北時間 (UTC+8)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>

          <div class="row mb-3">
            <label for="pageSize" class="col-sm-3 col-form-label">每頁顯示數量</label>
            <div class="col-sm-9">
              <select 
                class="form-select" 
                id="pageSize"
                v-model="settings.pageSize"
              >
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>
          </div>

          <div class="row">
            <div class="col-sm-9 offset-sm-3">
              <button 
                type="button" 
                class="btn btn-primary me-2" 
                @click="saveSettings"
              >
                儲存設定
              </button>
              <button 
                type="button" 
                class="btn btn-secondary" 
                @click="resetSettings"
              >
                重設
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showAlert } from '@/utils/bootstrap-alerts'

const settings = ref({
  systemName: 'AkashicHub - 阿卡西',
  systemDescription: 'IT內部資源檢索系統',
  defaultLanguage: 'zh-TW',
  timezone: 'Asia/Taipei',
  pageSize: 20
})

const originalSettings = ref({ ...settings.value })

const saveSettings = () => {
  // TODO: 調用API保存設定
  showAlert('設定已儲存', 'success')
  originalSettings.value = { ...settings.value }
}

const resetSettings = () => {
  settings.value = { ...originalSettings.value }
  showAlert('設定已重設', 'info')
}
</script>

<style scoped>
.general-settings {
  max-width: 800px;
}

.card {
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  box-shadow: var(--bs-box-shadow-sm);
}

.card-header {
  background-color: var(--bs-light);
  border-bottom: 1px solid var(--bs-border-color);
  padding: 1rem 1.25rem;
}

.card-title {
  color: var(--bs-heading-color);
  font-weight: 600;
}

.settings-form {
  padding: 0;
}

.form-label {
  font-weight: 500;
  color: var(--bs-body-color);
}

.form-control,
.form-select {
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
}

.form-control:focus,
.form-select:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25);
}

.btn {
  border-radius: var(--bs-border-radius);
}

.btn-primary {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

.btn-secondary {
  background-color: var(--bs-secondary);
  border-color: var(--bs-secondary);
}
</style>