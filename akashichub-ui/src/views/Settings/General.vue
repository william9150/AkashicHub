<template>
  <div class="general-settings">
    <el-card>
      <template #header>
        <h3>一般設定</h3>
      </template>

      <el-form 
        :model="settings" 
        label-width="150px"
        class="settings-form"
      >
        <el-form-item label="系統名稱">
          <el-input v-model="settings.systemName" />
        </el-form-item>

        <el-form-item label="系統描述">
          <el-input 
            v-model="settings.systemDescription" 
            type="textarea" 
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="預設語言">
          <el-select v-model="settings.defaultLanguage">
            <el-option label="繁體中文" value="zh-TW" />
            <el-option label="English" value="en-US" />
          </el-select>
        </el-form-item>

        <el-form-item label="時區">
          <el-select v-model="settings.timezone">
            <el-option label="台北時間 (UTC+8)" value="Asia/Taipei" />
            <el-option label="UTC" value="UTC" />
          </el-select>
        </el-form-item>

        <el-form-item label="每頁顯示數量">
          <el-select v-model="settings.pageSize">
            <el-option label="10" :value="10" />
            <el-option label="20" :value="20" />
            <el-option label="50" :value="50" />
            <el-option label="100" :value="100" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveSettings">
            儲存設定
          </el-button>
          <el-button @click="resetSettings">
            重設
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

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
  ElMessage.success('設定已儲存')
  originalSettings.value = { ...settings.value }
}

const resetSettings = () => {
  settings.value = { ...originalSettings.value }
  ElMessage.info('設定已重設')
}
</script>

<style scoped>
.general-settings {
  max-width: 800px;
}

.settings-form {
  padding: 20px;
}
</style>