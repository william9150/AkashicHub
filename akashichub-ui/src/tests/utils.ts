import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import type { Component } from 'vue'

// 創建測試用的 Pinia 實例
export function createTestPinia() {
  return createPinia()
}

// 創建測試用的路由實例
export function createTestRouter(routes = []) {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      ...routes
    ]
  })
}

// 包裝組件掛載，提供常用的測試設置
export function mountComponent(
  component: Component,
  options: {
    props?: Record<string, any>
    slots?: Record<string, any>
    global?: Record<string, any>
    router?: any
    pinia?: any
  } = {}
): VueWrapper {
  const pinia = options.pinia || createTestPinia()
  const router = options.router || createTestRouter()

  return mount(component, {
    props: options.props,
    slots: options.slots,
    global: {
      plugins: [pinia, router],
      stubs: {
        'router-link': true,
        'router-view': true,
        'el-icon': true,
        'el-button': true,
        'el-input': true,
        'el-select': true,
        'el-option': true,
        'el-table': true,
        'el-table-column': true,
        'el-pagination': true,
        'el-card': true,
        'el-tag': true,
        'el-tooltip': true,
        'el-dropdown': true,
        'el-dropdown-menu': true,
        'el-dropdown-item': true,
        'el-badge': true,
        'el-avatar': true,
        'el-skeleton': true,
        'el-empty': true,
        'el-alert': true,
        'el-dialog': true,
        'el-form': true,
        'el-form-item': true,
        'el-checkbox': true,
        'el-radio': true,
        'el-radio-group': true,
        'el-switch': true,
        'el-date-picker': true,
        'el-popover': true
      },
      ...options.global
    }
  })
}

// 等待 Vue 的下一個 tick
export async function nextTick() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

// 模擬用戶輸入
export async function setInputValue(wrapper: VueWrapper, selector: string, value: string) {
  const input = wrapper.find(selector)
  await input.setValue(value)
  await nextTick()
}

// 模擬點擊事件
export async function clickElement(wrapper: VueWrapper, selector: string) {
  const element = wrapper.find(selector)
  await element.trigger('click')
  await nextTick()
}

// 等待元素出現
export async function waitForElement(wrapper: VueWrapper, selector: string, timeout = 1000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if (wrapper.find(selector).exists()) {
      return wrapper.find(selector)
    }
    await nextTick()
  }
  throw new Error(`Element ${selector} not found within ${timeout}ms`)
}

// 模擬 API 響應
export function mockApiResponse(data: any, delay = 0) {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay)
  })
}

// 創建模擬用戶數據
export function createMockUser(overrides = {}) {
  return {
    id: 1,
    loginAccount: 'testuser',
    displayName: '測試用戶',
    email: 'test@example.com',
    department: 'IT部門',
    role: 'User',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    ...overrides
  }
}

// 創建模擬資源數據
export function createMockResource(overrides = {}) {
  return {
    id: 1,
    name: '測試伺服器',
    resourceType: 'Server',
    ipAddress: '192.168.1.100',
    loginUser: 'admin',
    status: 'active',
    tags: [
      { id: 1, name: '生產環境', category: 'Environment' }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    ...overrides
  }
}

// 創建模擬標籤數據
export function createMockTag(overrides = {}) {
  return {
    id: 1,
    name: '測試標籤',
    category: 'Environment',
    color: '#409eff',
    usageCount: 5,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    ...overrides
  }
}

// 設置認證狀態
export function setupAuthState(pinia: any, userOverrides = {}) {
  const authStore = useAuthStore(pinia)
  const mockUser = createMockUser(userOverrides)
  
  authStore.setToken('mock-token')
  authStore.setUserInfo(mockUser)
  
  return { authStore, mockUser }
}

// 清理認證狀態
export function clearAuthState(pinia: any) {
  const authStore = useAuthStore(pinia)
  authStore.logout()
}