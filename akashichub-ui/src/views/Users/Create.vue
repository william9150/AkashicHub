<template>
  <div class="user-create">
    <div class="page-header">
      <h2>新增用戶</h2>
      <p>創建新的系統用戶並配置相應權限</p>
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
          <el-radio-group v-model="form.role">
            <el-radio value="User">
              <div class="role-option">
                <div class="role-header">
                  <el-icon color="#67c23a"><User /></el-icon>
                  <span class="role-name">普通用戶</span>
                </div>
                <div class="role-desc">可以查看和使用系統資源，但無法進行管理操作</div>
              </div>
            </el-radio>
            <el-radio value="Admin" :disabled="!authStore.isAdmin">
              <div class="role-option">
                <div class="role-header">
                  <el-icon color="#f56c6c"><UserFilled /></el-icon>
                  <span class="role-name">管理員</span>
                </div>
                <div class="role-desc">擁有完整的系統管理權限，可以管理用戶、資源等</div>
              </div>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="帳號狀態" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="active">
              <el-tag type="success" size="small">啟用</el-tag>
              <span style="margin-left: 8px;">用戶可以正常登入和使用系統</span>
            </el-radio>
            <el-radio value="inactive">
              <el-tag type="info" size="small">停用</el-tag>
              <span style="margin-left: 8px;">用戶無法登入系統</span>
            </el-radio>
          </el-radio-group>
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
              <h4>用戶管理</h4>
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

      <!-- 密碼設定 -->
      <el-card class="form-section" header="密碼設定">
        <el-form-item label="密碼設定方式">
          <el-radio-group v-model="passwordMode">
            <el-radio value="manual">手動設定密碼</el-radio>
            <el-radio value="auto">自動生成密碼</el-radio>
            <el-radio value="email">發送設定郵件</el-radio>
          </el-radio-group>
        </el-form-item>

        <div v-if="passwordMode === 'manual'" class="password-manual">
          <el-form-item label="密碼" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="請輸入密碼"
              show-password
              @input="checkPasswordStrength"
            />
          </el-form-item>

          <el-form-item label="確認密碼" prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="請再次輸入密碼"
              show-password
            />
          </el-form-item>

          <el-form-item label="密碼強度">
            <div class="password-strength">
              <div 
                class="strength-bar"
                :class="passwordStrength.level"
              >
                <div 
                  class="strength-fill"
                  :style="{ width: passwordStrength.score + '%' }"
                ></div>
              </div>
              <span class="strength-text">{{ passwordStrength.text }}</span>
            </div>
            <div class="password-requirements">
              <div 
                class="requirement"
                :class="{ met: passwordChecks.length }"
              >
                <el-icon><component :is="passwordChecks.length ? 'Check' : 'Close'" /></el-icon>
                至少8個字符
              </div>
              <div 
                class="requirement"
                :class="{ met: passwordChecks.uppercase }"
              >
                <el-icon><component :is="passwordChecks.uppercase ? 'Check' : 'Close'" /></el-icon>
                包含大寫字母
              </div>
              <div 
                class="requirement"
                :class="{ met: passwordChecks.lowercase }"
              >
                <el-icon><component :is="passwordChecks.lowercase ? 'Check' : 'Close'" /></el-icon>
                包含小寫字母
              </div>
              <div 
                class="requirement"
                :class="{ met: passwordChecks.number }"
              >
                <el-icon><component :is="passwordChecks.number ? 'Check' : 'Close'" /></el-icon>
                包含數字
              </div>
              <div 
                class="requirement"
                :class="{ met: passwordChecks.special }"
              >
                <el-icon><component :is="passwordChecks.special ? 'Check' : 'Close'" /></el-icon>
                包含特殊字符
              </div>
            </div>
          </el-form-item>
        </div>

        <div v-else-if="passwordMode === 'auto'" class="password-auto">
          <el-form-item label="生成的密碼">
            <el-input
              :value="generatedPassword"
              readonly
              type="password"
              show-password
            >
              <template #append>
                <el-button @click="generatePassword">重新生成</el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-alert
            title="提醒"
            description="自動生成的密碼將在創建成功後顯示，請妥善保管。"
            type="info"
            show-icon
          />
        </div>

        <div v-else-if="passwordMode === 'email'" class="password-email">
          <el-alert
            title="郵件設定密碼"
            description="系統將發送密碼設定郵件到用戶郵箱，用戶收到郵件後可以自行設定密碼。"
            type="info"
            show-icon
          />
        </div>
      </el-card>

      <!-- 額外選項 -->
      <el-card class="form-section" header="額外選項">
        <el-form-item label="創建選項">
          <el-checkbox-group v-model="createOptions">
            <el-checkbox value="sendWelcomeEmail">發送歡迎郵件</el-checkbox>
            <el-checkbox value="forcePasswordChange">首次登入需要修改密碼</el-checkbox>
            <el-checkbox value="enableTwoFactor">啟用雙重驗證（如果支持）</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

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
      </el-card>

      <!-- 操作按鈕 -->
      <div class="form-actions">
        <el-button @click="goBack">取消</el-button>
        <el-button @click="resetForm">重置</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          @click="handleSubmit"
          :disabled="!isFormValid"
        >
          創建用戶
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  User,
  UserFilled,
  Check,
  Close,
  View,
  SuccessFilled,
  CircleCloseFilled
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

// 狀態管理
const authStore = useAuthStore()

// 路由
const router = useRouter()

// 響應式數據
const formRef = ref<FormInstance>()
const submitting = ref(false)
const passwordMode = ref('manual')
const generatedPassword = ref('')
const createOptions = ref<string[]>(['sendWelcomeEmail'])
const accountCheckResult = ref<any>(null)

// 表單數據
const form = reactive({
  loginAccount: '',
  displayName: '',
  email: '',
  department: '',
  phone: '',
  role: 'User',
  status: 'active',
  password: '',
  confirmPassword: '',
  notes: ''
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

// 密碼強度檢查
const passwordChecks = computed(() => ({
  length: form.password.length >= 8,
  uppercase: /[A-Z]/.test(form.password),
  lowercase: /[a-z]/.test(form.password),
  number: /\d/.test(form.password),
  special: /[!@#$%^&*(),.?":{}|<>]/.test(form.password)
}))

// 密碼強度
const passwordStrength = computed(() => {
  const checks = passwordChecks.value
  const score = Object.values(checks).filter(Boolean).length
  
  if (score <= 1) {
    return { level: 'weak', score: 20, text: '弱' }
  } else if (score <= 3) {
    return { level: 'medium', score: 60, text: '中等' }
  } else {
    return { level: 'strong', score: 100, text: '強' }
  }
})

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
  ],
  password: [
    {
      validator: (rule, value, callback) => {
        if (passwordMode.value === 'manual') {
          if (!value) {
            callback(new Error('請輸入密碼'))
          } else if (value.length < 8) {
            callback(new Error('密碼長度至少8個字符'))
          } else if (!passwordChecks.value.uppercase || !passwordChecks.value.lowercase) {
            callback(new Error('密碼必須包含大小寫字母'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    {
      validator: (rule, value, callback) => {
        if (passwordMode.value === 'manual') {
          if (!value) {
            callback(new Error('請確認密碼'))
          } else if (value !== form.password) {
            callback(new Error('兩次輸入的密碼不一致'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 計算屬性
const isFormValid = computed(() => {
  const basicValid = form.loginAccount && form.displayName && form.email && form.department
  
  if (passwordMode.value === 'manual') {
    return basicValid && form.password && form.confirmPassword && form.password === form.confirmPassword
  }
  
  return basicValid
})

// 監聽密碼模式變化
watch(passwordMode, (newMode) => {
  if (newMode === 'auto') {
    generatePassword()
  } else if (newMode !== 'manual') {
    form.password = ''
    form.confirmPassword = ''
  }
})

// 檢查帳號可用性
const checkAccountAvailability = async () => {
  if (!form.loginAccount) {
    accountCheckResult.value = null
    return
  }
  
  try {
    // 這裡調用API檢查帳號可用性
    // const result = await usersApi.checkAccountAvailability(form.loginAccount)
    
    // 模擬檢查
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模擬結果（假設 admin 和 test 已存在）
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

// 檢查密碼強度
const checkPasswordStrength = () => {
  // 密碼強度檢查已通過計算屬性實現
}

// 生成隨機密碼
const generatePassword = () => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = '!@#$%^&*'
  const allChars = uppercase + lowercase + numbers + special
  
  let password = ''
  
  // 確保包含各種字符類型
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]
  
  // 填充剩餘長度
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // 隨機打亂
  generatedPassword.value = password.split('').sort(() => Math.random() - 0.5).join('')
}

// 重置表單
const resetForm = () => {
  formRef.value?.resetFields()
  passwordMode.value = 'manual'
  generatedPassword.value = ''
  createOptions.value = ['sendWelcomeEmail']
  accountCheckResult.value = null
}

// 返回上一頁
const goBack = () => {
  router.go(-1)
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
    
    const submitData = {
      ...form,
      passwordMode: passwordMode.value,
      generatedPassword: passwordMode.value === 'auto' ? generatedPassword.value : undefined,
      createOptions: createOptions.value
    }
    
    if (passwordMode.value !== 'manual') {
      delete submitData.password
      delete submitData.confirmPassword
    }
    
    // 這裡調用API創建用戶
    // await usersApi.createUser(submitData)
    
    // 模擬API請求
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    ElMessage.success('用戶創建成功！')
    
    // 如果是自動生成密碼，顯示密碼
    if (passwordMode.value === 'auto') {
      ElMessage.info({
        message: `生成的密碼是：${generatedPassword.value}`,
        duration: 0,
        showClose: true
      })
    }
    
    router.push('/users')
    
  } catch (error) {
    console.error('Failed to create user:', error)
    ElMessage.error('用戶創建失敗')
  } finally {
    submitting.value = false
  }
}

// 初始化生成密碼
generatePassword()
</script>

<style lang="scss" scoped>
.user-create {
  max-width: 800px;
  margin: 0 auto;
  
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
    
    .password-manual {
      .password-strength {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        
        .strength-bar {
          flex: 1;
          height: 6px;
          background: var(--el-border-color-light);
          border-radius: 3px;
          overflow: hidden;
          
          .strength-fill {
            height: 100%;
            transition: all 0.3s ease;
          }
          
          &.weak .strength-fill {
            background: #f56c6c;
          }
          
          &.medium .strength-fill {
            background: #e6a23c;
          }
          
          &.strong .strength-fill {
            background: #67c23a;
          }
        }
        
        .strength-text {
          font-size: 12px;
          font-weight: 500;
          min-width: 30px;
        }
      }
      
      .password-requirements {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        
        .requirement {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--el-text-color-placeholder);
          
          &.met {
            color: var(--el-color-success);
          }
          
          .el-icon {
            font-size: 14px;
          }
        }
      }
    }
    
    .password-auto,
    .password-email {
      .el-alert {
        margin-top: 12px;
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
}

// 響應式設計
@media (max-width: 768px) {
  .user-create {
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
      
      .password-requirements {
        flex-direction: column;
        gap: 8px;
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
  .user-create {
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