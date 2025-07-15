<template>
  <div class="security-settings">
    <el-card>
      <template #header>
        <h3>安全設定</h3>
      </template>

      <el-form 
        :model="securitySettings" 
        label-width="200px"
        class="settings-form"
      >
        <el-form-item label="密碼最小長度">
          <el-input-number 
            v-model="securitySettings.minPasswordLength" 
            :min="6" 
            :max="32"
          />
        </el-form-item>

        <el-form-item label="登入失敗鎖定次數">
          <el-input-number 
            v-model="securitySettings.maxLoginAttempts" 
            :min="3" 
            :max="10"
          />
        </el-form-item>

        <el-form-item label="會話超時時間（分鐘）">
          <el-input-number 
            v-model="securitySettings.sessionTimeout" 
            :min="5" 
            :max="1440"
          />
        </el-form-item>

        <el-form-item label="強制密碼複雜度">
          <el-switch v-model="securitySettings.requirePasswordComplexity" />
        </el-form-item>

        <el-form-item label="啟用兩步驟驗證">
          <el-switch v-model="securitySettings.enableTwoFactor" />
        </el-form-item>

        <el-form-item label="記錄登入歷史">
          <el-switch v-model="securitySettings.logLoginHistory" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveSecuritySettings">
            儲存設定
          </el-button>
          <el-button @click="resetSecuritySettings">
            重設
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top: 20px;">
      <template #header>
        <h3>修改密碼</h3>
      </template>

      <el-form 
        :model="passwordForm" 
        :rules="passwordRules"
        ref="passwordFormRef"
        label-width="150px"
        class="password-form"
      >
        <el-form-item label="目前密碼" prop="currentPassword">
          <el-input 
            v-model="passwordForm.currentPassword" 
            type="password" 
            show-password
          />
        </el-form-item>

        <el-form-item label="新密碼" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password" 
            show-password
          />
        </el-form-item>

        <el-form-item label="確認新密碼" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="changePassword">
            修改密碼
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const securitySettings = ref({
  minPasswordLength: 8,
  maxLoginAttempts: 5,
  sessionTimeout: 30,
  requirePasswordComplexity: true,
  enableTwoFactor: false,
  logLoginHistory: true
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordFormRef = ref()

const passwordRules = {
  currentPassword: [
    { required: true, message: '請輸入目前密碼', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '請輸入新密碼', trigger: 'blur' },
    { min: 8, message: '密碼長度至少8個字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '請確認新密碼', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('兩次輸入的密碼不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const originalSecuritySettings = ref({ ...securitySettings.value })

const saveSecuritySettings = () => {
  // TODO: 調用API保存安全設定
  ElMessage.success('安全設定已儲存')
  originalSecuritySettings.value = { ...securitySettings.value }
}

const resetSecuritySettings = () => {
  securitySettings.value = { ...originalSecuritySettings.value }
  ElMessage.info('安全設定已重設')
}

const changePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    await authStore.changePassword(
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword
    )
    
    ElMessage.success('密碼修改成功')
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    ElMessage.error('密碼修改失敗')
  }
}
</script>

<style scoped>
.security-settings {
  max-width: 800px;
}

.settings-form,
.password-form {
  padding: 20px;
}
</style>