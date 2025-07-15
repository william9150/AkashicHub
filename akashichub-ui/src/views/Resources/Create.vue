<template>
  <div class="resource-create">
    <div class="page-header">
      <h2>新增資源</h2>
      <p>添加新的IT資源到系統中</p>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      class="resource-form"
    >
      <!-- 基本資訊 -->
      <el-card class="form-section" header="基本資訊">
        <el-form-item label="資源名稱" prop="name">
          <el-input
            v-model="form.name"
            placeholder="請輸入資源名稱"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="資源類型" prop="resourceType">
          <el-select
            v-model="form.resourceType"
            placeholder="請選擇資源類型"
            style="width: 100%"
          >
            <el-option
              v-for="type in resourceTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            >
              <div class="resource-type-option">
                <el-icon :color="type.color">
                  <component :is="type.icon" />
                </el-icon>
                <span>{{ type.label }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="IP地址" prop="ipAddress">
          <el-input
            v-model="form.ipAddress"
            placeholder="請輸入IP地址，例如：192.168.1.100"
          />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="請輸入資源描述"
            :rows="3"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-card>

      <!-- 連接資訊 -->
      <el-card class="form-section" header="連接資訊">
        <el-form-item label="登入用戶" prop="loginUser">
          <el-input
            v-model="form.loginUser"
            placeholder="請輸入登入用戶名"
          />
        </el-form-item>

        <el-form-item label="登入密碼" prop="loginPassword">
          <el-input
            v-model="form.loginPassword"
            type="password"
            placeholder="請輸入登入密碼"
            show-password
          />
        </el-form-item>

        <el-form-item label="端口" prop="port">
          <el-input-number
            v-model="form.port"
            placeholder="端口號"
            :min="1"
            :max="65535"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="連接協議" prop="protocol">
          <el-select
            v-model="form.protocol"
            placeholder="請選擇連接協議"
            style="width: 100%"
          >
            <el-option label="SSH" value="ssh" />
            <el-option label="HTTP" value="http" />
            <el-option label="HTTPS" value="https" />
            <el-option label="FTP" value="ftp" />
            <el-option label="RDP" value="rdp" />
            <el-option label="MySQL" value="mysql" />
            <el-option label="PostgreSQL" value="postgresql" />
            <el-option label="Redis" value="redis" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
      </el-card>

      <!-- 分類標籤 -->
      <el-card class="form-section" header="分類標籤">
        <el-form-item label="標籤" prop="tags">
          <div class="tags-section">
            <el-select
              v-model="form.tags"
              placeholder="請選擇標籤"
              multiple
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="tag in availableTags"
                :key="tag.id"
                :label="tag.name"
                :value="tag.id"
              >
                <div class="tag-option">
                  <el-tag :type="getTagType(tag.category)" size="small">
                    {{ tag.name }}
                  </el-tag>
                  <span class="tag-category">{{ tag.category }}</span>
                </div>
              </el-option>
            </el-select>
            
            <div class="selected-tags">
              <el-tag
                v-for="tagId in form.tags"
                :key="tagId"
                :type="getTagType(getTagById(tagId)?.category)"
                closable
                @close="removeTag(tagId)"
              >
                {{ getTagById(tagId)?.name }}
              </el-tag>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="自定義標籤">
          <div class="custom-tags-section">
            <el-input
              v-model="customTagInput"
              placeholder="輸入自定義標籤，回車添加"
              @keyup.enter="addCustomTag"
            >
              <template #append>
                <el-button @click="addCustomTag">添加</el-button>
              </template>
            </el-input>
            
            <div class="custom-tags">
              <el-tag
                v-for="(tag, index) in customTags"
                :key="index"
                type="info"
                closable
                @close="removeCustomTag(index)"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </el-form-item>
      </el-card>

      <!-- 額外配置 -->
      <el-card class="form-section" header="額外配置">
        <el-form-item label="狀態" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="active">正常</el-radio>
            <el-radio value="inactive">停用</el-radio>
            <el-radio value="maintenance">維護中</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="重要程度" prop="priority">
          <el-slider
            v-model="form.priority"
            :min="1"
            :max="5"
            :marks="priorityMarks"
            show-tooltip
            style="width: 300px"
          />
        </el-form-item>

        <el-form-item label="備註" prop="notes">
          <el-input
            v-model="form.notes"
            type="textarea"
            placeholder="請輸入備註資訊"
            :rows="2"
            maxlength="200"
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
        >
          保存
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Monitor,
  Coin,
  Basketball,
  FolderOpened
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

// 路由
const router = useRouter()

// 響應式數據
const formRef = ref<FormInstance>()
const submitting = ref(false)
const customTagInput = ref('')
const customTags = ref<string[]>([])

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
    icon: 'Monitor',
    color: '#409eff'
  },
  {
    label: '資料庫',
    value: 'Database',
    icon: 'Coin',
    color: '#67c23a'
  },
  {
    label: '網站',
    value: 'Website',
    icon: 'Basketball',
    color: '#e6a23c'
  },
  {
    label: '儲存',
    value: 'Storage',
    icon: 'FolderOpened',
    color: '#f56c6c'
  },
  {
    label: '緩存',
    value: 'Cache',
    icon: 'Basketball',
    color: '#722ed1'
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

// 表單驗證規則
const rules: FormRules = {
  name: [
    { required: true, message: '請輸入資源名稱', trigger: 'blur' },
    { min: 2, max: 100, message: '資源名稱長度在 2 到 100 個字符', trigger: 'blur' }
  ],
  resourceType: [
    { required: true, message: '請選擇資源類型', trigger: 'change' }
  ],
  ipAddress: [
    { required: true, message: '請輸入IP地址', trigger: 'blur' },
    {
      pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      message: '請輸入有效的IP地址',
      trigger: 'blur'
    }
  ],
  loginUser: [
    { required: true, message: '請輸入登入用戶名', trigger: 'blur' }
  ],
  loginPassword: [
    { required: true, message: '請輸入登入密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度至少 6 個字符', trigger: 'blur' }
  ],
  port: [
    { required: true, message: '請輸入端口號', trigger: 'blur' }
  ],
  protocol: [
    { required: true, message: '請選擇連接協議', trigger: 'change' }
  ]
}

// 獲取標籤類型
const getTagType = (category: string) => {
  const typeMap: Record<string, string> = {
    Environment: 'primary',
    Priority: 'warning',
    Department: 'success',
    Project: 'info'
  }
  return typeMap[category] || 'info'
}

// 根據ID獲取標籤
const getTagById = (id: number) => {
  return availableTags.value.find(tag => tag.id === id)
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

// 重置表單
const resetForm = () => {
  formRef.value?.resetFields()
  customTags.value = []
  customTagInput.value = ''
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
    submitting.value = true
    
    // 準備提交數據
    const submitData = {
      ...form,
      customTags: customTags.value
    }
    
    // 這裡調用API創建資源
    // await resourcesApi.createResource(submitData)
    
    // 模擬API請求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('資源創建成功！')
    router.push('/resources')
    
  } catch (error) {
    console.error('Failed to create resource:', error)
    ElMessage.error('資源創建失敗')
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.resource-create {
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
  
  .resource-form {
    .form-section {
      margin-bottom: 24px;
      
      :deep(.el-card__header) {
        background: var(--el-bg-color-page);
        font-weight: 600;
      }
    }
    
    .resource-type-option {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .el-icon {
        font-size: 16px;
      }
    }
    
    .tags-section {
      .selected-tags {
        margin-top: 12px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    }
    
    .tag-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      
      .tag-category {
        font-size: 12px;
        color: var(--el-text-color-placeholder);
      }
    }
    
    .custom-tags-section {
      .custom-tags {
        margin-top: 12px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
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
  .resource-create {
    max-width: 100%;
    padding: 0 16px;
    
    .resource-form {
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
  .resource-create {
    .page-header {
      h2 {
        color: var(--el-text-color-primary);
      }
    }
    
    .resource-form {
      .form-section {
        :deep(.el-card__header) {
          background: var(--el-bg-color-page);
        }
      }
      
      .form-actions {
        background: var(--el-bg-color-page);
      }
    }
  }
}
</style>