<template>
  <div class="resources-page">
    <div class="page-header">
      <h1>📋 資源管理</h1>
      <el-button type="primary" @click="showAddDialog = true">
        新增資源
      </el-button>
    </div>

    <div class="resources-content">
      <!-- 搜尋欄 -->
      <el-card class="search-card">
        <el-input
          v-model="searchKeyword"
          placeholder="搜尋資源名稱、IP地址..."
          prefix-icon="Search"
          @input="handleSearch"
          style="max-width: 400px"
        />
      </el-card>

      <!-- 資源列表 -->
      <el-card class="resources-table">
        <el-table 
          :data="filteredResources" 
          v-loading="loading"
          empty-text="暫無資源數據"
        >
          <el-table-column prop="Name" label="資源名稱" min-width="150" />
          <el-table-column prop="ResourceType" label="類型" width="120" />
          <el-table-column prop="IpAddress" label="IP地址" width="140" />
          <el-table-column prop="Port" label="端口" width="80" />
          <el-table-column prop="Description" label="描述" min-width="200" />
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button size="small" @click="editResource(row)">編輯</el-button>
              <el-button size="small" type="danger" @click="deleteResource(row)">刪除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 新增/編輯對話框 -->
    <el-dialog 
      v-model="showAddDialog" 
      :title="editingResource ? '編輯資源' : '新增資源'"
      width="600px"
    >
      <el-form :model="resourceForm" label-width="100px">
        <el-form-item label="資源名稱" required>
          <el-input v-model="resourceForm.Name" />
        </el-form-item>
        <el-form-item label="資源類型" required>
          <el-select v-model="resourceForm.ResourceType" style="width: 100%">
            <el-option label="伺服器" value="Server" />
            <el-option label="資料庫" value="Database" />
            <el-option label="網站" value="Website" />
            <el-option label="API" value="API" />
          </el-select>
        </el-form-item>
        <el-form-item label="IP地址">
          <el-input v-model="resourceForm.IpAddress" />
        </el-form-item>
        <el-form-item label="端口">
          <el-input v-model="resourceForm.Port" type="number" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="resourceForm.Description" type="textarea" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveResource">確定</el-button>
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
const editingResource = ref(null)
const resources = ref([])

const resourceForm = reactive({
  Name: '',
  ResourceType: '',
  IpAddress: '',
  Port: '',
  Description: ''
})

const filteredResources = computed(() => {
  if (!searchKeyword.value) return resources.value
  
  return resources.value.filter((resource: any) => 
    resource.Name?.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    resource.IpAddress?.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    resource.Description?.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

const fetchResources = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('akashichub_token')
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/resources`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) throw new Error('Failed to fetch resources')
    
    const data = await response.json()
    if (data.success) {
      resources.value = data.data.resources || []
    }
  } catch (error) {
    console.error('Failed to fetch resources:', error)
    ElMessage.error('載入資源失敗')
  } finally {
    loading.value = false
  }
}

const saveResource = async () => {
  try {
    const token = localStorage.getItem('akashichub_token')
    const method = editingResource.value ? 'PUT' : 'POST'
    const url = editingResource.value 
      ? `${import.meta.env.VITE_API_BASE_URL}/resources/${editingResource.value.Id}`
      : `${import.meta.env.VITE_API_BASE_URL}/resources`

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(resourceForm)
    })

    if (!response.ok) throw new Error('Failed to save resource')

    ElMessage.success(editingResource.value ? '更新成功' : '新增成功')
    showAddDialog.value = false
    resetForm()
    fetchResources()
  } catch (error) {
    console.error('Failed to save resource:', error)
    ElMessage.error('保存失敗')
  }
}

const editResource = (resource: any) => {
  editingResource.value = resource
  Object.assign(resourceForm, resource)
  showAddDialog.value = true
}

const deleteResource = async (resource: any) => {
  try {
    await ElMessageBox.confirm('確定要刪除這個資源嗎？', '確認刪除')
    
    const token = localStorage.getItem('akashichub_token')
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/resources/${resource.Id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) throw new Error('Failed to delete resource')

    ElMessage.success('刪除成功')
    fetchResources()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete resource:', error)
      ElMessage.error('刪除失敗')
    }
  }
}

const resetForm = () => {
  Object.assign(resourceForm, {
    Name: '',
    ResourceType: '',
    IpAddress: '',
    Port: '',
    Description: ''
  })
  editingResource.value = null
}

const handleSearch = () => {
  // 搜尋邏輯已在 computed 中處理
}

onMounted(() => {
  fetchResources()
})
</script>

<style scoped>
.resources-page {
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

.resources-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-card {
  padding: 10px;
}

.resources-table {
  flex: 1;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .resources-page {
    padding: 10px;
  }
}
</style>