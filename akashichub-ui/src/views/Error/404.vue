<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">404</div>
      <div class="error-title">頁面不存在</div>
      <div class="error-description">
        抱歉，您訪問的頁面不存在或已被移除。
      </div>
      <div class="error-actions">
        <el-button type="primary" @click="goHome">
          <el-icon><House /></el-icon>
          返回首頁
        </el-button>
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回上頁
        </el-button>
      </div>
    </div>
    
    <div class="error-illustration">
      <el-icon size="200" color="#909399">
        <QuestionFilled />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { House, ArrowLeft, QuestionFilled } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
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