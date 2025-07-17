<template>
  <div class="security-settings">
    <!-- 安全設定卡片 -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title mb-0">安全設定</h3>
      </div>
      <div class="card-body">
        <form class="settings-form">
          <div class="row mb-3">
            <label class="col-sm-3 col-form-label">密碼最小長度</label>
            <div class="col-sm-9">
              <input 
                type="number" 
                class="form-control" 
                v-model.number="securitySettings.minPasswordLength"
                min="6" 
                max="32"
                style="max-width: 150px;"
              />
            </div>
          </div>

          <div class="row mb-3">
            <label class="col-sm-3 col-form-label">登入失敗鎖定次數</label>
            <div class="col-sm-9">
              <input 
                type="number" 
                class="form-control" 
                v-model.number="securitySettings.maxLoginAttempts"
                min="3" 
                max="10"
                style="max-width: 150px;"
              />
            </div>
          </div>

          <div class="row mb-3">
            <label class="col-sm-3 col-form-label">會話超時時間（分鐘）</label>
            <div class="col-sm-9">
              <input 
                type="number" 
                class="form-control" 
                v-model.number="securitySettings.sessionTimeout"
                min="5" 
                max="1440"
                style="max-width: 150px;"
              />
            </div>
          </div>

          <div class="row mb-3">
            <label class="col-sm-3 col-form-label">強制密碼複雜度</label>
            <div class="col-sm-9">
              <div class="form-check form-switch">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  v-model="securitySettings.requirePasswordComplexity"
                  id="requirePasswordComplexity"
                />
                <label class="form-check-label" for="requirePasswordComplexity"></label>
              </div>
            </div>
          </div>

          <div class="row mb-3">
            <label class="col-sm-3 col-form-label">啟用兩步驟驗證</label>
            <div class="col-sm-9">
              <div class="form-check form-switch">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  v-model="securitySettings.enableTwoFactor"
                  id="enableTwoFactor"
                />
                <label class="form-check-label" for="enableTwoFactor"></label>
              </div>
            </div>
          </div>

          <div class="row mb-3">
            <label class="col-sm-3 col-form-label">記錄登入歷史</label>
            <div class="col-sm-9">
              <div class="form-check form-switch">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  v-model="securitySettings.logLoginHistory"
                  id="logLoginHistory"
                />
                <label class="form-check-label" for="logLoginHistory"></label>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-sm-9 offset-sm-3">
              <button type="button" class="btn btn-primary me-2" @click="saveSecuritySettings">
                儲存設定
              </button>
              <button type="button" class="btn btn-secondary" @click="resetSecuritySettings">
                重設
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- 修改密碼卡片 -->
    <div class="card mt-4">
      <div class="card-header">
        <h3 class="card-title mb-0">修改密碼</h3>
      </div>
      <div class="card-body">
        <form class="password-form" ref="passwordFormRef" @submit.prevent="changePassword">
          <div class="row mb-3">
            <label class="col-sm-3 col-form-label">目前密碼</label>
            <div class="col-sm-9">
              <div class="input-group">
                <input 
                  :type="showCurrentPassword ? 'text' : 'password'"
                  class="form-control"
                  :class="{ 'is-invalid': validationErrors.currentPassword }"
                  v-model="passwordForm.currentPassword"
                  placeholder="請輸入目前密碼"
                />
                <button 
                  class="btn btn-outline-secondary" 
                  type="button"
                  @click="showCurrentPassword = !showCurrentPassword"
                >
                  <i :class="showCurrentPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
                <div class="invalid-feedback" v-if="validationErrors.currentPassword">
                  {{ validationErrors.currentPassword }}
                </div>
              </div>
            </div>
          </div>

          <div class="row mb-3">
            <label class="col-sm-3 col-form-label">新密碼</label>
            <div class="col-sm-9">
              <div class="input-group">
                <input 
                  :type="showNewPassword ? 'text' : 'password'"
                  class="form-control"
                  :class="{ 'is-invalid': validationErrors.newPassword }"
                  v-model="passwordForm.newPassword"
                  placeholder="請輸入新密碼"
                />
                <button 
                  class="btn btn-outline-secondary" 
                  type="button"
                  @click="showNewPassword = !showNewPassword"
                >
                  <i :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
                <div class="invalid-feedback" v-if="validationErrors.newPassword">
                  {{ validationErrors.newPassword }}
                </div>
              </div>
            </div>
          </div>

          <div class="row mb-3">
            <label class="col-sm-3 col-form-label">確認新密碼</label>
            <div class="col-sm-9">
              <div class="input-group">
                <input 
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="form-control"
                  :class="{ 'is-invalid': validationErrors.confirmPassword }"
                  v-model="passwordForm.confirmPassword"
                  placeholder="請再次輸入新密碼"
                />
                <button 
                  class="btn btn-outline-secondary" 
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
                <div class="invalid-feedback" v-if="validationErrors.confirmPassword">
                  {{ validationErrors.confirmPassword }}
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-sm-9 offset-sm-3">
              <button type="submit" class="btn btn-primary">
                修改密碼
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

const passwordFormRef = ref<HTMLFormElement>()

// 密碼顯示狀態
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// 驗證錯誤訊息
const validationErrors = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const originalSecuritySettings = ref({ ...securitySettings.value })

const saveSecuritySettings = () => {
  // TODO: 調用API保存安全設定
  showAlert('安全設定已儲存', 'success')
  originalSecuritySettings.value = { ...securitySettings.value }
}

const resetSecuritySettings = () => {
  securitySettings.value = { ...originalSecuritySettings.value }
  showAlert('安全設定已重設', 'info')
}

// 表單驗證函數
const validatePasswordForm = (): boolean => {
  validationErrors.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }

  let isValid = true

  // 驗證目前密碼
  if (!passwordForm.value.currentPassword) {
    validationErrors.value.currentPassword = '請輸入目前密碼'
    isValid = false
  }

  // 驗證新密碼
  if (!passwordForm.value.newPassword) {
    validationErrors.value.newPassword = '請輸入新密碼'
    isValid = false
  } else if (passwordForm.value.newPassword.length < 8) {
    validationErrors.value.newPassword = '密碼長度至少8個字符'
    isValid = false
  }

  // 驗證確認密碼
  if (!passwordForm.value.confirmPassword) {
    validationErrors.value.confirmPassword = '請確認新密碼'
    isValid = false
  } else if (passwordForm.value.confirmPassword !== passwordForm.value.newPassword) {
    validationErrors.value.confirmPassword = '兩次輸入的密碼不一致'
    isValid = false
  }

  return isValid
}

const changePassword = async () => {
  if (!validatePasswordForm()) {
    return
  }
  
  try {
    await authStore.changePassword(
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword
    )
    
    showAlert('密碼修改成功', 'success')
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
    // 清除驗證錯誤
    validationErrors.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
    // 重置密碼顯示狀態
    showCurrentPassword.value = false
    showNewPassword.value = false
    showConfirmPassword.value = false
  } catch (error) {
    showAlert('密碼修改失敗', 'error')
  }
}
</script>

<style scoped>
.security-settings {
  max-width: 800px;
}

.card-title {
  color: var(--bs-gray-800);
  font-weight: 600;
}

.form-label {
  font-weight: 500;
  color: var(--bs-gray-700);
}

.form-control:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25);
}

.form-check-input:checked {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

.form-check-input:focus {
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25);
}

.btn {
  font-weight: 500;
}

.btn-primary {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

.btn-primary:hover {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  opacity: 0.9;
}

.btn-secondary {
  background-color: var(--bs-secondary);
  border-color: var(--bs-secondary);
}

.btn-outline-secondary {
  color: var(--bs-gray-600);
  border-color: var(--bs-gray-300);
}

.btn-outline-secondary:hover {
  background-color: var(--bs-gray-100);
  border-color: var(--bs-gray-400);
  color: var(--bs-gray-700);
}

.input-group .btn {
  z-index: 3;
}

.invalid-feedback {
  display: block;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid var(--bs-gray-200);
}

.card-header {
  background-color: var(--bs-gray-50);
  border-bottom: 1px solid var(--bs-gray-200);
}

/* 數字輸入框樣式優化 */
input[type="number"] {
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* 響應式調整 */
@media (max-width: 576px) {
  .col-sm-3 {
    margin-bottom: 0.5rem;
  }
  
  .col-sm-9 {
    padding-left: 0.75rem;
  }
  
  .offset-sm-3 {
    margin-left: 0;
  }
}
</style>