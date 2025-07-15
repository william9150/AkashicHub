<template>
  <div class="profile-page">
    <div class="page-header">
      <h1>個人資料</h1>
      <p>管理您的個人資料和偏好設定</p>
    </div>

    <el-card>
      <div class="profile-content">
        <el-form 
          :model="profileForm" 
          :rules="rules"
          label-width="120px"
          class="profile-form"
        >
          <el-form-item label="登入帳號" prop="loginAccount">
            <el-input v-model="profileForm.loginAccount" disabled />
          </el-form-item>

          <el-form-item label="顯示名稱" prop="displayName">
            <el-input v-model="profileForm.displayName" />
          </el-form-item>

          <el-form-item label="電子郵件" prop="email">
            <el-input v-model="profileForm.email" />
          </el-form-item>

          <el-form-item label="部門" prop="department">
            <el-input v-model="profileForm.department" />
          </el-form-item>

          <el-form-item label="角色">
            <el-tag :type="profileForm.role === 'Admin' ? 'success' : 'info'">
              {{ profileForm.role === 'Admin' ? '管理員' : '用戶' }}
            </el-tag>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="updateProfile">
              更新資料
            </el-button>
            <el-button @click="resetForm">
              重設
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
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

const rules = {
  displayName: [
    { required: true, message: '請輸入顯示名稱', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '請輸入正確的電子郵件格式', trigger: 'blur' }
  ]
}

const updateProfile = async () => {
  try {
    await authStore.updateProfile(profileForm.value)
    ElMessage.success('個人資料更新成功')
  } catch (error) {
    ElMessage.error('個人資料更新失敗')
  }
}

const resetForm = () => {
  if (authStore.userInfo) {
    profileForm.value = { ...authStore.userInfo }
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
}

.profile-content {
  padding: 20px;
}

.profile-form {
  max-width: 600px;
}
</style>