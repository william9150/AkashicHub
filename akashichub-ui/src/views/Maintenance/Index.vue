<template>
  <div class="maintenance-page">
    <div class="maintenance-content">
      <div class="maintenance-icon">
        <el-icon size="120" color="#E6A23C">
          <Tools />
        </el-icon>
      </div>
      
      <h1 class="maintenance-title">系統維護中</h1>
      
      <div class="maintenance-description">
        <p>系統正在進行維護升級，暫時無法提供服務。</p>
        <p>預計維護時間：{{ maintenanceInfo.estimatedTime }}</p>
        <p>如有緊急事務，請聯繫系統管理員。</p>
      </div>
      
      <div class="maintenance-info">
        <el-card>
          <div class="info-item">
            <span class="info-label">維護開始時間：</span>
            <span class="info-value">{{ maintenanceInfo.startTime }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">預計結束時間：</span>
            <span class="info-value">{{ maintenanceInfo.endTime }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">維護類型：</span>
            <span class="info-value">{{ maintenanceInfo.type }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">聯繫方式：</span>
            <span class="info-value">{{ maintenanceInfo.contact }}</span>
          </div>
        </el-card>
      </div>
      
      <div class="maintenance-actions">
        <el-button @click="checkStatus" :loading="checking">
          <el-icon><Refresh /></el-icon>
          檢查狀態
        </el-button>
      </div>
      
      <div class="countdown" v-if="countdown">
        <p>預計恢復時間：</p>
        <div class="countdown-timer">
          <span class="time-unit">
            <div class="time-value">{{ timeLeft.hours }}</div>
            <div class="time-label">小時</div>
          </span>
          <span class="time-separator">:</span>
          <span class="time-unit">
            <div class="time-value">{{ timeLeft.minutes }}</div>
            <div class="time-label">分鐘</div>
          </span>
          <span class="time-separator">:</span>
          <span class="time-unit">
            <div class="time-value">{{ timeLeft.seconds }}</div>
            <div class="time-label">秒</div>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Tools, Refresh } from '@element-plus/icons-vue'

const checking = ref(false)
const countdown = ref(true)

const maintenanceInfo = ref({
  startTime: '2024-01-15 02:00:00',
  endTime: '2024-01-15 06:00:00',
  estimatedTime: '4小時',
  type: '系統升級',
  contact: 'admin@company.com'
})

const timeLeft = ref({
  hours: 2,
  minutes: 30,
  seconds: 45
})

let countdownTimer: number

const checkStatus = async () => {
  checking.value = true
  try {
    // TODO: 調用API檢查系統狀態
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.info('系統仍在維護中，請稍後再試')
  } catch (error) {
    ElMessage.error('無法檢查系統狀態')
  } finally {
    checking.value = false
  }
}

const updateCountdown = () => {
  const now = new Date()
  const endTime = new Date(maintenanceInfo.value.endTime)
  const diff = endTime.getTime() - now.getTime()
  
  if (diff <= 0) {
    countdown.value = false
    clearInterval(countdownTimer)
    ElMessage.success('維護時間已結束，正在重新檢查系統狀態...')
    checkStatus()
    return
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  timeLeft.value = {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0')
  }
}

onMounted(() => {
  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.maintenance-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.maintenance-content {
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.maintenance-icon {
  margin-bottom: 30px;
}

.maintenance-title {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.maintenance-description {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 30px;
  color: #666;
}

.maintenance-description p {
  margin: 8px 0;
}

.maintenance-info {
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #666;
}

.info-value {
  font-weight: 600;
  color: #333;
}

.maintenance-actions {
  margin-bottom: 40px;
}

.countdown {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.countdown p {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #666;
}

.countdown-timer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.time-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #409EFF;
  color: white;
  border-radius: 8px;
  padding: 12px 16px;
  min-width: 60px;
}

.time-value {
  font-size: 24px;
  font-weight: bold;
  line-height: 1;
}

.time-label {
  font-size: 12px;
  margin-top: 4px;
}

.time-separator {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

@media (max-width: 768px) {
  .maintenance-title {
    font-size: 36px;
  }
  
  .maintenance-description {
    font-size: 16px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .countdown-timer {
    flex-wrap: wrap;
  }
  
  .time-unit {
    min-width: 50px;
    padding: 8px 12px;
  }
  
  .time-value {
    font-size: 20px;
  }
}
</style>