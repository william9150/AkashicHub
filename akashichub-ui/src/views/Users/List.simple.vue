<template>
  <div class="users-page">
    <div class="page-header">
      <h1>👥 用戶管理</h1>
      <el-button type="primary" @click="showAddDialog = true">
        新增用戶
      </el-button>
    </div>

    <div class="users-content">
      <!-- 搜尋欄 -->
      <el-card class="search-card">
        <el-input
          v-model="searchKeyword"
          placeholder="搜尋用戶帳號、顯示名稱..."
          prefix-icon="Search"
          @input="handleSearch"
          style="max-width: 400px"
        />
      </el-card>

      <!-- 用戶列表 -->
      <el-card class="users-table">
        <el-table 
          :data="filteredUsers" 
          v-loading="loading"
          empty-text="暫無用戶數據"
        >
          <el-table-column prop="LoginAccount" label="登入帳號" min-width="150" />
          <el-table-column prop="DisplayName" label="顯示名稱" min-width="150" />
          <el-table-column prop="Role" label="角色" width="120">
            <template #default="{ row }">
              <el-tag :type="getRoleTagType(row.Role)">
                {{ getRoleDisplayName(row.Role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button size="small" @click="editUser(row)">編輯</el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="deleteUser(row)"
                :disabled="row.LoginAccount === 'admin'"
              >
                刪除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 新增/編輯對話框 -->
    <el-dialog 
      v-model="showAddDialog" 
      :title="editingUser ? '編輯用戶' : '新增用戶'"
      width="600px"
    >
      <el-form :model="userForm" label-width="100px">
        <el-form-item label="登入帳號" required>
          <el-input 
            v-model="userForm.LoginAccount" 
            :disabled="!!editingUser"
            placeholder="請輸入登入帳號"
          />
        </el-form-item>
        <el-form-item label="顯示名稱" required>
          <el-input 
            v-model="userForm.DisplayName" 
            placeholder="請輸入顯示名稱"
          />
        </el-form-item>
        <el-form-item label="角色" required>
          <el-select v-model="userForm.Role" style="width: 100%">
            <el-option label="管理員" value="Admin" />
            <el-option label="IT管理員" value="ITManager" />
            <el-option label="檢視者" value="Viewer" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!editingUser" label="密碼" required>
          <el-input 
            v-model="userForm.Password" 
            type="password"
            placeholder="請輸入密碼"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveUser">確定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const searchKeyword = ref('')
const showAddDialog = ref(false)
const editingUser = ref(null)
const users = ref([])

const userForm = reactive({
  LoginAccount: '',
  DisplayName: '',
  Role: '',
  Password: ''
})

const filteredUsers = computed(() => {
  if (!searchKeyword.value) return users.value
  
  return users.value.filter((user: any) => 
    user.LoginAccount?.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    user.DisplayName?.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
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

const fetchUsers = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('akashichub_token')
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) throw new Error('Failed to fetch users')
    
    const data = await response.json()
    if (data.success) {
      users.value = data.data || []
    }
  } catch (error) {
    console.error('Failed to fetch users:', error)
    ElMessage.error('載入用戶失敗')
  } finally {
    loading.value = false
  }
}

const saveUser = async () => {
  try {
    const token = localStorage.getItem('akashichub_token')
    const method = editingUser.value ? 'PUT' : 'POST'
    const url = editingUser.value 
      ? `${import.meta.env.VITE_API_BASE_URL}/admin/users/${editingUser.value.Id}`
      : `${import.meta.env.VITE_API_BASE_URL}/admin/users`

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userForm)
    })

    if (!response.ok) throw new Error('Failed to save user')

    ElMessage.success(editingUser.value ? '更新成功' : '新增成功')
    showAddDialog.value = false
    resetForm()
    fetchUsers()
  } catch (error) {
    console.error('Failed to save user:', error)
    ElMessage.error('保存失敗')
  }
}

const editUser = (user: any) => {
  editingUser.value = user
  Object.assign(userForm, {
    LoginAccount: user.LoginAccount,
    DisplayName: user.DisplayName,
    Role: user.Role,
    Password: ''
  })
  showAddDialog.value = true
}

const deleteUser = async (user: any) => {
  if (user.LoginAccount === 'admin') {
    ElMessage.warning('無法刪除管理員帳號')
    return
  }

  try {
    await ElMessageBox.confirm('確定要刪除這個用戶嗎？', '確認刪除')
    
    const token = localStorage.getItem('akashichub_token')
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/users/${user.Id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) throw new Error('Failed to delete user')

    ElMessage.success('刪除成功')
    fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete user:', error)
      ElMessage.error('刪除失敗')
    }
  }
}

const resetForm = () => {
  Object.assign(userForm, {
    LoginAccount: '',
    DisplayName: '',
    Role: '',
    Password: ''
  })
  editingUser.value = null
}

const handleSearch = () => {
  // 搜尋邏輯已在 computed 中處理
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  color: #409eff;
  margin: 0;
}

.users-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-card {
  padding: 10px;
}

.users-table {
  flex: 1;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .users-page {
    padding: 10px;
  }
}
</style>