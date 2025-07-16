<template>
  <div class="user-edit">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>
    
    <div v-else-if="user">
      <div class="page-header">
        <h2>編輯用戶</h2>
        <p>修改用戶 "{{ user.displayName }}" 的配置信息</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="user-form"
      >
        <!-- 基本資訊 -->
        <el-card class="form-section" header="基本資訊">
          <el-form-item label="登入帳號" prop="loginAccount">
            <el-input
              v-model="form.loginAccount"
              placeholder="請輸入登入帳號"
              maxlength="50"
              show-word-limit
              :disabled="!canEditAccount"
              @blur="checkAccountAvailability"
            />
            <div v-if="accountCheckResult" class="account-check-result">
              <el-text 
                :type="accountCheckResult.available ? 'success' : 'danger'"
                size="small"
              >
                <el-icon>
                  <component :is="accountCheckResult.available ? 'SuccessFilled' : 'CircleCloseFilled'" />
                </el-icon>
                {{ accountCheckResult.message }}
              </el-text>
            </div>
            <div v-if="!canEditAccount" class="field-disabled-hint">
              <el-text type="info" size="small">
                <el-icon><InfoFilled /></el-icon>
                管理員帳號不允許修改登入帳號
              </el-text>
            </div>
          </el-form-item>

          <el-form-item label="用戶名稱" prop="displayName">
            <el-input
              v-model="form.displayName"
              placeholder="請輸入用戶顯示名稱"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="電子郵件" prop="email">
            <el-input
              v-model="form.email"
              placeholder="請輸入電子郵件地址"
              maxlength="255"
            />
          </el-form-item>

          <el-form-item label="部門" prop="department">
            <el-select
              v-model="form.department"
              placeholder="請選擇部門"
              style="width: 100%"
              filterable
              allow-create
            >
              <el-option
                v-for="dept in departments"
                :key="dept"
                :label="dept"
                :value="dept"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="手機號碼" prop="phone">
            <el-input
              v-model="form.phone"
              placeholder="請輸入手機號碼（可選）"
              maxlength="20"
            />
          </el-form-item>
        </el-card>

        <!-- 權限設定 -->
        <el-card class="form-section" header="權限設定">
          <el-form-item label="用戶角色" prop="role">
            <el-radio-group v-model="form.role" :disabled="!canEditRole">
              <el-radio value="User">
                <div class="role-option">
                  <div class="role-header">
                    <el-icon color="#67c23a"><User /></el-icon>
                    <span class="role-name">普通用戶</span>
                  </div>
                  <div class="role-desc">可以查看和使用系統資源，但無法進行管理操作</div>
                </div>
              </el-radio>
              <el-radio value="Admin">
                <div class="role-option">
                  <div class="role-header">
                    <el-icon color="#f56c6c"><UserFilled /></el-icon>
                    <span class="role-name">管理員</span>
                  </div>
                  <div class="role-desc">擁有完整的系統管理權限，可以管理用戶、資源等</div>
                </div>
              </el-radio>
            </el-radio-group>
            <div v-if="!canEditRole" class="field-disabled-hint">
              <el-text type="info" size="small">
                <el-icon><InfoFilled /></el-icon>
                {{ roleEditDisabledReason }}
              </el-text>
            </div>
          </el-form-item>

          <el-form-item label="帳號狀態" prop="status">
            <el-radio-group v-model="form.status" :disabled="!canEditStatus">
              <el-radio value="active">
                <el-tag type="success" size="small">啟用</el-tag>
                <span style="margin-left: 8px;">用戶可以正常登入和使用系統</span>
              </el-radio>
              <el-radio value="inactive">
                <el-tag type="info" size="small">停用</el-tag>
                <span style="margin-left: 8px;">用戶無法登入系統</span>
              </el-radio>
              <el-radio value="locked">
                <el-tag type="warning" size="small">鎖定</el-tag>
                <span style="margin-left: 8px;">帳號被系統鎖定</span>
              </el-radio>
            </el-radio-group>
            <div v-if="!canEditStatus" class="field-disabled-hint">
              <el-text type="info" size="small">
                <el-icon><InfoFilled /></el-icon>
                無法修改自己的帳號狀態
              </el-text>
            </div>
          </el-form-item>

          <el-form-item label="權限預覽">
            <div class="permissions-preview">
              <div class="permission-group">
                <h4>資源管理</h4>
                <ul>
                  <li>
                    <el-icon :color="form.role === 'Admin' ? '#67c23a' : '#e6a23c'">
                      <component :is="form.role === 'Admin' ? 'Check' : 'View'" />
                    </el-icon>
                    {{ form.role === 'Admin' ? '完整管理權限' : '僅查看權限' }}
                  </li>
                </ul>
              </div>
              <div class="permission-group">
                <h4>用戶群</h4>
                <ul>
                  <li>
                    <el-icon :color="form.role === 'Admin' ? '#67c23a' : '#f56c6c'">
                      <component :is="form.role === 'Admin' ? 'Check' : 'Close'" />
                    </el-icon>
                    {{ form.role === 'Admin' ? '可以管理其他用戶' : '無權限' }}
                  </li>
                </ul>
              </div>
              <div class="permission-group">
                <h4>系統設定</h4>
                <ul>
                  <li>
                    <el-icon :color="form.role === 'Admin' ? '#67c23a' : '#f56c6c'">
                      <component :is="form.role === 'Admin' ? 'Check' : 'Close'" />
                    </el-icon>
                    {{ form.role === 'Admin' ? '可以修改系統設定' : '無權限' }}
                  </li>
                </ul>
              </div>
            </div>
          </el-form-item>
        </el-card>

        <!-- 安全設定 -->
        <el-card class="form-section" header="安全設定">
          <el-form-item label="密碼操作">
            <div class="password-actions">
              <el-button
                type="warning"
                icon="Key"
                @click="showResetPasswordDialog"
              >
                重置密碼
              </el-button>
              <el-button
                type="info"
                icon="RefreshRight"
                @click="handleForcePasswordChange"
              >
                強制下次登入修改密碼
              </el-button>
            </div>
          </el-form-item>

          <el-form-item label="雙重驗證">
            <el-switch
              v-model="form.twoFactorEnabled"
              active-text="啟用"
              inactive-text="停用"
            />
            <div class="field-hint">
              <el-text type="info" size="small">
                啟用後用戶登入時需要提供額外的驗證碼
              </el-text>
            </div>
          </el-form-item>

          <el-form-item label="登入限制">
            <el-input-number
              v-model="form.maxFailedLogins"
              :min="0"
              :max="10"
              controls-position="right"
              style="width: 150px"
            />
            <span style="margin-left: 8px;">次失敗登入後鎖定帳號</span>
          </el-form-item>

          <el-form-item label="會話超時">
            <el-select
              v-model="form.sessionTimeout"
              placeholder="選擇會話超時時間"
              style="width: 200px"
            >
              <el-option label="30分鐘" :value="30" />
              <el-option label="1小時" :value="60" />
              <el-option label="2小時" :value="120" />
              <el-option label="4小時" :value="240" />
              <el-option label="8小時" :value="480" />
              <el-option label="永不過期" :value="-1" />
            </el-select>
          </el-form-item>
        </el-card>

        <!-- 其他設定 -->
        <el-card class="form-section" header="其他設定">
          <el-form-item label="備註">
            <el-input
              v-model="form.notes"
              type="textarea"
              placeholder="可以添加關於此用戶的備註信息（可選）"
              :rows="3"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="通知設定">
            <el-checkbox-group v-model="form.notifications">
              <el-checkbox value="email">電子郵件通知</el-checkbox>
              <el-checkbox value="system">系統內通知</el-checkbox>
              <el-checkbox value="security">安全警報</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-card>

        <!-- 修改歷史 -->
        <el-card class="form-section" header="修改歷史">
          <div class="history-info">
            <div class="history-item">
              <label>創建時間：</label>
              <span>{{ formatDateTime(user.createdAt) }}</span>
            </div>
            <div class="history-item">
              <label>創建者：</label>
              <span>{{ user.createdBy }}</span>
            </div>
            <div class="history-item">
              <label>最後修改：</label>
              <span>{{ formatDateTime(user.updatedAt) }}</span>
            </div>
            <div class="history-item">
              <label>修改者：</label>
              <span>{{ user.updatedBy || '系統' }}</span>
            </div>
          </div>
        </el-card>

        <!-- 操作按鈕 -->
        <div class="form-actions">
          <el-button @click="goBack">取消</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
            :disabled="!hasChanges"
          >
            保存更改
          </el-button>
        </div>
      </el-form>
    </div>
    
    <div v-else class="error-state">
      <el-empty description="用戶不存在或已被刪除" />
    </div>

    <!-- 重置密碼對話框 -->
    <el-dialog
      v-model="resetPasswordVisible"
      title="重置密碼"
      width="400px"
    >
      <div class="reset-password-content">
        <el-alert
          title="重置密碼"
          :description="`確定要重置用戶 '${user?.displayName}' 的密碼嗎？`"
          type="warning"
          show-icon
          style="margin-bottom: 20px"
        />
        
        <el-form label-width="100px">
          <el-form-item label="新密碼：">
            <el-input
              v-model="newPassword"
              type="password"
              placeholder="留空則自動生成"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="generatePassword">生成隨機密碼</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <el-button @click="resetPasswordVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="resetPasswordLoading"
          @click="confirmResetPassword"
        >
          確認重置
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  UserFilled,
  Check,
  Close,
  View,
  InfoFilled,
  SuccessFilled,
  CircleCloseFilled,
  Key,
  RefreshRight
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { format } from 'date-fns'

// 狀態管理
const authStore = useAuthStore()

// 路由
const route = useRoute()
const router = useRouter()

// 響應式數據
const formRef = ref<FormInstance>()
const loading = ref(true)
const submitting = ref(false)
const user = ref<any>(null)
const originalForm = ref<any>(null)
const accountCheckResult = ref<any>(null)
const resetPasswordVisible = ref(false)
const newPassword = ref('')
const resetPasswordLoading = ref(false)

// 表單數據
const form = reactive({
  loginAccount: '',
  displayName: '',
  email: '',
  department: '',
  phone: '',
  role: 'User',
  status: 'active',
  twoFactorEnabled: false,
  maxFailedLogins: 5,
  sessionTimeout: 60,
  notes: '',
  notifications: ['email', 'system']
})

// 部門列表
const departments = ref([
  'IT部門',
  '開發部',
  '測試部',
  '運維部',
  '產品部',
  '設計部',
  '市場部',
  '銷售部',
  '人力資源部',
  '財務部',
  '管理部'
])

// 表單驗證規則
const rules: FormRules = {
  loginAccount: [
    { required: true, message: '請輸入登入帳號', trigger: 'blur' },
    { min: 3, max: 50, message: '帳號長度在 3 到 50 個字符', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_-]+$/,
      message: '帳號只能包含字母、數字、下劃線和連字符',
      trigger: 'blur'
    }
  ],
  displayName: [
    { required: true, message: '請輸入用戶名稱', trigger: 'blur' },
    { min: 1, max: 100, message: '用戶名稱長度在 1 到 100 個字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '請輸入電子郵件', trigger: 'blur' },
    { type: 'email', message: '請輸入有效的電子郵件地址', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '請選擇部門', trigger: 'change' }
  ],
  role: [
    { required: true, message: '請選擇用戶角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '請選擇帳號狀態', trigger: 'change' }
  ]
}

// 計算屬性
const canEditAccount = computed(() => {
  // 管理員帳號不允許修改登入帳號
  return user.value?.role !== 'Admin'
})

const canEditRole = computed(() => {
  // 只有管理員可以修改角色，且不能修改自己的角色
  return authStore.isAdmin && user.value?.id !== authStore.userInfo?.id
})

const canEditStatus = computed(() => {
  // 不能修改自己的帳號狀態
  return user.value?.id !== authStore.userInfo?.id
})

const roleEditDisabledReason = computed(() => {
  if (!authStore.isAdmin) {
    return '只有管理員可以修改用戶角色'
  } else if (user.value?.id === authStore.userInfo?.id) {
    return '無法修改自己的角色'
  }
  return ''
})

const hasChanges = computed(() => {
  if (!originalForm.value) return false
  
  return Object.keys(form).some(key => {
    const current = form[key as keyof typeof form]
    const original = originalForm.value[key]
    
    if (Array.isArray(current)) {
      return JSON.stringify(current) !== JSON.stringify(original)
    }
    return current !== original
  })
})

// 監聽表單變化
watch(
  () => ({ ...form }),
  () => {
    // 可以在這裡添加自動保存草稿等功能
  },
  { deep: true }
)

// 格式化日期時間
const formatDateTime = (date: Date) => {
  return format(date, 'yyyy-MM-dd HH:mm:ss')
}

// 檢查帳號可用性
const checkAccountAvailability = async () => {
  if (!form.loginAccount || form.loginAccount === originalForm.value?.loginAccount) {
    accountCheckResult.value = null
    return
  }
  
  try {
    // 這裡調用API檢查帳號可用性
    // const result = await usersApi.checkAccountAvailability(form.loginAccount)
    
    // 模擬檢查
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const unavailableAccounts = ['admin', 'test', 'root']
    const available = !unavailableAccounts.includes(form.loginAccount.toLowerCase())
    
    accountCheckResult.value = {
      available,
      message: available ? '帳號可用' : '帳號已存在，請更換其他帳號'
    }
  } catch (error) {
    console.error('Failed to check account availability:', error)
  }
}

// 填充表單
const fillForm = (data: any) => {
  Object.keys(form).forEach(key => {
    if (data[key] !== undefined) {
      ;(form as any)[key] = data[key]
    }
  })
  
  // 保存原始數據用於比較
  originalForm.value = { ...form }
}

// 重置表單
const resetForm = () => {
  if (originalForm.value) {
    fillForm(originalForm.value)
  }
  accountCheckResult.value = null
}

// 返回上一頁
const goBack = () => {
  if (hasChanges.value) {
    ElMessageBox.confirm('您有未保存的更改，確定要離開嗎？', '確認離開', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      router.go(-1)
    }).catch(() => {
      // 用戶取消
    })
  } else {
    router.go(-1)
  }
}

// 顯示重置密碼對話框
const showResetPasswordDialog = () => {
  newPassword.value = ''
  resetPasswordVisible.value = true
}

// 生成隨機密碼
const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  newPassword.value = password
}

// 確認重置密碼
const confirmResetPassword = async () => {
  try {
    resetPasswordLoading.value = true
    
    // 這裡調用API重置密碼
    // await usersApi.resetPassword(user.value.id, newPassword.value)
    
    // 模擬API請求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('密碼重置成功')
    resetPasswordVisible.value = false
    
    if (!newPassword.value) {
      ElMessage.info('新密碼已發送到用戶郵箱')
    }
  } catch (error) {
    ElMessage.error('密碼重置失敗')
  } finally {
    resetPasswordLoading.value = false
  }
}

// 處理強制修改密碼
const handleForcePasswordChange = async () => {
  try {
    await ElMessageBox.confirm(
      '確定要強制用戶在下次登入時修改密碼嗎？',
      '確認操作',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 這裡調用API設置強制修改密碼標記
    // await usersApi.forcePasswordChange(user.value.id)
    
    ElMessage.success('設定成功，用戶下次登入時需要修改密碼')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('設定失敗')
    }
  }
}

// 提交表單
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (accountCheckResult.value && !accountCheckResult.value.available) {
      ElMessage.error('請修正帳號可用性問題')
      return
    }
    
    submitting.value = true
    
    const submitData = { ...form }
    
    // 這裡調用API更新用戶
    // await usersApi.updateUser(user.value.id, submitData)
    
    // 模擬API請求
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    ElMessage.success('用戶更新成功！')
    
    // 更新原始數據
    originalForm.value = { ...form }
    
    router.push(`/users/${user.value.id}`)
    
  } catch (error) {
    console.error('Failed to update user:', error)
    ElMessage.error('用戶更新失敗')
  } finally {
    submitting.value = false
  }
}

// 載入數據
const loadData = async () => {
  try {
    loading.value = true
    
    const id = route.params.id
    
    // 這裡調用API獲取用戶詳情
    // const userData = await usersApi.getUserById(id)
    
    // 模擬數據
    await new Promise(resolve => setTimeout(resolve, 500))
    
    user.value = {
      id: 1,
      loginAccount: 'admin',
      displayName: '系統管理員',
      email: 'admin@example.com',
      department: 'IT部門',
      phone: '+886 912345678',
      role: 'Admin',
      status: 'active',
      twoFactorEnabled: false,
      maxFailedLogins: 5,
      sessionTimeout: 60,
      notes: '系統超級管理員帳號',
      notifications: ['email', 'system'],
      createdAt: new Date('2024-01-01T00:00:00'),
      updatedAt: new Date('2024-01-15T08:30:00'),
      createdBy: 'system',
      updatedBy: 'admin'
    }
    
    // 填充表單
    fillForm(user.value)
    
  } catch (error) {
    console.error('Failed to load user:', error)
    ElMessage.error('載入用戶失敗')
  } finally {
    loading.value = false
  }
}

// 組件掛載
onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.user-edit {
  max-width: 800px;
  margin: 0 auto;
  
  .loading-container {
    padding: 20px;
  }
  
  .page-header {
    margin-bottom: 24px;
    
    h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
    
    p {
      margin: 0;
      color: var(--el-text-color-regular);
    }
  }
  
  .user-form {
    .form-section {
      margin-bottom: 24px;
      
      :deep(.el-card__header) {
        background: var(--el-bg-color-page);
        font-weight: 600;
      }
    }
    
    .account-check-result {
      margin-top: 8px;
      
      .el-text {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
    
    .field-disabled-hint,
    .field-hint {
      margin-top: 8px;
      
      .el-text {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
    
    .role-option {
      .role-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
        
        .role-name {
          font-weight: 500;
        }
      }
      
      .role-desc {
        font-size: 12px;
        color: var(--el-text-color-placeholder);
        margin-left: 24px;
      }
    }
    
    .permissions-preview {
      padding: 16px;
      background: var(--el-bg-color-page);
      border-radius: 8px;
      border: 1px solid var(--el-border-color);
      
      .permission-group {
        margin-bottom: 16px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: var(--el-text-color-primary);
        }
        
        ul {
          margin: 0;
          padding: 0;
          list-style: none;
          
          li {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: var(--el-text-color-regular);
          }
        }
      }
    }
    
    .password-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    
    .history-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      
      .history-item {
        display: flex;
        align-items: center;
        gap: 8px;
        
        label {
          min-width: 80px;
          font-weight: 500;
          color: var(--el-text-color-regular);
        }
      }
    }
    
    .form-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 32px;
      padding: 24px;
      background: var(--el-bg-color-page);
      border-radius: 8px;
    }
  }
  
  .error-state {
    padding: 40px;
    text-align: center;
  }
}

// 對話框樣式
.reset-password-content {
  .el-form-item {
    margin-bottom: 16px;
  }
}

// 響應式設計
@media (max-width: 768px) {
  .user-edit {
    max-width: 100%;
    padding: 0 16px;
    
    .user-form {
      .role-option {
        .role-desc {
          margin-left: 0;
          margin-top: 4px;
        }
      }
      
      .permissions-preview {
        .permission-group {
          h4 {
            font-size: 13px;
          }
          
          ul li {
            font-size: 12px;
          }
        }
      }
      
      .password-actions {
        flex-direction: column;
      }
      
      .history-info {
        grid-template-columns: 1fr;
        
        .history-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }
      }
      
      .form-actions {
        flex-direction: column;
        
        .el-button {
          width: 100%;
        }
      }
    }
  }
}

// 暗黑模式
.dark {
  .user-edit {
    .page-header {
      h2 {
        color: var(--el-text-color-primary);
      }
    }
    
    .user-form {
      .form-section {
        :deep(.el-card__header) {
          background: var(--el-bg-color-page);
        }
      }
      
      .permissions-preview {
        background: var(--el-bg-color-page);
        border-color: var(--el-border-color);
      }
      
      .form-actions {
        background: var(--el-bg-color-page);
      }
    }
  }
}
</style>