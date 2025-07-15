import { config } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { vi } from 'vitest'

// 全局測試設置
beforeEach(() => {
  // 重置所有 mocks
  vi.clearAllMocks()
  
  // 創建新的 Pinia 實例
  const pinia = createPinia()
  
  // 設置全局配置
  config.global.plugins = [pinia]
  
  // Mock window 對象
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  })
  
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  })
  
  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock
  })
  
  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }))
  
  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }))
})

// 全局 mocks
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  }),
  useRoute: () => ({
    params: {},
    query: {},
    path: '/',
    name: 'test',
    meta: {}
  })
}))

// Mock Element Plus 消息組件
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn().mockResolvedValue('confirm'),
      alert: vi.fn().mockResolvedValue('confirm'),
      prompt: vi.fn().mockResolvedValue({ value: 'test' })
    },
    ElNotification: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    }
  }
})

// Mock ECharts
vi.mock('echarts', () => ({
  init: vi.fn(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  })),
  getInstanceByDom: vi.fn(),
  dispose: vi.fn()
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => {
    if (formatStr === 'yyyy-MM-dd') return '2024-01-15'
    if (formatStr === 'yyyy-MM-dd HH:mm:ss') return '2024-01-15 10:30:00'
    return '2024-01-15'
  }),
  formatDistanceToNow: vi.fn(() => '2 小時前')
}))

// 擴展 expect 匹配器
expect.extend({
  toBeVisible(received) {
    const pass = received && received.style && received.style.display !== 'none'
    return {
      message: () => `expected element to ${pass ? 'not ' : ''}be visible`,
      pass
    }
  }
})