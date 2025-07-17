<template>
  <div class="user-create">
    <div class="container-fluid">
      <div class="page-header mb-4">
        <h2>新增用戶</h2>
        <p class="text-muted">創建新的系統用戶並配置相應權限</p>
      </div>

      <div class="card">
        <div class="card-header">
          <h5 class="card-title mb-0">基本資訊</h5>
        </div>
        <div class="card-body">
          <form @submit.prevent="handleSubmit">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">登入帳號 <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model="form.loginAccount"
                  placeholder="請輸入登入帳號"
                  required
                  maxlength="50"
                >
              </div>
              
              <div class="col-md-6">
                <label class="form-label">用戶名稱 <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model="form.displayName"
                  placeholder="請輸入用戶顯示名稱"
                  required
                  maxlength="100"
                >
              </div>
              
              <div class="col-md-6">
                <label class="form-label">電子郵件</label>
                <input
                  type="email"
                  class="form-control"
                  v-model="form.email"
                  placeholder="請輸入電子郵件地址"
                  maxlength="100"
                >
              </div>
              
              <div class="col-md-6">
                <label class="form-label">用戶角色 <span class="text-danger">*</span></label>
                <select class="form-select" v-model="form.role" required>
                  <option value="">請選擇角色</option>
                  <option value="User">一般用戶</option>
                  <option value="ITManager">IT管理員</option>
                  <option value="SuperAdmin">超級管理員</option>
                </select>
              </div>
              
              <div class="col-md-6">
                <label class="form-label">密碼 <span class="text-danger">*</span></label>
                <input
                  type="password"
                  class="form-control"
                  v-model="form.password"
                  placeholder="請輸入密碼"
                  required
                  minlength="6"
                >
              </div>
              
              <div class="col-md-6">
                <label class="form-label">確認密碼 <span class="text-danger">*</span></label>
                <input
                  type="password"
                  class="form-control"
                  v-model="form.confirmPassword"
                  placeholder="請再次輸入密碼"
                  required
                  minlength="6"
                >
              </div>
            </div>
            
            <div class="mt-4">
              <button type="submit" class="btn btn-primary me-2" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ loading ? '創建中...' : '創建用戶' }}
              </button>
              <button type="button" class="btn btn-secondary" @click="goBack">
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showAlert } from '@/utils/bootstrap-alerts'

const router = useRouter()
const loading = ref(false)

const form = ref({
  loginAccount: '',
  displayName: '',
  email: '',
  role: '',
  password: '',
  confirmPassword: ''
})

const handleSubmit = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    showAlert('兩次輸入的密碼不一致', 'error')
    return
  }
  
  try {
    loading.value = true
    
    // 這裡應該調用 API 創建用戶
    // await usersApi.createUser(form.value)
    
    showAlert('用戶創建成功', 'success')
    router.push('/users')
  } catch (error) {
    showAlert('用戶創建失敗', 'error')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/users')
}
</script>

<style scoped>
.user-create {
  padding: 1rem;
}

.page-header h2 {
  color: var(--bs-primary);
  margin-bottom: 0.5rem;
}

.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.text-danger {
  color: var(--bs-danger) !important;
}
</style>