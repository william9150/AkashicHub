<template>
  <div class="tag-edit">
    <div v-if="loading" class="loading-container">
      <div class="d-flex justify-content-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">載入中...</span>
        </div>
      </div>
      <div class="placeholder-glow mt-3">
        <div class="placeholder col-12 mb-2"></div>
        <div class="placeholder col-8 mb-2"></div>
        <div class="placeholder col-10 mb-2"></div>
        <div class="placeholder col-6 mb-2"></div>
        <div class="placeholder col-9 mb-2"></div>
        <div class="placeholder col-7"></div>
      </div>
    </div>
    
    <div v-else-if="tag">
      <div class="page-header">
        <h2>編輯標籤</h2>
        <p>修改標籤 "{{ tag.name }}" 的配置信息</p>
      </div>

      <form ref="formRef" class="tag-form" @submit.prevent="handleSubmit">
        <!-- 基本資訊 -->
        <div class="card form-section">
          <div class="card-header">
            <h5 class="card-title mb-0">基本資訊</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label for="tagName" class="form-label">標籤名稱 <span class="text-danger">*</span></label>
              <input
                id="tagName"
                v-model="form.name"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.name }"
                placeholder="請輸入標籤名稱"
                maxlength="50"
                @input="updatePreview"
              />
              <div class="form-text">{{ form.name.length }}/50</div>
              <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
            </div>

            <div class="mb-3">
              <label for="tagCategory" class="form-label">標籤分類 <span class="text-danger">*</span></label>
              <select
                id="tagCategory"
                v-model="form.category"
                class="form-select"
                :class="{ 'is-invalid': errors.category }"
                @change="updatePreview"
              >
                <option value="">請選擇標籤分類</option>
                <option
                  v-for="category in tagCategories"
                  :key="category.value"
                  :value="category.value"
                >
                  {{ category.label }} - {{ category.description }}
                </option>
              </select>
              <div v-if="errors.category" class="invalid-feedback">{{ errors.category }}</div>
            </div>

            <div class="mb-3">
              <label for="tagDescription" class="form-label">標籤描述</label>
              <textarea
                id="tagDescription"
                v-model="form.description"
                class="form-control"
                placeholder="請輸入標籤描述（可選）"
                rows="3"
                maxlength="200"
              ></textarea>
              <div class="form-text">{{ form.description.length }}/200</div>
            </div>
          </div>
        </div>

        <!-- 外觀設定 -->
        <div class="card form-section">
          <div class="card-header">
            <h5 class="card-title mb-0">外觀設定</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label for="tagColor" class="form-label">標籤顏色 <span class="text-danger">*</span></label>
              <div class="color-section">
                <input
                  id="tagColor"
                  v-model="form.color"
                  type="color"
                  class="form-control form-control-color"
                  :class="{ 'is-invalid': errors.color }"
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
              <div v-if="errors.color" class="invalid-feedback">{{ errors.color }}</div>
            </div>

            <div class="mb-3">
              <label class="form-label">標籤預覽</label>
              <div class="tag-preview">
                <div class="preview-group">
                  <span class="preview-label">常規樣式：</span>
                  <span
                    class="badge"
                    :class="getBadgeClass('light')"
                    :style="{ backgroundColor: form.color, borderColor: form.color }"
                  >
                    {{ form.name || '標籤預覽' }}
                  </span>
                </div>
                
                <div class="preview-group">
                  <span class="preview-label">深色樣式：</span>
                  <span
                    class="badge"
                    :class="getBadgeClass('dark')"
                    :style="{ backgroundColor: form.color, borderColor: form.color }"
                  >
                    {{ form.name || '標籤預覽' }}
                  </span>
                </div>
                
                <div class="preview-group">
                  <span class="preview-label">邊框樣式：</span>
                  <span
                    class="badge border"
                    :class="getBadgeClass('outline')"
                    :style="{ color: form.color, borderColor: form.color }"
                  >
                    {{ form.name || '標籤預覽' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 使用統計 -->
        <div class="card form-section">
          <div class="card-header">
            <h5 class="card-title mb-0">使用統計</h5>
          </div>
          <div class="card-body">
            <div class="usage-stats">
              <div class="row g-3">
                <div class="col-md-4">
                  <div class="statistic-card">
                    <div class="statistic-title">使用次數</div>
                    <div class="statistic-value">{{ tag.usageCount }} <small class="text-muted">次</small></div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="statistic-card">
                    <div class="statistic-title">關聯資源</div>
                    <div class="statistic-value">{{ relatedResources.length }} <small class="text-muted">個</small></div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="statistic-card">
                    <div class="statistic-title">創建時間</div>
                    <div class="statistic-value">{{ formatDate(tag.createdAt) }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <hr class="my-4" />
            
            <div class="related-resources">
              <h6>使用此標籤的資源</h6>
              <div v-if="relatedResources.length > 0" class="resource-list">
                <div
                  v-for="resource in relatedResources"
                  :key="resource.id"
                  class="resource-item"
                  @click="goToResource(resource.id)"
                >
                  <div class="resource-icon">
                    <i 
                      class="bi"
                      :class="getResourceTypeIcon(resource.resourceType)"
                      :style="{ color: getResourceTypeColor(resource.resourceType) }"
                    ></i>
                  </div>
                  <div class="resource-content">
                    <div class="resource-name">{{ resource.name }}</div>
                    <div class="resource-type">{{ resource.resourceType }}</div>
                    <div class="resource-ip">{{ resource.ipAddress }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-resources">
                <div class="text-center py-4">
                  <i class="bi bi-inbox display-4 text-muted"></i>
                  <p class="text-muted mt-2">暫無資源使用此標籤</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 危險操作 -->
        <div class="card form-section danger-section">
          <div class="card-header bg-danger-subtle">
            <h5 class="card-title mb-0 text-danger">危險操作</h5>
          </div>
          <div class="card-body">
            <div class="alert alert-warning d-flex align-items-center" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              <div>
                <strong>注意</strong><br>
                以下操作可能會影響到使用此標籤的所有資源，請謹慎操作。
              </div>
            </div>
            
            <div class="danger-actions">
              <button
                type="button"
                class="btn btn-warning"
                @click="showMergeDialog"
                :disabled="tag.usageCount === 0"
              >
                <i class="bi bi-arrow-down-up me-1"></i>
                合併到其他標籤
              </button>
              
              <button
                type="button"
                class="btn btn-danger"
                @click="handleDelete"
                :disabled="tag.usageCount > 0"
              >
                <i class="bi bi-trash me-1"></i>
                刪除標籤
              </button>
            </div>
          </div>
        </div>

        <!-- 操作按鈕 -->
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="goBack">取消</button>
          <button type="button" class="btn btn-outline-secondary" @click="resetForm">重置</button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="submitting"
          >
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            保存更改
          </button>
        </div>
      </form>
    </div>
    
    <div v-else class="error-state">
      <div class="text-center py-5">
        <i class="bi bi-exclamation-circle display-1 text-muted"></i>
        <h4 class="mt-3">標籤不存在或已被刪除</h4>
      </div>
    </div>

    <!-- 合併標籤對話框 -->
    <div 
      class="modal fade" 
      :class="{ show: mergeDialogVisible }" 
      :style="{ display: mergeDialogVisible ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">合併標籤</h5>
            <button type="button" class="btn-close" @click="mergeDialogVisible = false"></button>
          </div>
          <div class="modal-body">
            <div class="merge-content">
              <div class="alert alert-warning d-flex align-items-center" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <div>
                  <strong>合併說明</strong><br>
                  合併標籤將會把當前標籤的所有使用記錄轉移到目標標籤，當前標籤將被刪除。此操作不可恢復！
                </div>
              </div>
              
              <div class="mb-3">
                <label for="mergeTarget" class="form-label">目標標籤：</label>
                <select
                  id="mergeTarget"
                  v-model="mergeTargetTag"
                  class="form-select"
                >
                  <option value="">選擇要合併到的標籤</option>
                  <option
                    v-for="option in availableTags"
                    :key="option.id"
                    :value="option.id"
                  >
                    {{ option.name }} ({{ getCategoryLabel(option.category) }})
                  </option>
                </select>
              </div>
              
              <div class="mb-3">
                <label class="form-label">合併預覽：</label>
                <div class="merge-preview">
                  <div class="merge-source">
                    <span 
                      class="badge"
                      :class="getBadgeClass('light')"
                      :style="{ backgroundColor: form.color, borderColor: form.color }"
                    >
                      {{ tag.name }} ({{ tag.usageCount }} 次使用)
                    </span>
                  </div>
                  <i class="bi bi-arrow-right merge-arrow"></i>
                  <div class="merge-target">
                    <span
                      v-if="mergeTargetTag && selectedTargetTag"
                      class="badge bg-dark"
                    >
                      {{ selectedTargetTag.name }} ({{ selectedTargetTag.usageCount + tag.usageCount }} 次使用)
                    </span>
                    <span v-else class="placeholder-text">請選擇目標標籤</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="mergeDialogVisible = false">取消</button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="!mergeTargetTag"
              @click="confirmMerge"
            >
              確認合併
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="mergeDialogVisible" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showAlert } from '@/utils/bootstrap-alerts'
import { format } from 'date-fns'

// 路由
const route = useRoute()
const router = useRouter()

// 響應式數據
const formRef = ref<HTMLFormElement>()
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

// 表單錯誤狀態
const errors = reactive({
  name: '',
  category: '',
  color: ''
})

// 標籤分類
const tagCategories = ref([
  {
    label: '環境',
    value: 'Environment',
    description: '開發、測試、生產等環境分類',
    color: '#409eff'
  },
  {
    label: '優先級',
    value: 'Priority',
    description: '高、中、低等優先級分類',
    color: '#e6a23c'
  },
  {
    label: '部門',
    value: 'Department',
    description: '前端、後端、運維等部門分類',
    color: '#67c23a'
  },
  {
    label: '項目',
    value: 'Project',
    description: '專案相關的分類標籤',
    color: '#722ed1'
  },
  {
    label: '技術',
    value: 'Technology',
    description: '技術棧、框架等技術分類',
    color: '#f56c6c'
  },
  {
    label: '其他',
    value: 'Other',
    description: '其他自定義分類',
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

// 計算屬性
const selectedTargetTag = computed(() => {
  return availableTags.value.find(tag => tag.id === mergeTargetTag.value)
})

// 獲取Bootstrap Badge樣式類
const getBadgeClass = (effect: 'light' | 'dark' | 'outline') => {
  const categoryTypeMap: Record<string, string> = {
    Environment: 'primary',
    Priority: 'warning',
    Department: 'success',
    Project: 'info',
    Technology: 'danger',
    Other: 'secondary'
  }
  
  const baseType = categoryTypeMap[form.category] || 'secondary'
  
  switch (effect) {
    case 'dark':
      return `bg-${baseType} text-white`
    case 'outline':
      return `bg-transparent text-${baseType}`
    case 'light':
    default:
      return `bg-${baseType}-subtle text-${baseType}-emphasis`
  }
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

// 獲取資源類型圖標 (Bootstrap Icons)
const getResourceTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    Server: 'bi-server',
    Database: 'bi-database',
    Website: 'bi-globe',
    Storage: 'bi-folder',
    Cache: 'bi-speedometer'
  }
  return iconMap[type] || 'bi-server'
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

// 表單驗證
const validateForm = () => {
  // 清空錯誤
  errors.name = ''
  errors.category = ''
  errors.color = ''

  let isValid = true

  // 驗證標籤名稱
  if (!form.name.trim()) {
    errors.name = '請輸入標籤名稱'
    isValid = false
  } else if (form.name.length > 50) {
    errors.name = '標籤名稱長度不能超過 50 個字符'
    isValid = false
  } else if (/[<>"/\\&]/.test(form.name)) {
    errors.name = '標籤名稱不能包含特殊字符'
    isValid = false
  }

  // 驗證分類
  if (!form.category) {
    errors.category = '請選擇標籤分類'
    isValid = false
  }

  // 驗證顏色
  if (!form.color) {
    errors.color = '請選擇標籤顏色'
    isValid = false
  }

  return isValid
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
  
  // 清空錯誤
  errors.name = ''
  errors.category = ''
  errors.color = ''
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
    showAlert('請選擇目標標籤', 'warning')
    return
  }
  
  const confirmed = confirm(
    `確定要將標籤 "${tag.value.name}" 合併到 "${selectedTargetTag.value?.name}" 嗎？此操作不可恢復。`
  )
  
  if (confirmed) {
    try {
      // 這裡調用合併API
      // await tagsApi.mergeTag(tag.value.id, mergeTargetTag.value)
      
      // 模擬API請求
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      showAlert('標籤合併成功', 'success')
      mergeDialogVisible.value = false
      router.push('/tags')
    } catch (error) {
      console.error('Failed to merge tag:', error)
      showAlert('標籤合併失敗', 'error')
    }
  }
}

// 處理刪除
const handleDelete = async () => {
  if (tag.value.usageCount > 0) {
    showAlert('此標籤正在使用中，無法刪除', 'warning')
    return
  }
  
  const confirmed = confirm(
    `確定要刪除標籤 "${tag.value.name}" 嗎？此操作不可恢復。`
  )
  
  if (confirmed) {
    try {
      // 這裡調用刪除API
      // await tagsApi.deleteTag(tag.value.id)
      
      // 模擬API請求
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      showAlert('刪除成功', 'success')
      router.push('/tags')
    } catch (error) {
      console.error('Failed to delete tag:', error)
      showAlert('刪除失敗', 'error')
    }
  }
}

// 提交表單
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  try {
    submitting.value = true
    
    const submitData = { ...form }
    
    // 這裡調用API更新標籤
    // await tagsApi.updateTag(tag.value.id, submitData)
    
    // 模擬API請求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    showAlert('標籤更新成功！', 'success')
    router.push('/tags')
    
  } catch (error) {
    console.error('Failed to update tag:', error)
    showAlert('標籤更新失敗', 'error')
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
    showAlert('載入標籤失敗', 'error')
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
    padding: 1.25rem;
  }
  
  .page-header {
    margin-bottom: 1.5rem;
    
    h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--bs-body-color);
    }
    
    p {
      margin: 0;
      color: var(--bs-secondary-color);
    }
  }
  
  .tag-form {
    .form-section {
      margin-bottom: 1.5rem;
      
      .card-header {
        background: var(--bs-light);
        font-weight: 600;
      }
      
      &.danger-section {
        .card-header {
          background: var(--bs-danger-bg-subtle);
          color: var(--bs-danger-text-emphasis);
        }
      }
    }
    
    .color-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      
      .color-presets {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        
        .color-preset {
          width: 24px;
          height: 24px;
          border-radius: 0.25rem;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.3s ease;
          
          &:hover {
            transform: scale(1.1);
          }
          
          &.active {
            border-color: var(--bs-primary);
            transform: scale(1.2);
          }
        }
      }
    }
    
    .tag-preview {
      .preview-group {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
        
        .preview-label {
          font-size: 0.875rem;
          color: var(--bs-secondary-color);
          min-width: 80px;
        }
      }
    }
    
    .usage-stats {
      margin-bottom: 1.25rem;
      
      .statistic-card {
        text-align: center;
        padding: 1rem;
        background: var(--bs-light);
        border-radius: 0.5rem;
        
        .statistic-title {
          font-size: 0.875rem;
          color: var(--bs-secondary-color);
          margin-bottom: 0.5rem;
        }
        
        .statistic-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--bs-body-color);
        }
      }
    }
    
    .related-resources {
      h6 {
        margin: 0 0 1rem 0;
        color: var(--bs-body-color);
      }
      
      .resource-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 0.75rem;
        
        .resource-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border: 1px solid var(--bs-border-color);
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          background: var(--bs-body-bg);
          
          &:hover {
            border-color: var(--bs-primary);
            background-color: var(--bs-light);
          }
          
          .resource-icon {
            i {
              font-size: 1.125rem;
            }
          }
          
          .resource-content {
            flex: 1;
            
            .resource-name {
              font-size: 0.875rem;
              font-weight: 500;
              color: var(--bs-body-color);
              margin-bottom: 0.125rem;
            }
            
            .resource-type {
              font-size: 0.75rem;
              color: var(--bs-secondary-color);
              margin-bottom: 0.125rem;
            }
            
            .resource-ip {
              font-size: 0.75rem;
              color: var(--bs-secondary-color);
              font-family: var(--bs-font-monospace);
            }
          }
        }
      }
      
      .empty-resources {
        text-align: center;
        padding: 2.5rem;
      }
    }
    
    .danger-actions {
      display: flex;
      gap: 0.75rem;
    }
    
    .form-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 2rem;
      padding: 1.5rem;
      background: var(--bs-light);
      border-radius: 0.5rem;
    }
  }
  
  .error-state {
    padding: 2.5rem;
    text-align: center;
  }
}

// Modal styles
.modal {
  .merge-content {
    .merge-preview {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--bs-light);
      border-radius: 0.5rem;
      
      .merge-arrow {
        font-size: 1.25rem;
        color: var(--bs-primary);
      }
      
      .placeholder-text {
        color: var(--bs-secondary-color);
        font-style: italic;
      }
    }
  }
}

// 響應式設計
@media (max-width: 768px) {
  .tag-edit {
    max-width: 100%;
    padding: 0 1rem;
    
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
        
        .btn {
          width: 100%;
        }
      }
    }
  }
}

// 暗黑模式支持
@media (prefers-color-scheme: dark) {
  .tag-edit {
    .page-header {
      h2 {
        color: var(--bs-body-color);
      }
    }
    
    .tag-form {
      .form-section {
        .card-header {
          background: var(--bs-dark);
        }
        
        &.danger-section {
          .card-header {
            background: var(--bs-danger-bg-subtle);
            color: var(--bs-danger-text-emphasis);
          }
        }
      }
      
      .usage-stats {
        .statistic-card {
          background: var(--bs-dark);
        }
      }
      
      .related-resources {
        .resource-item {
          background: var(--bs-dark);
          
          &:hover {
            background-color: var(--bs-secondary);
          }
        }
      }
      
      .form-actions {
        background: var(--bs-dark);
      }
    }
    
    .modal {
      .merge-content {
        .merge-preview {
          background: var(--bs-dark);
        }
      }
    }
  }
}
</style>