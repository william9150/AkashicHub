<template>
  <div class="resource-edit">
    <div v-if="loading" class="loading-container">
      <div class="d-flex justify-content-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">載入中...</span>
        </div>
      </div>
    </div>
    
    <div v-else-if="resource">
      <div class="page-header">
        <h2>編輯資源</h2>
        <p>修改資源 "{{ resource.name }}" 的配置信息</p>
      </div>

      <form
        ref="formRef"
        class="resource-form"
        @submit.prevent="handleSubmit"
      >
        <!-- 基本資訊 -->
        <div class="card form-section">
          <div class="card-header">
            <h5 class="card-title mb-0">基本資訊</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label" for="name">資源名稱 <span class="text-danger">*</span></label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.name }"
                placeholder="請輸入資源名稱"
                maxlength="100"
              />
              <div class="form-text">
                {{ form.name.length }}/100
              </div>
              <div v-if="errors.name" class="invalid-feedback">
                {{ errors.name }}
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label" for="resourceType">資源類型 <span class="text-danger">*</span></label>
              <select
                id="resourceType"
                v-model="form.resourceType"
                class="form-select"
                :class="{ 'is-invalid': errors.resourceType }"
              >
                <option value="">請選擇資源類型</option>
                <option
                  v-for="type in resourceTypes"
                  :key="type.value"
                  :value="type.value"
                >
                  {{ type.label }}
                </option>
              </select>
              <div v-if="errors.resourceType" class="invalid-feedback">
                {{ errors.resourceType }}
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label" for="ipAddress">IP地址 <span class="text-danger">*</span></label>
              <input
                id="ipAddress"
                v-model="form.ipAddress"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.ipAddress }"
                placeholder="請輸入IP地址，例如：192.168.1.100"
              />
              <div v-if="errors.ipAddress" class="invalid-feedback">
                {{ errors.ipAddress }}
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label" for="description">描述</label>
              <textarea
                id="description"
                v-model="form.description"
                class="form-control"
                :class="{ 'is-invalid': errors.description }"
                placeholder="請輸入資源描述"
                rows="3"
                maxlength="500"
              ></textarea>
              <div class="form-text">
                {{ form.description.length }}/500
              </div>
              <div v-if="errors.description" class="invalid-feedback">
                {{ errors.description }}
              </div>
            </div>
          </div>
        </div>

        <!-- 連接資訊 -->
        <div class="card form-section">
          <div class="card-header">
            <h5 class="card-title mb-0">連接資訊</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label" for="loginUser">登入用戶 <span class="text-danger">*</span></label>
              <input
                id="loginUser"
                v-model="form.loginUser"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.loginUser }"
                placeholder="請輸入登入用戶名"
              />
              <div v-if="errors.loginUser" class="invalid-feedback">
                {{ errors.loginUser }}
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label" for="loginPassword">登入密碼 <span class="text-danger">*</span></label>
              <div class="input-group">
                <input
                  id="loginPassword"
                  v-model="form.loginPassword"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  :class="{ 'is-invalid': errors.loginPassword }"
                  placeholder="請輸入登入密碼"
                />
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  @click="generatePassword"
                >
                  生成密碼
                </button>
              </div>
              <div v-if="errors.loginPassword" class="invalid-feedback">
                {{ errors.loginPassword }}
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label" for="port">端口 <span class="text-danger">*</span></label>
              <input
                id="port"
                v-model.number="form.port"
                type="number"
                class="form-control"
                :class="{ 'is-invalid': errors.port }"
                placeholder="端口號"
                min="1"
                max="65535"
              />
              <div v-if="errors.port" class="invalid-feedback">
                {{ errors.port }}
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label" for="protocol">連接協議 <span class="text-danger">*</span></label>
              <select
                id="protocol"
                v-model="form.protocol"
                class="form-select"
                :class="{ 'is-invalid': errors.protocol }"
              >
                <option value="">請選擇連接協議</option>
                <option value="ssh">SSH</option>
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
                <option value="ftp">FTP</option>
                <option value="rdp">RDP</option>
                <option value="mysql">MySQL</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="redis">Redis</option>
                <option value="other">其他</option>
              </select>
              <div v-if="errors.protocol" class="invalid-feedback">
                {{ errors.protocol }}
              </div>
            </div>
          </div>
        </div>

        <!-- 分類標籤 -->
        <div class="card form-section">
          <div class="card-header">
            <h5 class="card-title mb-0">分類標籤</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label" for="tags">標籤</label>
              <select
                id="tags"
                v-model="selectedTag"
                class="form-select"
                @change="addTag"
              >
                <option value="">請選擇標籤</option>
                <option
                  v-for="tag in availableTags"
                  :key="tag.id"
                  :value="tag.id"
                  :disabled="form.tags.includes(tag.id)"
                >
                  {{ tag.name }} ({{ tag.category }})
                </option>
              </select>
              
              <div class="selected-tags mt-3">
                <span
                  v-for="tagId in form.tags"
                  :key="tagId"
                  :class="getTagClass(getTagById(tagId)?.category)"
                  class="badge me-2 mb-2"
                >
                  {{ getTagById(tagId)?.name }}
                  <button
                    type="button"
                    class="btn-close btn-close-white ms-1"
                    @click="removeTag(tagId)"
                  ></button>
                </span>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label" for="customTagInput">自定義標籤</label>
              <div class="input-group">
                <input
                  id="customTagInput"
                  v-model="customTagInput"
                  type="text"
                  class="form-control"
                  placeholder="輸入自定義標籤，回車添加"
                  @keyup.enter="addCustomTag"
                />
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="addCustomTag"
                >
                  添加
                </button>
              </div>
              
              <div class="custom-tags mt-3">
                <span
                  v-for="(tag, index) in customTags"
                  :key="index"
                  class="badge bg-secondary me-2 mb-2"
                >
                  {{ tag }}
                  <button
                    type="button"
                    class="btn-close btn-close-white ms-1"
                    @click="removeCustomTag(index)"
                  ></button>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 額外配置 -->
        <div class="card form-section">
          <div class="card-header">
            <h5 class="card-title mb-0">額外配置</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">狀態</label>
              <div class="form-check-group">
                <div class="form-check">
                  <input
                    id="status-active"
                    v-model="form.status"
                    class="form-check-input"
                    type="radio"
                    value="active"
                  />
                  <label class="form-check-label" for="status-active">
                    正常
                  </label>
                </div>
                <div class="form-check">
                  <input
                    id="status-inactive"
                    v-model="form.status"
                    class="form-check-input"
                    type="radio"
                    value="inactive"
                  />
                  <label class="form-check-label" for="status-inactive">
                    停用
                  </label>
                </div>
                <div class="form-check">
                  <input
                    id="status-maintenance"
                    v-model="form.status"
                    class="form-check-input"
                    type="radio"
                    value="maintenance"
                  />
                  <label class="form-check-label" for="status-maintenance">
                    維護中
                  </label>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label" for="priority">重要程度</label>
              <input
                id="priority"
                v-model.number="form.priority"
                type="range"
                class="form-range"
                min="1"
                max="5"
                step="1"
              />
              <div class="d-flex justify-content-between small text-muted">
                <span>很低</span>
                <span>低</span>
                <span>中</span>
                <span>高</span>
                <span>很高</span>
              </div>
              <div class="form-text">
                當前選擇：{{ getPriorityLabel(form.priority) }}
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label" for="notes">備註</label>
              <textarea
                id="notes"
                v-model="form.notes"
                class="form-control"
                placeholder="請輸入備註資訊"
                rows="2"
                maxlength="200"
              ></textarea>
              <div class="form-text">
                {{ form.notes.length }}/200
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按鈕 -->
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="goBack">
            取消
          </button>
          <button type="button" class="btn btn-outline-secondary" @click="resetForm">
            重置
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="submitting"
          >
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
            保存更改
          </button>
        </div>
      </form>
    </div>
    
    <div v-else class="error-state">
      <div class="text-center py-5">
        <i class="bi bi-exclamation-triangle text-muted" style="font-size: 4rem;"></i>
        <h4 class="mt-3 text-muted">資源不存在或已被刪除</h4>
        <p class="text-muted">請檢查資源ID是否正確或聯繫管理員</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showAlert } from '@/utils/bootstrap-alerts'

// 路由
const route = useRoute()
const router = useRouter()

// 響應式數據
const formRef = ref<HTMLFormElement>()
const loading = ref(true)
const submitting = ref(false)
const resource = ref<any>(null)
const customTagInput = ref('')
const customTags = ref<string[]>([])
const selectedTag = ref<number | null>(null)
const showPassword = ref(false)
const errors = ref<Record<string, string>>({})

// 表單數據
const form = reactive({
  name: '',
  resourceType: '',
  ipAddress: '',
  description: '',
  loginUser: '',
  loginPassword: '',
  port: null as number | null,
  protocol: '',
  tags: [] as number[],
  status: 'active',
  priority: 3,
  notes: ''
})

// 資源類型選項
const resourceTypes = ref([
  {
    label: '伺服器',
    value: 'Server',
    icon: 'bi-server',
    color: '#0d6efd'
  },
  {
    label: '資料庫',
    value: 'Database',
    icon: 'bi-database',
    color: '#198754'
  },
  {
    label: '網站',
    value: 'Website',
    icon: 'bi-globe',
    color: '#fd7e14'
  },
  {
    label: '儲存',
    value: 'Storage',
    icon: 'bi-hdd',
    color: '#dc3545'
  },
  {
    label: '緩存',
    value: 'Cache',
    icon: 'bi-lightning',
    color: '#6610f2'
  }
])

// 可用標籤
const availableTags = ref([
  { id: 1, name: '生產環境', category: 'Environment' },
  { id: 2, name: '測試環境', category: 'Environment' },
  { id: 3, name: '開發環境', category: 'Environment' },
  { id: 4, name: '高優先級', category: 'Priority' },
  { id: 5, name: '中優先級', category: 'Priority' },
  { id: 6, name: '低優先級', category: 'Priority' },
  { id: 7, name: '前端', category: 'Department' },
  { id: 8, name: '後端', category: 'Department' },
  { id: 9, name: '數據庫', category: 'Department' },
  { id: 10, name: '運維', category: 'Department' }
])

// 重要程度標記
const priorityMarks = ref({
  1: '很低',
  2: '低',
  3: '中',
  4: '高',
  5: '很高'
})

// 表單驗證
const validateForm = () => {
  const newErrors: Record<string, string> = {}
  
  // 驗證資源名稱
  if (!form.name.trim()) {
    newErrors.name = '請輸入資源名稱'
  } else if (form.name.length < 2 || form.name.length > 100) {
    newErrors.name = '資源名稱長度在 2 到 100 個字符'
  }
  
  // 驗證資源類型
  if (!form.resourceType) {
    newErrors.resourceType = '請選擇資源類型'
  }
  
  // 驗證IP地址
  if (!form.ipAddress.trim()) {
    newErrors.ipAddress = '請輸入IP地址'
  } else {
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipPattern.test(form.ipAddress)) {
      newErrors.ipAddress = '請輸入有效的IP地址'
    }
  }
  
  // 驗證登入用戶
  if (!form.loginUser.trim()) {
    newErrors.loginUser = '請輸入登入用戶名'
  }
  
  // 驗證登入密碼
  if (!form.loginPassword.trim()) {
    newErrors.loginPassword = '請輸入登入密碼'
  } else if (form.loginPassword.length < 6 && form.loginPassword !== '******') {
    newErrors.loginPassword = '密碼長度至少 6 個字符'
  }
  
  // 驗證端口
  if (!form.port || form.port < 1 || form.port > 65535) {
    newErrors.port = '請輸入有效的端口號 (1-65535)'
  }
  
  // 驗證協議
  if (!form.protocol) {
    newErrors.protocol = '請選擇連接協議'
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}


// 獲取標籤類別
const getTagClass = (category: string) => {
  const typeMap: Record<string, string> = {
    Environment: 'bg-primary',
    Priority: 'bg-warning',
    Department: 'bg-success',
    Project: 'bg-info'
  }
  return typeMap[category] || 'bg-info'
}

// 獲取優先級標籤
const getPriorityLabel = (priority: number) => {
  const labels = {
    1: '很低',
    2: '低',
    3: '中',
    4: '高',
    5: '很高'
  }
  return labels[priority as keyof typeof labels] || '中'
}

// 根據ID獲取標籤
const getTagById = (id: number) => {
  return availableTags.value.find(tag => tag.id === id)
}

// 添加標籤
const addTag = () => {
  if (selectedTag.value && !form.tags.includes(selectedTag.value)) {
    form.tags.push(selectedTag.value)
    selectedTag.value = null
  }
}

// 移除標籤
const removeTag = (tagId: number) => {
  const index = form.tags.indexOf(tagId)
  if (index > -1) {
    form.tags.splice(index, 1)
  }
}

// 添加自定義標籤
const addCustomTag = () => {
  const tag = customTagInput.value.trim()
  if (tag && !customTags.value.includes(tag)) {
    customTags.value.push(tag)
    customTagInput.value = ''
  }
}

// 移除自定義標籤
const removeCustomTag = (index: number) => {
  customTags.value.splice(index, 1)
}

// 生成密碼
const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  form.loginPassword = password
  showAlert('密碼已生成', 'success')
}

// 重置表單
const resetForm = () => {
  if (resource.value) {
    fillForm(resource.value)
  }
}

// 填充表單
const fillForm = (data: any) => {
  form.name = data.name
  form.resourceType = data.resourceType
  form.ipAddress = data.ipAddress
  form.description = data.description || ''
  form.loginUser = data.loginUser
  form.loginPassword = '******' // 不顯示實際密碼
  form.port = data.port
  form.protocol = data.protocol
  form.tags = data.tags?.map((tag: any) => tag.id) || []
  form.status = data.status
  form.priority = data.priority || 3
  form.notes = data.notes || ''
  
  customTags.value = data.customTags || []
}

// 返回上一頁
const goBack = () => {
  router.go(-1)
}

// 提交表單
const handleSubmit = async () => {
  if (!validateForm()) {
    showAlert('請檢查表單輸入是否正確', 'error')
    return
  }
  
  try {
    submitting.value = true
    
    // 準備提交數據
    const submitData = {
      ...form,
      customTags: customTags.value
    }
    
    // 這裡調用API更新資源
    // await resourcesApi.updateResource(resource.value.id, submitData)
    
    // 模擬 API請求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    showAlert('資源更新成功！', 'success')
    router.push(`/resources/${resource.value.id}`)
    
  } catch (error) {
    console.error('Failed to update resource:', error)
    showAlert('資源更新失敗', 'error')
  } finally {
    submitting.value = false
  }
}

// 載入數據
const loadData = async () => {
  try {
    loading.value = true
    
    const id = route.params.id
    
    // 這裡調用API獲取資源詳情
    // const response = await resourcesApi.getResourceById(id)
    // resource.value = response
    
    // 模擬數據
    await new Promise(resolve => setTimeout(resolve, 500))
    
    resource.value = {
      id: 1,
      name: 'Web Server 01',
      resourceType: 'Server',
      ipAddress: '192.168.1.100',
      description: '主要的Web伺服器，處理前端請求',
      loginUser: 'admin',
      port: 22,
      protocol: 'ssh',
      status: 'active',
      priority: 4,
      notes: '重要的生產環境伺服器',
      tags: [
        { id: 1, name: '生產環境', category: 'Environment' },
        { id: 4, name: '高優先級', category: 'Priority' }
      ],
      customTags: ['Web服務', '負載均衡']
    }
    
    // 填充表單
    fillForm(resource.value)
    
  } catch (error) {
    console.error('Failed to load resource:', error)
    showAlert('載入資源失敗', 'error')
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
.resource-edit {
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
      color: var(--bs-gray-900);
    }
    
    p {
      margin: 0;
      color: var(--bs-gray-600);
    }
  }
  
  .resource-form {
    .form-section {
      margin-bottom: 24px;
    }
    
    
    
    .selected-tags {
      min-height: 40px;
      
      .badge {
        position: relative;
        padding-right: 24px;
        
        .btn-close {
          position: absolute;
          top: 50%;
          right: 4px;
          transform: translateY(-50%);
          font-size: 10px;
          width: 12px;
          height: 12px;
          background: none;
          border: none;
          opacity: 0.8;
          
          &:hover {
            opacity: 1;
          }
        }
      }
    }
    
    
    .custom-tags {
      min-height: 40px;
      
      .badge {
        position: relative;
        padding-right: 24px;
        
        .btn-close {
          position: absolute;
          top: 50%;
          right: 4px;
          transform: translateY(-50%);
          font-size: 10px;
          width: 12px;
          height: 12px;
          background: none;
          border: none;
          opacity: 0.8;
          
          &:hover {
            opacity: 1;
          }
        }
      }
    }
    
    .form-check-group {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      
      .form-check {
        margin-bottom: 0;
      }
    }
    
    .form-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 32px;
      padding: 24px;
      background: var(--bs-gray-50);
      border-radius: 8px;
    }
  }
  
  .error-state {
    padding: 40px;
    text-align: center;
  }
}

// 響應式設計
@media (max-width: 768px) {
  .resource-edit {
    max-width: 100%;
    padding: 0 16px;
    
    .resource-form {
      .form-check-group {
        flex-direction: column;
        gap: 10px;
      }
      
      .form-actions {
        flex-direction: column;
        
        .btn {
          width: 100%;
        }
      }
    }
  }
}

// 暗黑模式支援
@media (prefers-color-scheme: dark) {
  .resource-edit {
    .page-header {
      h2 {
        color: var(--bs-gray-100);
      }
      
      p {
        color: var(--bs-gray-300);
      }
    }
    
    .resource-form {
      .form-actions {
        background: var(--bs-gray-800);
      }
    }
  }
}
</style>