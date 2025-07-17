<template>
  <div class="tag-create">
    <div class="page-header">
      <h2>新增標籤</h2>
      <p>創建新的分類標籤來組織和管理資源</p>
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

      <!-- 使用建議 -->
      <div class="card form-section">
        <div class="card-header">
          <h5 class="card-title mb-0">使用建議</h5>
        </div>
        <div class="card-body">
          <div class="suggestions-content">
            <div v-if="form.category" class="category-suggestions">
              <h6>{{ getCategoryLabel(form.category) }} 分類建議</h6>
              <div class="suggestion-tags">
                <span
                  v-for="suggestion in getCategorySuggestions(form.category)"
                  :key="suggestion"
                  class="badge bg-secondary suggestion-tag"
                  @click="applySuggestion(suggestion)"
                >
                  {{ suggestion }}
                </span>
              </div>
            </div>
            
            <div class="best-practices">
              <h6>最佳實踐</h6>
              <ul class="mb-0">
                <li>標籤名稱應該簡潔明了，避免使用特殊字符</li>
                <li>同一分類下的標籤應保持命名風格一致</li>
                <li>避免創建過於相似或重複的標籤</li>
                <li>選擇合適的顏色有助於快速識別和分類</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 批量創建 -->
      <div class="card form-section">
        <div class="card-header">
          <h5 class="card-title mb-0">批量創建（可選）</h5>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <div class="form-check form-switch">
              <input
                id="batchMode"
                v-model="batchMode"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="batchMode">
                批量模式
              </label>
            </div>
          </div>

          <div v-if="batchMode" class="batch-section">
            <div class="mb-3">
              <label for="batchTags" class="form-label">批量標籤</label>
              <textarea
                id="batchTags"
                v-model="batchTags"
                class="form-control"
                placeholder="每行一個標籤名稱，例如：&#10;前端開發&#10;後端開發&#10;全端開發"
                rows="5"
              ></textarea>
              <div class="form-text text-info">
                每行輸入一個標籤名稱，將使用相同的分類和顏色
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">批量預覽</label>
              <div class="batch-preview">
                <span
                  v-for="(tag, index) in batchTagList"
                  :key="index"
                  class="badge batch-tag"
                  :class="getBadgeClass('light')"
                  :style="{ backgroundColor: form.color, borderColor: form.color }"
                >
                  {{ tag }}
                </span>
                <div v-if="batchTagList.length === 0" class="empty-preview">
                  請在上方輸入標籤名稱
                </div>
              </div>
            </div>
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
          {{ batchMode ? `創建 ${batchTagList.length} 個標籤` : '創建標籤' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showAlert } from '@/utils/bootstrap-alerts'

// 路由
const router = useRouter()

// 響應式數據
const formRef = ref<HTMLFormElement>()
const submitting = ref(false)
const batchMode = ref(false)
const batchTags = ref('')

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
const batchTagList = computed(() => {
  if (!batchTags.value.trim()) return []
  return batchTags.value
    .split('\n')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
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

// 獲取分類建議
const getCategorySuggestions = (category: string) => {
  const suggestions: Record<string, string[]> = {
    Environment: ['生產環境', '測試環境', '開發環境', '預發布環境', '沙箱環境'],
    Priority: ['高優先級', '中優先級', '低優先級', '緊急', '普通'],
    Department: ['前端', '後端', '全端', '運維', '測試', '產品', '設計'],
    Project: ['項目A', '項目B', '項目C', '內部工具', '客戶項目'],
    Technology: ['Vue', 'React', 'Node.js', 'Python', 'Java', 'Docker', 'K8s'],
    Other: ['臨時', '備份', '歸檔', '維護', '監控']
  }
  return suggestions[category] || []
}

// 選擇顏色
const selectColor = (color: string) => {
  form.color = color
  updatePreview()
}

// 應用建議
const applySuggestion = (suggestion: string) => {
  form.name = suggestion
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

// 重置表單
const resetForm = () => {
  form.name = ''
  form.category = ''
  form.description = ''
  form.color = '#409eff'
  batchMode.value = false
  batchTags.value = ''
  
  // 清空錯誤
  errors.name = ''
  errors.category = ''
  errors.color = ''
}

// 返回上一頁
const goBack = () => {
  router.go(-1)
}

// 提交表單
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  try {
    submitting.value = true
    
    if (batchMode.value) {
      // 批量創建
      if (batchTagList.value.length === 0) {
        showAlert('請輸入要批量創建的標籤', 'warning')
        return
      }
      
      const tagsToCreate = batchTagList.value.map(name => ({
        name,
        category: form.category,
        description: form.description,
        color: form.color
      }))
      
      // 這裡調用API批量創建標籤
      // await tagsApi.createTags(tagsToCreate)
      
      showAlert(`成功創建 ${tagsToCreate.length} 個標籤！`, 'success')
    } else {
      // 單個創建
      const submitData = { ...form }
      
      // 這裡調用API創建標籤
      // await tagsApi.createTag(submitData)
      
      showAlert('標籤創建成功！', 'success')
    }
    
    // 模擬API請求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    router.push('/tags')
    
  } catch (error) {
    console.error('Failed to create tag:', error)
    showAlert('標籤創建失敗', 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.tag-create {
  max-width: 800px;
  margin: 0 auto;
  
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
    
    .suggestions-content {
      .category-suggestions {
        margin-bottom: 1.5rem;
        
        h6 {
          margin: 0 0 0.75rem 0;
          color: var(--bs-body-color);
        }
        
        .suggestion-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          
          .suggestion-tag {
            cursor: pointer;
            transition: all 0.3s ease;
            
            &:hover {
              transform: scale(1.05);
            }
          }
        }
      }
      
      .best-practices {
        h6 {
          margin: 0 0 0.75rem 0;
          color: var(--bs-body-color);
        }
        
        ul {
          margin: 0;
          padding-left: 1.25rem;
          
          li {
            margin-bottom: 0.5rem;
            color: var(--bs-secondary-color);
            line-height: 1.5;
          }
        }
      }
    }
    
    .batch-section {
      .batch-preview {
        min-height: 60px;
        padding: 0.75rem;
        background: var(--bs-light);
        border-radius: 0.5rem;
        border: 1px dashed var(--bs-border-color);
        
        .batch-tag {
          margin: 0.25rem;
        }
        
        .empty-preview {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 40px;
          color: var(--bs-secondary-color);
          font-size: 0.875rem;
        }
      }
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
}

// 響應式設計
@media (max-width: 768px) {
  .tag-create {
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
  .tag-create {
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
      }
      
      .batch-section {
        .batch-preview {
          background: var(--bs-dark);
          border-color: var(--bs-border-color);
        }
      }
      
      .form-actions {
        background: var(--bs-dark);
      }
    }
  }
}
</style>