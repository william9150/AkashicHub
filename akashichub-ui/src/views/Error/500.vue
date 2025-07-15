<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">500</div>
      <div class="error-title">伺服器錯誤</div>
      <div class="error-description">
        伺服器發生內部錯誤，請稍後重試或聯繫系統管理員。
      </div>
      <div class="error-actions">
        <el-button type="primary" @click="refresh">
          <el-icon><Refresh /></el-icon>
          重新載入
        </el-button>
        <el-button @click="goHome">
          <el-icon><House /></el-icon>
          返回首頁
        </el-button>
      </div>
    </div>
    
    <div class="error-illustration">
      <el-icon size="200" color="#F56C6C">
        <WarningFilled />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { House, Refresh, WarningFilled } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const refresh = () => {
  window.location.reload()
}
</script>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
}

.error-content {
  text-align: center;
  color: white;
  margin-right: 60px;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.error-title {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 16px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.error-description {
  font-size: 16px;
  margin-bottom: 32px;
  opacity: 0.9;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.error-illustration {
  opacity: 0.3;
}

@media (max-width: 768px) {
  .error-page {
    flex-direction: column;
  }
  
  .error-content {
    margin-right: 0;
    margin-bottom: 40px;
  }
  
  .error-code {
    font-size: 80px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>