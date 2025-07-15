<template>
  <div class="tag-edit">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>
    
    <div v-else-if="tag">
      <div class="page-header">
        <h2>編輯標籤</h2>
        <p>修改標籤 "{{ tag.name }}" 的配置信息</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="tag-form"
      >
        <!-- 基本資訊 -->
        <el-card class="form-section" header="基本資訊">
          <el-form-item label="標籤名稱" prop="name">
            <el-input
              v-model="form.name"
              placeholder="請輸入標籤名稱"
              maxlength="50"
              show-word-limit
              @input="updatePreview"
            />
          </el-form-item>

          <el-form-item label="標籤分類" prop="category">
            <el-select
              v-model="form.category"
              placeholder="請選擇標籤分類"
              style="width: 100%"
              @change="updatePreview"
            >
              <el-option
                v-for="category in tagCategories"
                :key="category.value"
                :label="category.label"
                :value="category.value"
              >
                <div class="category-option">
                  <el-icon :color="category.color">
                    <component :is="category.icon" />
                  </el-icon>
                  <span>{{ category.label }}</span>
                  <span class="category-desc">{{ category.description }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="標籤描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              placeholder="請輸入標籤描述（可選）"
              :rows="3"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-card>

        <!-- 外觀設定 -->
        <el-card class="form-section" header="外觀設定">
          <el-form-item label="標籤顏色" prop="color">
            <div class="color-section">
              <el-color-picker
                v-model="form.color"
                show-alpha
                :predefine="predefineColors"
                @change="updatePreview"
              />
              <div class="color-presets">
                <div
                  v-for="color in predefineColors"
                  :key="color"
                  class="color-preset"
                  :class="{ active: form.color === color }"
                  :style="{ backgroundColor: color }"
                  @click="selectColor(color)"
                >
                </div>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="標籤預覽">
            <div class="tag-preview">
              <div class="preview-group">
                <span class="preview-label">常規樣式：</span>
                <el-tag
                  :color="form.color"
                  :type="getCategoryTagType(form.category)"
                  effect="light"
                >
                  {{ form.name || '標籤預覽' }}
                </el-tag>
              </div>
              
              <div class="preview-group">
                <span class="preview-label">深色樣式：</span>
                <el-tag
                  :color="form.color"
                  :type="getCategoryTagType(form.category)"
                  effect="dark"
                >
                  {{ form.name || '標籤預覽' }}
                </el-tag>
              </div>
              
              <div class="preview-group">
                <span class="preview-label">邊框樣式：</span>
                <el-tag
                  :color="form.color"
                  :type="getCategoryTagType(form.category)"
                  effect="plain"
                >
                  {{ form.name || '標籤預覽' }}
                </el-tag>
              </div>
            </div>
          </el-form-item>
        </el-card>

        <!-- 使用統計 -->
        <el-card class="form-section" header="使用統計">
          <div class="usage-stats">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-statistic
                  title="使用次數"
                  :value="tag.usageCount"
                  suffix="次"
                />
              </el-col>
              <el-col :span="8">
                <el-statistic
                  title="關聯資源"
                  :value="relatedResources.length"
                  suffix="個"
                />
              </el-col>
              <el-col :span="8">
                <el-statistic
                  title="創建時間"
                  :value="formatDate(tag.createdAt)"
                />
              </el-col>
            </el-row>
          </div>
          
          <el-divider />
          
          <div class="related-resources">
            <h4>使用此標籤的資源</h4>
            <div v-if="relatedResources.length > 0" class="resource-list">
              <div
                v-for="resource in relatedResources"
                :key="resource.id"
                class="resource-item"
                @click="goToResource(resource.id)"
              >
                <div class="resource-icon">
                  <el-icon :color="getResourceTypeColor(resource.resourceType)">
                    <component :is="getResourceTypeIcon(resource.resourceType)" />
                  </el-icon>
                </div>
                <div class="resource-content">
                  <div class="resource-name">{{ resource.name }}</div>
                  <div class="resource-type">{{ resource.resourceType }}</div>
                  <div class="resource-ip">{{ resource.ipAddress }}</div>
                </div>
              </div>
            </div>
            <div v-else class="empty-resources">
              <el-empty description="暫無資源使用此標籤" :image-size="80" />
            </div>
          </div>
        </el-card>

        <!-- 危險操作 -->
        <el-card class="form-section danger-section" header="危險操作">
          <el-alert
            title="注意"
            description="以下操作可能會影響到使用此標籤的所有資源，請謹慎操作。"
            type="warning"
            show-icon
            style="margin-bottom: 20px"
          />
          
          <div class="danger-actions">
            <el-button
              type="warning"
              icon="Promotion"
              @click="showMergeDialog"
              :disabled="tag.usageCount === 0"
            >
              合併到其他標籤
            </el-button>
            
            <el-button
              type="danger"
              icon="Delete"
              @click="handleDelete"
              :disabled="tag.usageCount > 0"
            >
              刪除標籤
            </el-button>
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
          >
            保存更改
          </el-button>
        </div>
      </el-form>
    </div>
    
    <div v-else class="error-state">
      <el-empty description="標籤不存在或已被刪除" />
    </div>

    <!-- 合併標籤對話框 -->
    <el-dialog
      v-model="mergeDialogVisible"
      title="合併標籤"
      width="500px"
    >
      <div class="merge-content">
        <el-alert
          title="合併說明"
          description="合併標籤將會把當前標籤的所有使用記錄轉移到目標標籤，當前標籤將被刪除。此操作不可恢復！"
          type="warning"
          show-icon
          style="margin-bottom: 20px"
        />
        
        <el-form label-width="100px">
          <el-form-item label="目標標籤：">
            <el-select
              v-model="mergeTargetTag"
              placeholder="選擇要合併到的標籤"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="option in availableTags"
                :key="option.id"
                :label="option.name"
                :value="option.id"
              >
                <div class="merge-option">
                  <el-tag :type="getCategoryTagType(option.category)" size="small">
                    {{ option.name }}
                  </el-tag>
                  <span class="option-category">{{ getCategoryLabel(option.category) }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="合併預覽：">
            <div class="merge-preview">
              <div class="merge-source">
                <el-tag :type="getCategoryTagType(tag.category)">
                  {{ tag.name }} ({{ tag.usageCount }} 次使用)
                </el-tag>
              </div>
              <el-icon class="merge-arrow"><ArrowRight /></el-icon>
              <div class="merge-target">
                <el-tag
                  v-if="mergeTargetTag && selectedTargetTag"
                  :type="getCategoryTagType(selectedTargetTag.category)"
                  effect="dark"
                >
                  {{ selectedTargetTag.name }} ({{ selectedTargetTag.usageCount + tag.usageCount }} 次使用)
                </el-tag>
                <span v-else class="placeholder">請選擇目標標籤</span>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <el-button @click="mergeDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="!mergeTargetTag"
          @click="confirmMerge"
        >
          確認合併
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Folder,
  Warning,
  User,
  Briefcase,
  Cpu,
  More,
  Promotion,
  Delete,
  ArrowRight,
  Monitor,
  Coin,
  Basketball,
  FolderOpened
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { format } from 'date-fns'

// 路由
const route = useRoute()
const router = useRouter()

// 響應式數據
const formRef = ref<FormInstance>()
const loading = ref(true)
const submitting = ref(false)
const tag = ref<any>(null)
const mergeDialogVisible = ref(false)
const mergeTargetTag = ref<number | null>(null)
const relatedResources = ref<any[]>([])
const availableTags = ref<any[]>([])

// 表單數據
const form = reactive({
  name: '',
  category: '',
  description: '',
  color: '#409eff'
})

// 標籤分類
const tagCategories = ref([
  {
    label: '環境',
    value: 'Environment',
    description: '開發、測試、生產等環境分類',
    icon: 'Folder',
    color: '#409eff'
  },
  {
    label: '優先級',
    value: 'Priority',
    description: '高、中、低等優先級分類',
    icon: 'Warning',
    color: '#e6a23c'
  },
  {
    label: '部門',
    value: 'Department',
    description: '前端、後端、運維等部門分類',
    icon: 'User',
    color: '#67c23a'
  },
  {
    label: '項目',
    value: 'Project',
    description: '專案相關的分類標籤',
    icon: 'Briefcase',
    color: '#722ed1'
  },
  {
    label: '技術',
    value: 'Technology',
    description: '技術棧、框架等技術分類',
    icon: 'Cpu',
    color: '#f56c6c'
  },
  {
    label: '其他',
    value: 'Other',
    description: '其他自定義分類',
    icon: 'More',
    color: '#909399'
  }
])

// 預定義顏色
const predefineColors = ref([
  '#409eff',
  '#67c23a',
  '#e6a23c',
  '#f56c6c',
  '#909399',
  '#722ed1',
  '#eb2f96',
  '#13c2c2',
  '#fa8c16',
  '#52c41a',
  '#1890ff',
  '#722ed1'
])

// 表單驗證規則
const rules: FormRules = {
  name: [
    { required: true, message: '請輸入標籤名稱', trigger: 'blur' },
    { min: 1, max: 50, message: '標籤名稱長度在 1 到 50 個字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value && /[<>"/\\&]/.test(value)) {
          callback(new Error('標籤名稱不能包含特殊字符'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  category: [
    { required: true, message: '請選擇標籤分類', trigger: 'change' }
  ],
  color: [
    { required: true, message: '請選擇標籤顏色', trigger: 'change' }
  ]
}

// 計算屬性
const selectedTargetTag = computed(() => {
  return availableTags.value.find(tag => tag.id === mergeTargetTag.value)
})

// 獲取分類標籤類型
const getCategoryTagType = (category: string) => {
  const typeMap: Record<string, string> = {
    Environment: 'primary',
    Priority: 'warning',
    Department: 'success',
    Project: 'info',
    Technology: 'danger',
    Other: ''
  }
  return typeMap[category] || ''
}

// 獲取分類標籤
const getCategoryLabel = (category: string) => {
  const labelMap: Record<string, string> = {
    Environment: '環境',
    Priority: '優先級',
    Department: '部門',
    Project: '項目',
    Technology: '技術',
    Other: '其他'
  }
  return labelMap[category] || category
}

// 獲取資源類型圖標
const getResourceTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    Server: 'Monitor',
    Database: 'Coin',
    Website: 'Basketball',
    Storage: 'FolderOpened',
    Cache: 'Basketball'
  }
  return iconMap[type] || 'Monitor'
}

// 獲取資源類型顏色
const getResourceTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    Server: '#409eff',
    Database: '#67c23a',
    Website: '#e6a23c',
    Storage: '#f56c6c',
    Cache: '#722ed1'
  }
  return colorMap[type] || '#909399'
}

// 格式化日期
const formatDate = (date: Date) => {
  return format(date, 'yyyy-MM-dd')
}

// 選擇顏色
const selectColor = (color: string) => {
  form.color = color
  updatePreview()
}

// 更新預覽
const updatePreview = () => {
  // 預覽更新邏輯
}

// 填充表單
const fillForm = (data: any) => {
  form.name = data.name
  form.category = data.category
  form.description = data.description || ''
  form.color = data.color
}

// 重置表單
const resetForm = () => {
  if (tag.value) {
    fillForm(tag.value)
  }
}

// 返回上一頁
const goBack = () => {
  router.go(-1)
}

// 前往資源頁面
const goToResource = (id: number) => {
  router.push(`/resources/${id}`)
}

// 顯示合併對話框
const showMergeDialog = () => {
  mergeTargetTag.value = null
  mergeDialogVisible.value = true
}

// 確認合併
const confirmMerge = async () => {
  if (!mergeTargetTag.value) {
    ElMessage.warning('請選擇目標標籤')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `確定要將標籤 "${tag.value.name}" 合併到 "${selectedTargetTag.value?.name}" 嗎？此操作不可恢復。`,
      '確認合併',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 這裡調用合併API
    // await tagsApi.mergeTag(tag.value.id, mergeTargetTag.value)
    
    ElMessage.success('標籤合併成功')
    mergeDialogVisible.value = false
    router.push('/tags')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('標籤合併失敗')
    }
  }
}

// 處理刪除
const handleDelete = async () => {
  if (tag.value.usageCount > 0) {
    ElMessage.warning('此標籤正在使用中，無法刪除')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `確定要刪除標籤 "${tag.value.name}" 嗎？此操作不可恢復。`,
      '確認刪除',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 這裡調用刪除API
    // await tagsApi.deleteTag(tag.value.id)
    
    ElMessage.success('刪除成功')
    router.push('/tags')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('刪除失敗')
    }
  }
}

// 提交表單
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    const submitData = { ...form }
    
    // 這裡調用API更新標籤
    // await tagsApi.updateTag(tag.value.id, submitData)
    
    // 模擬API請求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('標籤更新成功！')
    router.push('/tags')
    
  } catch (error) {
    console.error('Failed to update tag:', error)
    ElMessage.error('標籤更新失敗')
  } finally {
    submitting.value = false
  }
}

// 載入數據
const loadData = async () => {
  try {
    loading.value = true
    
    const id = route.params.id
    
    // 這裡調用API獲取標籤詳情
    // const [tagData, resourcesData, tagsData] = await Promise.all([
    //   tagsApi.getTagById(id),
    //   tagsApi.getTagResources(id),
    //   tagsApi.getTags()
    // ])
    
    // 模擬數據
    await new Promise(resolve => setTimeout(resolve, 500))
    
    tag.value = {
      id: 1,
      name: '生產環境',
      category: 'Environment',
      description: '生產環境相關資源',
      color: '#f56c6c',
      usageCount: 25,
      createdBy: 'admin',
      createdAt: new Date('2024-01-10T08:00:00')
    }
    
    relatedResources.value = [
      {
        id: 1,
        name: 'Web Server 01',
        resourceType: 'Server',
        ipAddress: '192.168.1.100'
      },
      {
        id: 2,
        name: 'MySQL Database',
        resourceType: 'Database',
        ipAddress: '192.168.1.101'
      }
    ]
    
    availableTags.value = [
      {
        id: 2,
        name: '測試環境',
        category: 'Environment',
        usageCount: 12
      },
      {
        id: 3,
        name: '開發環境',
        category: 'Environment',
        usageCount: 8
      }
    ]
    
    // 填充表單
    fillForm(tag.value)
    
  } catch (error) {
    console.error('Failed to load tag:', error)
    ElMessage.error('載入標籤失敗')
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
.tag-edit {
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
  
  .tag-form {
    .form-section {
      margin-bottom: 24px;
      
      :deep(.el-card__header) {
        background: var(--el-bg-color-page);
        font-weight: 600;
      }
      
      &.danger-section {
        :deep(.el-card__header) {
          background: #fef0f0;
          color: var(--el-color-danger);
        }
      }
    }
    
    .category-option {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      
      .el-icon {
        font-size: 16px;
      }
      
      .category-desc {
        margin-left: auto;
        font-size: 12px;
        color: var(--el-text-color-placeholder);
      }
    }
    
    .color-section {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .color-presets {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        
        .color-preset {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.3s ease;
          
          &:hover {
            transform: scale(1.1);
          }
          
          &.active {
            border-color: var(--el-color-primary);
            transform: scale(1.2);
          }
        }
      }
    }
    
    .tag-preview {
      .preview-group {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        
        .preview-label {
          font-size: 14px;
          color: var(--el-text-color-regular);
          min-width: 80px;
        }
      }
    }
    
    .usage-stats {
      margin-bottom: 20px;
    }
    
    .related-resources {
      h4 {
        margin: 0 0 16px 0;
        color: var(--el-text-color-primary);
      }
      
      .resource-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 12px;
        
        .resource-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid var(--el-border-color);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          
          &:hover {
            border-color: var(--el-color-primary);
            background-color: var(--el-bg-color-page);
          }
          
          .resource-icon {
            .el-icon {
              font-size: 18px;
            }
          }
          
          .resource-content {
            flex: 1;
            
            .resource-name {
              font-size: 14px;
              font-weight: 500;
              color: var(--el-text-color-primary);
              margin-bottom: 2px;
            }
            
            .resource-type {
              font-size: 12px;
              color: var(--el-text-color-regular);
              margin-bottom: 2px;
            }
            
            .resource-ip {
              font-size: 12px;
              color: var(--el-text-color-placeholder);
              font-family: monospace;
            }
          }
        }
      }
      
      .empty-resources {
        text-align: center;
        padding: 40px;
      }
    }
    
    .danger-actions {
      display: flex;
      gap: 12px;
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
.merge-content {
  .merge-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    
    .option-category {
      font-size: 12px;
      color: var(--el-text-color-placeholder);
    }
  }
  
  .merge-preview {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: var(--el-bg-color-page);
    border-radius: 8px;
    
    .merge-arrow {
      font-size: 20px;
      color: var(--el-color-primary);
    }
    
    .placeholder {
      color: var(--el-text-color-placeholder);
      font-style: italic;
    }
  }
}

// 響應式設計
@media (max-width: 768px) {
  .tag-edit {
    max-width: 100%;
    padding: 0 16px;
    
    .tag-form {
      .color-section {
        flex-direction: column;
        align-items: flex-start;
        
        .color-presets {
          width: 100%;
        }
      }
      
      .related-resources {
        .resource-list {
          grid-template-columns: 1fr;
        }
      }
      
      .danger-actions {
        flex-direction: column;
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
  .tag-edit {
    .page-header {
      h2 {
        color: var(--el-text-color-primary);
      }
    }
    
    .tag-form {
      .form-section {
        :deep(.el-card__header) {
          background: var(--el-bg-color-page);
        }
        
        &.danger-section {
          :deep(.el-card__header) {
            background: #2d1b1b;
            color: var(--el-color-danger);
          }
        }
      }
      
      .form-actions {
        background: var(--el-bg-color-page);
      }
    }
    
    .merge-content {
      .merge-preview {
        background: var(--el-bg-color-page);
      }
    }
  }
}
</style>