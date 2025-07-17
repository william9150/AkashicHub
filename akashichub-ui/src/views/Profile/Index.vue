<template>
  <div class="profile-page">
    <div class="page-header">
      <h1>個人資料</h1>
      <p class="text-muted">管理您的個人資料和偏好設定</p>
    </div>

    <div class="card">
      <div class="card-body">
        <form 
          @submit.prevent="updateProfile"
          class="profile-form"
          novalidate
        >
          <div class="mb-3">
            <label for="loginAccount" class="form-label">登入帳號</label>
            <input 
              type="text" 
              class="form-control" 
              id="loginAccount"
              v-model="profileForm.loginAccount" 
              disabled 
            />
          </div>

          <div class="mb-3">
            <label for="displayName" class="form-label">顯示名稱 <span class="text-danger">*</span></label>
            <input 
              type="text" 
              class="form-control" 
              :class="{ 'is-invalid': errors.displayName }"
              id="displayName"
              v-model="profileForm.displayName"
              @blur="validateField('displayName')"
              @input="clearError('displayName')"
            />
            <div v-if="errors.displayName" class="invalid-feedback">
              {{ errors.displayName }}
            </div>
          </div>

          <div class="mb-3">
            <label for="email" class="form-label">電子郵件</label>
            <input 
              type="email" 
              class="form-control" 
              :class="{ 'is-invalid': errors.email }"
              id="email"
              v-model="profileForm.email"
              @blur="validateField('email')"
              @input="clearError('email')"
            />
            <div v-if="errors.email" class="invalid-feedback">
              {{ errors.email }}
            </div>
          </div>

          <div class="mb-3">
            <label for="department" class="form-label">部門</label>
            <input 
              type="text" 
              class="form-control" 
              id="department"
              v-model="profileForm.department" 
            />
          </div>

          <div class="mb-3">
            <label class="form-label">角色</label>
            <div>
              <span :class="['badge', profileForm.role === 'Admin' ? 'bg-success' : 'bg-info']">
                {{ profileForm.role === 'Admin' ? '管理員' : '用戶' }}
              </span>
            </div>
          </div>

          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              更新資料
            </button>
            <button type="button" class="btn btn-secondary" @click="resetForm">
              重設
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showAlert } from '@/utils/bootstrap-alerts'
import { useAuthStore } from '@/stores/auth'
import type { UserInfo } from '@/types'

const authStore = useAuthStore()

const profileForm = ref<UserInfo>({
  id: 0,
  loginAccount: '',
  displayName: '',
  email: '',
  department: '',
  role: 'User',
  status: 'active'
})

const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

const validateField = (field: string) => {
  clearError(field)
  
  switch (field) {
    case 'displayName':
      if (!profileForm.value.displayName?.trim()) {
        errors.value.displayName = '請輸入顯示名稱'
      }
      break
    case 'email':
      if (profileForm.value.email && !isValidEmail(profileForm.value.email)) {
        errors.value.email = '請輸入正確的電子郵件格式'
      }
      break
  }
}

const clearError = (field: string) => {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateForm = () => {
  errors.value = {}
  
  if (!profileForm.value.displayName?.trim()) {
    errors.value.displayName = '請輸入顯示名稱'
  }
  
  if (profileForm.value.email && !isValidEmail(profileForm.value.email)) {
    errors.value.email = '請輸入正確的電子郵件格式'
  }
  
  return Object.keys(errors.value).length === 0
}

const updateProfile = async () => {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  try {
    await authStore.updateProfile(profileForm.value)
    showAlert('個人資料更新成功', 'success')
  } catch (error) {
    showAlert('個人資料更新失敗', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  if (authStore.userInfo) {
    profileForm.value = { ...authStore.userInfo }
    errors.value = {}
  }
}

onMounted(() => {
  if (authStore.userInfo) {
    profileForm.value = { ...authStore.userInfo }
  }
})
</script>

<style scoped>
.profile-page {
  padding: var(--bs-gutter-x, 1.5rem);
}

.page-header {
  margin-bottom: var(--bs-spacer-4, 1.5rem);
}

.page-header h1 {
  margin: 0 0 var(--bs-spacer-2, 0.5rem) 0;
  font-size: var(--bs-h1-font-size, 2.5rem);
  font-weight: var(--bs-font-weight-semibold, 600);
  color: var(--bs-heading-color);
}

.card {
  border: var(--bs-border-width) solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  box-shadow: var(--bs-box-shadow-sm);
}

.card-body {
  padding: var(--bs-card-spacer-y) var(--bs-card-spacer-x);
}

.profile-form {
  max-width: 600px;
}

.form-label {
  font-weight: var(--bs-font-weight-medium, 500);
  color: var(--bs-body-color);
  margin-bottom: var(--bs-spacer-2, 0.5rem);
}

.form-control:disabled {
  background-color: var(--bs-secondary-bg);
  opacity: 1;
}

.badge {
  font-size: var(--bs-badge-font-size, 0.75em);
  padding: var(--bs-badge-padding-y) var(--bs-badge-padding-x);
}

.btn {
  font-weight: var(--bs-btn-font-weight, 400);
  border-radius: var(--bs-btn-border-radius);
}

.btn:disabled {
  opacity: var(--bs-btn-disabled-opacity, 0.65);
}

.spinner-border-sm {
  width: var(--bs-spinner-width-sm, 1rem);
  height: var(--bs-spinner-height-sm, 1rem);
}

/* 響應式設計 */
@media (max-width: 576px) {
  .profile-page {
    padding: var(--bs-spacer-3, 1rem);
  }
  
  .page-header h1 {
    font-size: var(--bs-h3-font-size, 1.75rem);
  }
  
  .profile-form {
    max-width: 100%;
  }
  
  .d-flex.gap-2 {
    flex-direction: column;
  }
  
  .d-flex.gap-2 .btn {
    width: 100%;
  }
}
</style>