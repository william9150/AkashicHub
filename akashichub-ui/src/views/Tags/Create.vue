<template>
  <div class="tag-create">
    <div class="page-header">
      <h2>新增標籤</h2>
      <p>創建新的分類標籤來組織和管理資源</p>
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

      <!-- 使用建議 -->
      <el-card class="form-section" header="使用建議">
        <div class="suggestions-content">
          <div v-if="form.category" class="category-suggestions">
            <h4>{{ getCategoryLabel(form.category) }} 分類建議</h4>
            <div class="suggestion-tags">
              <el-tag
                v-for="suggestion in getCategorySuggestions(form.category)"
                :key="suggestion"
                :type="getCategoryTagType(form.category)"
                size="small"
                class="suggestion-tag"
                @click="applySuggestion(suggestion)"
              >
                {{ suggestion }}
              </el-tag>
            </div>
          </div>
          
          <div class="best-practices">
            <h4>最佳實踐</h4>
            <ul>
              <li>標籤名稱應該簡潔明了，避免使用特殊字符</li>
              <li>同一分類下的標籤應保持命名風格一致</li>
              <li>避免創建過於相似或重複的標籤</li>
              <li>選擇合適的顏色有助於快速識別和分類</li>
            </ul>
          </div>
        </div>
      </el-card>

      <!-- 批量創建 -->
      <el-card class="form-section" header="批量創建（可選）">
        <el-form-item label="批量模式">
          <el-switch
            v-model="batchMode"
            active-text="開啟"
            inactive-text="關閉"
          />
        </el-form-item>

        <div v-if="batchMode" class="batch-section">
          <el-form-item label="批量標籤">
            <el-input
              v-model="batchTags"
              type="textarea"
              placeholder="每行一個標籤名稱，例如：&#10;前端開發&#10;後端開發&#10;全端開發"
              :rows="5"
            />
            <div class="batch-hint">
              <el-text type="info" size="small">
                每行輸入一個標籤名稱，將使用相同的分類和顏色
              </el-text>
            </div>
          </el-form-item>

          <el-form-item label="批量預覽">
            <div class="batch-preview">
              <el-tag
                v-for="(tag, index) in batchTagList"
                :key="index"
                :color="form.color"
                :type="getCategoryTagType(form.category)"
                effect="light"
                class="batch-tag"
              >
                {{ tag }}
              </el-tag>
              <div v-if="batchTagList.length === 0" class="empty-preview">
                請在上方輸入標籤名稱
              </div>
            </div>
          </el-form-item>
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
          {{ batchMode ? `創建 ${batchTagList.length} 個標籤` : '創建標籤' }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Folder,
  Warning,
  User,
  Briefcase,
  Cpu,
  More
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

// 路由
const router = useRouter()

// 響應式數據
const formRef = ref<FormInstance>()
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
const batchTagList = computed(() => {
  if (!batchTags.value.trim()) return []
  return batchTags.value
    .split('\n')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
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

// 重置表單
const resetForm = () => {
  formRef.value?.resetFields()
  batchMode.value = false
  batchTags.value = ''
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
    
    if (batchMode.value) {
      // 批量創建
      if (batchTagList.value.length === 0) {
        ElMessage.warning('請輸入要批量創建的標籤')
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
      
      ElMessage.success(`成功創建 ${tagsToCreate.length} 個標籤！`)
    } else {
      // 單個創建
      const submitData = { ...form }
      
      // 這裡調用API創建標籤
      // await tagsApi.createTag(submitData)
      
      ElMessage.success('標籤創建成功！')
    }
    
    // 模擬API請求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    router.push('/tags')
    
  } catch (error) {
    console.error('Failed to create tag:', error)
    ElMessage.error('標籤創建失敗')
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
    
    .suggestions-content {
      .category-suggestions {
        margin-bottom: 24px;
        
        h4 {
          margin: 0 0 12px 0;
          color: var(--el-text-color-primary);
        }
        
        .suggestion-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          
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
        h4 {
          margin: 0 0 12px 0;
          color: var(--el-text-color-primary);
        }
        
        ul {
          margin: 0;
          padding-left: 20px;
          
          li {
            margin-bottom: 8px;
            color: var(--el-text-color-regular);
            line-height: 1.5;
          }
        }
      }
    }
    
    .batch-section {
      .batch-hint {
        margin-top: 8px;
      }
      
      .batch-preview {
        min-height: 60px;
        padding: 12px;
        background: var(--el-bg-color-page);
        border-radius: 8px;
        border: 1px dashed var(--el-border-color);
        
        .batch-tag {
          margin: 4px;
        }
        
        .empty-preview {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 40px;
          color: var(--el-text-color-placeholder);
          font-size: 14px;
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
}

// 響應式設計
@media (max-width: 768px) {
  .tag-create {
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
  .tag-create {
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
      }
      
      .batch-section {
        .batch-preview {
          background: var(--el-bg-color-page);
          border-color: var(--el-border-color);
        }
      }
      
      .form-actions {
        background: var(--el-bg-color-page);
      }
    }
  }
}
</style>