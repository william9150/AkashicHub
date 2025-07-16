import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index'
import App from './App.vue'

// 全域樣式
import '@/styles/global.scss'

// Element Plus 樣式
import 'element-plus/dist/index.css'

// 進度條樣式
import 'nprogress/nprogress.css'

// 創建應用實例
const app = createApp(App)

// 註冊插件
const pinia = createPinia()
app.use(pinia)
app.use(router)

// 初始化認證狀態
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
authStore.initialize()

// 全域屬性
app.config.globalProperties.$ELEMENT = {}

// 錯誤處理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Error:', err)
  console.error('Component:', instance)
  console.error('Info:', info)
}

// 警告處理
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('Vue Warning:', msg)
  console.warn('Component:', instance)
  console.warn('Trace:', trace)
}

// 掛載應用
app.mount('#app')

// 移除載入動畫
const loadingContainer = document.querySelector('.loading-container')
if (loadingContainer) {
  loadingContainer.remove()
}

// 開發環境配置
if (import.meta.env.DEV) {
  console.log('🚀 AkashicHub Frontend Started in Development Mode')
  console.log('📋 Environment:', import.meta.env.MODE)
  console.log('🌐 API Base URL:', import.meta.env.VITE_API_BASE_URL)
}