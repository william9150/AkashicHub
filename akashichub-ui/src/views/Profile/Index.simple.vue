<template>
  <div class="profile-page">
    <div class="page-header">
      <h1>👤 個人資料</h1>
    </div>

    <div class="profile-content">
      <el-row :gutter="20">
        <!-- 個人資訊 -->
        <el-col :xs="24" :sm="24" :md="12">
          <el-card title="基本資訊">
            <template #header>
              <div class="card-header">
                <span>基本資訊</span>
                <el-button 
                  type="primary" 
                  size="small"
                  @click="showEditDialog = true"
                >
                  編輯
                </el-button>
              </div>
            </template>
            
            <div class="profile-info">
              <div class="info-item">
                <label>登入帳號：</label>
                <span>{{ userInfo?.LoginAccount }}</span>
              </div>
              <div class="info-item">
                <label>顯示名稱：</label>
                <span>{{ userInfo?.DisplayName }}</span>
              </div>
              <div class="info-item">
                <label>角色：</label>
                <el-tag :type="getRoleTagType(userInfo?.Role)">
                  {{ getRoleDisplayName(userInfo?.Role) }}
                </el-tag>
              </div>
              <div class="info-item">
                <label>用戶 ID：</label>
                <span>{{ userInfo?.Id }}</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 安全設定 -->
        <el-col :xs="24" :sm="24" :md="12">
          <el-card title="安全設定">
            <template #header>
              <div class="card-header">
                <span>安全設定</span>
              </div>
            </template>
            
            <div class="security-actions">
              <el-button 
                type="warning" 
                @click="showPasswordDialog = true"
                style="width: 100%; margin-bottom: 10px;"
              >
                修改密碼
              </el-button>
              <el-button 
                type="danger" 
                @click="logout"
                style="width: 100%;"
              >
                登出系統
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 編輯資料對話框 -->
    <el-dialog v-model="showEditDialog" title="編輯個人資料" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="登入帳號">
          <el-input v-model="editForm.LoginAccount" disabled />
        </el-form-item>
        <el-form-item label="顯示名稱" required>
          <el-input v-model="editForm.DisplayName" placeholder="請輸入顯示名稱" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="updateProfile">確定</el-button>
      </template>
    </el-dialog>

    <!-- 修改密碼對話框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密碼" width="500px">
      <el-form :model="passwordForm" label-width="100px">
        <el-form-item label="當前密碼" required>
          <el-input 
            v-model="passwordForm.currentPassword" 
            type="password"
            placeholder="請輸入當前密碼"
          />
        </el-form-item>
        <el-form-item label="新密碼" required>
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password"
            placeholder="請輸入新密碼"
          />
        </el-form-item>
        <el-form-item label="確認密碼" required>
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password"
            placeholder="請再次輸入新密碼"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="changePassword">確定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const userInfo = ref(null)
const showEditDialog = ref(false)
const showPasswordDialog = ref(false)

const editForm = reactive({
  LoginAccount: '',
  DisplayName: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const getRoleTagType = (role: string) => {
  switch (role) {
    case 'Admin':
    case 'SuperAdmin':
      return 'danger'
    case 'ITManager':
      return 'warning'
    case 'Viewer':
      return 'info'
    default:
      return ''
  }
}

const getRoleDisplayName = (role: string) => {
  switch (role) {
    case 'Admin':
    case 'SuperAdmin':
      return '管理員'
    case 'ITManager':
      return 'IT管理員'
    case 'Viewer':
      return '檢視者'
    default:
      return role
  }
}

const fetchUserInfo = async () => {
  try {
    // 先從 localStorage 獲取
    const userStr = localStorage.getItem('akashichub_user')
    if (userStr) {
      userInfo.value = JSON.parse(userStr)
      editForm.LoginAccount = userInfo.value.LoginAccount
      editForm.DisplayName = userInfo.value.DisplayName
    }

    // 然後從 API 獲取最新資訊
    const token = localStorage.getItem('akashichub_token')
    if (token) {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          userInfo.value = data.data
          localStorage.setItem('akashichub_user', JSON.stringify(data.data))
          editForm.LoginAccount = data.data.LoginAccount
          editForm.DisplayName = data.data.DisplayName
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch user info:', error)
  }
}

const updateProfile = async () => {
  try {
    const token = localStorage.getItem('akashichub_token')
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        DisplayName: editForm.DisplayName
      })
    })

    if (!response.ok) throw new Error('Failed to update profile')

    const data = await response.json()
    if (data.success) {
      userInfo.value = { ...userInfo.value, ...data.data }
      localStorage.setItem('akashichub_user', JSON.stringify(userInfo.value))
      ElMessage.success('個人資料更新成功')
      showEditDialog.value = false
    }
  } catch (error) {
    console.error('Failed to update profile:', error)
    ElMessage.error('個人資料更新失敗')
  }
}

const changePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error('新密碼與確認密碼不一致')
    return
  }

  if (passwordForm.newPassword.length < 6) {
    ElMessage.error('密碼長度至少需要 6 位')
    return
  }

  try {
    const token = localStorage.getItem('akashichub_token')
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
    })

    if (!response.ok) throw new Error('Failed to change password')

    ElMessage.success('密碼修改成功，請重新登入')
    showPasswordDialog.value = false
    
    // 清除密碼表單
    Object.assign(passwordForm, {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    // 自動登出
    setTimeout(() => {
      logout()
    }, 1000)
  } catch (error) {
    console.error('Failed to change password:', error)
    ElMessage.error('密碼修改失敗，請檢查當前密碼是否正確')
  }
}

const logout = () => {
  localStorage.removeItem('akashichub_token')
  localStorage.removeItem('akashichub_user')
  ElMessage.success('已登出')
  router.push('/login')
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.profile-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header h1 {
  color: #409eff;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-item label {
  font-weight: bold;
  min-width: 80px;
  color: #666;
}

.security-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 10px;
  }
  
  .profile-content .el-col {
    margin-bottom: 20px;
  }
}
</style>