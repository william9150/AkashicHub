<template>
  <div class="user-edit">
    <div class="container-fluid">
      <!-- 載入中 -->
      <div v-if="loading" class="loading-container">
        <div class="d-flex justify-content-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">載入中...</span>
          </div>
        </div>
      </div>
      
      <!-- 編輯用戶 -->
      <div v-else-if="user" class="row">
        <div class="col-12">
          <div class="page-header mb-4">
            <h2>編輯用戶</h2>
            <p class="text-muted">修改用戶 "{{ user.displayName }}" 的配置信息</p>
          </div>

          <form @submit.prevent="handleSubmit">
            <!-- 基本資訊 -->
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="card-title mb-0">基本資訊</h5>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">登入帳號</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="form.loginAccount"
                      placeholder="請輸入登入帳號"
                      maxlength="50"
                      :disabled="!canEditAccount"
                      @blur="checkAccountAvailability"
                    >
                    <div v-if="accountCheckResult" class="account-check-result mt-2">
                      <small :class="accountCheckResult.available ? 'text-success' : 'text-danger'">
                        <i :class="accountCheckResult.available ? 'bi bi-check-circle' : 'bi bi-x-circle'"></i>
                        {{ accountCheckResult.message }}
                      </small>
                    </div>
                    <div v-if="!canEditAccount" class="field-disabled-hint mt-2">
                      <small class="text-muted">
                        <i class="bi bi-info-circle"></i>
                        管理員帳號不允許修改登入帳號
                      </small>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">用戶名稱</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="form.displayName"
                      placeholder="請輸入用戶顯示名稱"
                      maxlength="100"
                      required
                    >
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">電子郵件</label>
                    <input
                      type="email"
                      class="form-control"
                      v-model="form.email"
                      placeholder="請輸入電子郵件地址"
                      maxlength="255"
                      required
                    >
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">部門</label>
                    <select class="form-select" v-model="form.department" required>
                      <option value="">請選擇部門</option>
                      <option v-for="dept in departments" :key="dept" :value="dept">
                        {{ dept }}
                      </option>
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">手機號碼</label>
                    <input
                      type="tel"
                      class="form-control"
                      v-model="form.phone"
                      placeholder="請輸入手機號碼（可選）"
                      maxlength="20"
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- 權限設定 -->
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="card-title mb-0">權限設定</h5>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="form-label">用戶角色</label>
                    <div class="role-options" :class="{ 'disabled': !canEditRole }">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="radio"
                          id="roleUser"
                          value="User"
                          v-model="form.role"
                          :disabled="!canEditRole"
                        >
                        <label class="form-check-label" for="roleUser">
                          <div class="role-option">
                            <div class="role-header">
                              <i class="bi bi-person text-success"></i>
                              <span class="role-name">普通用戶</span>
                            </div>
                            <div class="role-desc">可以查看和使用系統資源，但無法進行管理操作</div>
                          </div>
                        </label>
                      </div>
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="radio"
                          id="roleAdmin"
                          value="Admin"
                          v-model="form.role"
                          :disabled="!canEditRole"
                        >
                        <label class="form-check-label" for="roleAdmin">
                          <div class="role-option">
                            <div class="role-header">
                              <i class="bi bi-person-fill text-danger"></i>
                              <span class="role-name">管理員</span>
                            </div>
                            <div class="role-desc">擁有完整的系統管理權限，可以管理用戶、資源等</div>
                          </div>
                        </label>
                      </div>
                    </div>
                    <div v-if="!canEditRole" class="field-disabled-hint mt-2">
                      <small class="text-muted">
                        <i class="bi bi-info-circle"></i>
                        {{ roleEditDisabledReason }}
                      </small>
                    </div>
                  </div>

                  <div class="col-12">
                    <label class="form-label">帳號狀態</label>
                    <div class="status-options" :class="{ 'disabled': !canEditStatus }">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="radio"
                          id="statusActive"
                          value="active"
                          v-model="form.status"
                          :disabled="!canEditStatus"
                        >
                        <label class="form-check-label" for="statusActive">
                          <span class="badge bg-success me-2">啟用</span>
                          用戶可以正常登入和使用系統
                        </label>
                      </div>
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="radio"
                          id="statusInactive"
                          value="inactive"
                          v-model="form.status"
                          :disabled="!canEditStatus"
                        >
                        <label class="form-check-label" for="statusInactive">
                          <span class="badge bg-secondary me-2">停用</span>
                          用戶無法登入系統
                        </label>
                      </div>
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="radio"
                          id="statusLocked"
                          value="locked"
                          v-model="form.status"
                          :disabled="!canEditStatus"
                        >
                        <label class="form-check-label" for="statusLocked">
                          <span class="badge bg-warning me-2">鎖定</span>
                          帳號被系統鎖定
                        </label>
                      </div>
                    </div>
                    <div v-if="!canEditStatus" class="field-disabled-hint mt-2">
                      <small class="text-muted">
                        <i class="bi bi-info-circle"></i>
                        無法修改自己的帳號狀態
                      </small>
                    </div>
                  </div>

                  <div class="col-12">
                    <label class="form-label">權限預覽</label>
                    <div class="permissions-preview">
                      <div class="permission-group">
                        <h6>資源管理</h6>
                        <ul class="list-unstyled">
                          <li>
                            <i :class="form.role === 'Admin' ? 'bi bi-check-circle text-success' : 'bi bi-eye text-warning'"></i>
                            {{ form.role === 'Admin' ? '完整管理權限' : '僅查看權限' }}
                          </li>
                        </ul>
                      </div>
                      <div class="permission-group">
                        <h6>用戶群</h6>
                        <ul class="list-unstyled">
                          <li>
                            <i :class="form.role === 'Admin' ? 'bi bi-check-circle text-success' : 'bi bi-x-circle text-danger'"></i>
                            {{ form.role === 'Admin' ? '可以管理其他用戶' : '無權限' }}
                          </li>
                        </ul>
                      </div>
                      <div class="permission-group">
                        <h6>系統設定</h6>
                        <ul class="list-unstyled">
                          <li>
                            <i :class="form.role === 'Admin' ? 'bi bi-check-circle text-success' : 'bi bi-x-circle text-danger'"></i>
                            {{ form.role === 'Admin' ? '可以修改系統設定' : '無權限' }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 安全設定 -->
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="card-title mb-0">安全設定</h5>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="form-label">密碼操作</label>
                    <div class="password-actions">
                      <button
                        type="button"
                        class="btn btn-warning me-2"
                        @click="showResetPasswordDialog"
                      >
                        <i class="bi bi-key me-1"></i>
                        重置密碼
                      </button>
                      <button
                        type="button"
                        class="btn btn-info"
                        @click="handleForcePasswordChange"
                      >
                        <i class="bi bi-arrow-clockwise me-1"></i>
                        強制下次登入修改密碼
                      </button>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">雙重驗證</label>
                    <div class="form-check form-switch">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        id="twoFactorEnabled"
                        v-model="form.twoFactorEnabled"
                      >
                      <label class="form-check-label" for="twoFactorEnabled">
                        {{ form.twoFactorEnabled ? '啟用' : '停用' }}
                      </label>
                    </div>
                    <div class="field-hint mt-2">
                      <small class="text-muted">
                        啟用後用戶登入時需要提供額外的驗證碼
                      </small>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">登入限制</label>
                    <div class="input-group">
                      <input
                        type="number"
                        class="form-control"
                        v-model="form.maxFailedLogins"
                        min="0"
                        max="10"
                        style="max-width: 150px"
                      >
                      <span class="input-group-text">次失敗登入後鎖定帳號</span>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">會話超時</label>
                    <select class="form-select" v-model="form.sessionTimeout" style="max-width: 200px">
                      <option value="30">30分鐘</option>
                      <option value="60">1小時</option>
                      <option value="120">2小時</option>
                      <option value="240">4小時</option>
                      <option value="480">8小時</option>
                      <option value="-1">永不過期</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- 其他設定 -->
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="card-title mb-0">其他設定</h5>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="form-label">備註</label>
                    <textarea
                      class="form-control"
                      v-model="form.notes"
                      placeholder="可以添加關於此用戶的備註信息（可選）"
                      rows="3"
                      maxlength="500"
                    ></textarea>
                  </div>

                  <div class="col-12">
                    <label class="form-label">通知設定</label>
                    <div class="notification-options">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="notifyEmail"
                          value="email"
                          v-model="form.notifications"
                        >
                        <label class="form-check-label" for="notifyEmail">
                          電子郵件通知
                        </label>
                      </div>
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="notifySystem"
                          value="system"
                          v-model="form.notifications"
                        >
                        <label class="form-check-label" for="notifySystem">
                          系統內通知
                        </label>
                      </div>
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="notifySecurity"
                          value="security"
                          v-model="form.notifications"
                        >
                        <label class="form-check-label" for="notifySecurity">
                          安全警報
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 修改歷史 -->
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="card-title mb-0">修改歷史</h5>
              </div>
              <div class="card-body">
                <div class="history-info">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <div class="history-item">
                        <label class="form-label">創建時間：</label>
                        <span>{{ formatDateTime(user.createdAt) }}</span>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="history-item">
                        <label class="form-label">創建者：</label>
                        <span>{{ user.createdBy }}</span>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="history-item">
                        <label class="form-label">最後修改：</label>
                        <span>{{ formatDateTime(user.updatedAt) }}</span>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="history-item">
                        <label class="form-label">修改者：</label>
                        <span>{{ user.updatedBy || '系統' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 操作按鈕 -->
            <div class="form-actions">
              <button type="button" class="btn btn-secondary me-2" @click="goBack">
                取消
              </button>
              <button type="button" class="btn btn-outline-primary me-2" @click="resetForm">
                重置
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="!hasChanges || submitting"
              >
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ submitting ? '保存中...' : '保存更改' }}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- 錯誤狀態 -->
      <div v-else class="error-state">
        <div class="text-center py-5">
          <i class="bi bi-exclamation-triangle fs-1 text-warning"></i>
          <p class="mt-3 text-muted">用戶不存在或已被刪除</p>
        </div>
      </div>

      <!-- 重置密碼對話框 -->
      <div class="modal fade" id="resetPasswordModal" tabindex="-1" aria-labelledby="resetPasswordModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="resetPasswordModalLabel">重置密碼</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="alert alert-warning" role="alert">
                <i class="bi bi-exclamation-triangle me-2"></i>
                確定要重置用戶 '{{ user?.displayName }}' 的密碼嗎？
              </div>
              
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">新密碼：</label>
                  <input
                    type="password"
                    class="form-control"
                    v-model="newPassword"
                    placeholder="留空則自動生成"
                  >
                </div>
                <div class="col-12">
                  <button type="button" class="btn btn-outline-secondary" @click="generatePassword">
                    生成隨機密碼
                  </button>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
              <button
                type="button"
                class="btn btn-primary"
                :disabled="resetPasswordLoading"
                @click="confirmResetPassword"
              >
                <span v-if="resetPasswordLoading" class="spinner-border spinner-border-sm me-2"></span>
                {{ resetPasswordLoading ? '重置中...' : '確認重置' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showAlert, showConfirm } from '@/utils/bootstrap-alerts'
import { useAuthStore } from '@/stores/auth'
import { format } from 'date-fns'

// 狀態管理
const authStore = useAuthStore()

// 路由
const route = useRoute()
const router = useRouter()

// 響應式數據
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

// 表單驗證（基本驗證）
const validateForm = () => {
  if (!form.loginAccount) {
    showAlert('請輸入登入帳號', 'error')
    return false
  }
  if (!form.displayName) {
    showAlert('請輸入用戶名稱', 'error')
    return false
  }
  if (!form.email) {
    showAlert('請輸入電子郵件', 'error')
    return false
  }
  if (!form.department) {
    showAlert('請選擇部門', 'error')
    return false
  }
  if (!form.role) {
    showAlert('請選擇用戶角色', 'error')
    return false
  }
  if (!form.status) {
    showAlert('請選擇帳號狀態', 'error')
    return false
  }
  return true
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
const goBack = async () => {
  if (hasChanges.value) {
    const confirmed = await showConfirm(
      '您有未保存的更改，確定要離開嗎？',
      '確認離開',
      {
        confirmText: '確定',
        cancelText: '取消',
        type: 'warning'
      }
    )
    if (confirmed) {
      router.go(-1)
    }
  } else {
    router.go(-1)
  }
}

// 顯示重置密碼對話框
const showResetPasswordDialog = () => {
  newPassword.value = ''
  const modal = new (window as any).bootstrap.Modal(document.getElementById('resetPasswordModal'))
  modal.show()
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
    
    showAlert('密碼重置成功', 'success')
    const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('resetPasswordModal'))
    modal.hide()
    
    if (!newPassword.value) {
      showAlert('新密碼已發送到用戶郵箱', 'info')
    }
  } catch (error) {
    showAlert('密碼重置失敗', 'error')
  } finally {
    resetPasswordLoading.value = false
  }
}

// 處理強制修改密碼
const handleForcePasswordChange = async () => {
  try {
    const confirmed = await showConfirm(
      '確定要強制用戶在下次登入時修改密碼嗎？',
      '確認操作',
      {
        confirmText: '確定',
        cancelText: '取消',
        type: 'warning'
      }
    )
    
    if (!confirmed) return
    
    // 這裡調用API設置強制修改密碼標記
    // await usersApi.forcePasswordChange(user.value.id)
    
    showAlert('設定成功，用戶下次登入時需要修改密碼', 'success')
  } catch (error) {
    showAlert('設定失敗', 'error')
  }
}

// 提交表單
const handleSubmit = async () => {
  if (!validateForm()) return
  
  try {
    if (accountCheckResult.value && !accountCheckResult.value.available) {
      showAlert('請修正帳號可用性問題', 'error')
      return
    }
    
    submitting.value = true
    
    const submitData = { ...form }
    
    // 這裡調用API更新用戶
    // await usersApi.updateUser(user.value.id, submitData)
    
    // 模擬API請求
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    showAlert('用戶更新成功！', 'success')
    
    // 更新原始數據
    originalForm.value = { ...form }
    
    router.push(`/users/${user.value.id}`)
    
  } catch (error) {
    console.error('Failed to update user:', error)
    showAlert('用戶更新失敗', 'error')
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
    showAlert('載入用戶失敗', 'error')
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
  padding: 1rem;
  
  .loading-container {
    padding: 2rem;
  }
  
  .page-header {
    h2 {
      color: var(--bs-primary);
      margin-bottom: 0.5rem;
    }
    
    p {
      color: var(--bs-gray-600);
    }
  }
  
  .account-check-result {
    i {
      margin-right: 0.25rem;
    }
  }
  
  .field-disabled-hint,
  .field-hint {
    i {
      margin-right: 0.25rem;
    }
  }
  
  .role-options,
  .status-options {
    &.disabled {
      opacity: 0.6;
      pointer-events: none;
    }
    
    .form-check {
      margin-bottom: 1rem;
      
      .form-check-label {
        cursor: pointer;
      }
    }
  }
  
  .role-option {
    .role-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
      
      .role-name {
        font-weight: 500;
      }
    }
    
    .role-desc {
      font-size: 0.875rem;
      color: var(--bs-gray-600);
      margin-left: 1.5rem;
    }
  }
  
  .permissions-preview {
    padding: 1rem;
    background: var(--bs-gray-50);
    border-radius: 0.5rem;
    border: 1px solid var(--bs-border-color);
    
    .permission-group {
      margin-bottom: 1rem;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      h6 {
        margin-bottom: 0.5rem;
        color: var(--bs-gray-800);
      }
      
      ul {
        li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--bs-gray-700);
        }
      }
    }
  }
  
  .password-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  
  .notification-options {
    .form-check {
      margin-bottom: 0.5rem;
    }
  }
  
  .history-info {
    .history-item {
      margin-bottom: 0.75rem;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      label {
        font-weight: 500;
        color: var(--bs-gray-800);
        margin-bottom: 0.25rem;
      }
      
      span {
        color: var(--bs-gray-600);
      }
    }
  }
  
  .form-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
    padding: 1.5rem;
    background: var(--bs-gray-50);
    border-radius: 0.5rem;
  }
  
  .error-state {
    padding: 2rem;
    text-align: center;
  }
}

// 響應式設計
@media (max-width: 768px) {
  .user-edit {
    .role-option {
      .role-desc {
        margin-left: 0;
        margin-top: 0.25rem;
      }
    }
    
    .password-actions {
      flex-direction: column;
    }
    
    .form-actions {
      flex-direction: column;
      
      .btn {
        width: 100%;
      }
    }
  }
}

// 暗黑模式
@media (prefers-color-scheme: dark) {
  .user-edit {
    .permissions-preview {
      background: var(--bs-gray-800);
      border-color: var(--bs-gray-700);
    }
    
    .form-actions {
      background: var(--bs-gray-800);
    }
  }
}
</style>