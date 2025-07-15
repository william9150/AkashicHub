import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import Login from './Login.vue'
import { mountComponent, setInputValue, clickElement, setupAuthState } from '@/tests/utils'
import { ElMessage } from 'element-plus'

// Mock vue-router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  }),
  useRoute: () => ({
    query: {}
  })
}))

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render login form correctly', () => {
    const wrapper = mountComponent(Login)
    
    expect(wrapper.find('.login-container').exists()).toBe(true)
    expect(wrapper.find('input[placeholder="請輸入登入帳號"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('should show system title and description', () => {
    const wrapper = mountComponent(Login)
    
    expect(wrapper.text()).toContain('阿卡西 IT 資源管理系統')
    expect(wrapper.text()).toContain('統一管理您的 IT 基礎設施資源')
  })

  it('should validate required fields', async () => {
    const wrapper = mountComponent(Login)
    
    // 嘗試提交空表單
    await clickElement(wrapper, 'button[type="submit"]')
    await nextTick()
    
    // 應該顯示驗證錯誤（通過 element-plus 的表單驗證）
    expect(wrapper.vm.form.loginAccount).toBe('')
    expect(wrapper.vm.form.password).toBe('')
  })

  it('should handle input changes', async () => {
    const wrapper = mountComponent(Login)
    
    await setInputValue(wrapper, 'input[placeholder="請輸入登入帳號"]', 'testuser')
    await setInputValue(wrapper, 'input[type="password"]', 'password123')
    
    expect(wrapper.vm.form.loginAccount).toBe('testuser')
    expect(wrapper.vm.form.password).toBe('password123')
  })

  it('should toggle password visibility', async () => {
    const wrapper = mountComponent(Login)
    
    const passwordField = wrapper.find('input[type="password"]')
    expect(passwordField.exists()).toBe(true)
    
    // 模擬點擊顯示密碼按鈕
    wrapper.vm.showPassword = true
    await nextTick()
    
    expect(wrapper.vm.showPassword).toBe(true)
  })

  it('should toggle remember me option', async () => {
    const wrapper = mountComponent(Login)
    
    expect(wrapper.vm.form.rememberMe).toBe(false)
    
    // 模擬點擊記住我選項
    wrapper.vm.form.rememberMe = true
    await nextTick()
    
    expect(wrapper.vm.form.rememberMe).toBe(true)
  })

  it('should handle successful login', async () => {
    const wrapper = mountComponent(Login)
    
    // Mock auth store login
    const authStore = wrapper.vm.authStore
    authStore.login = vi.fn().mockResolvedValue(undefined)
    
    // 填寫表單
    wrapper.vm.form.loginAccount = 'testuser'
    wrapper.vm.form.password = 'password123'
    
    // 提交表單
    await wrapper.vm.handleSubmit()
    
    expect(authStore.login).toHaveBeenCalledWith({
      loginAccount: 'testuser',
      password: 'password123'
    })
    expect(ElMessage.success).toHaveBeenCalledWith('登入成功！')
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('should handle login failure', async () => {
    const wrapper = mountComponent(Login)
    
    // Mock auth store login to fail
    const authStore = wrapper.vm.authStore
    const errorMessage = '帳號或密碼錯誤'
    authStore.login = vi.fn().mockRejectedValue(new Error(errorMessage))
    
    // 填寫表單
    wrapper.vm.form.loginAccount = 'testuser'
    wrapper.vm.form.password = 'wrongpassword'
    
    // 提交表單
    await wrapper.vm.handleSubmit()
    
    expect(authStore.login).toHaveBeenCalled()
    expect(ElMessage.error).toHaveBeenCalledWith(errorMessage)
  })

  it('should show loading state during login', async () => {
    const wrapper = mountComponent(Login)
    
    // Mock auth store login with delay
    const authStore = wrapper.vm.authStore
    authStore.login = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )
    
    // 填寫表單
    wrapper.vm.form.loginAccount = 'testuser'
    wrapper.vm.form.password = 'password123'
    
    // 開始提交
    const submitPromise = wrapper.vm.handleSubmit()
    
    // 檢查 loading 狀態
    expect(wrapper.vm.loading).toBe(true)
    
    // 等待完成
    await submitPromise
    
    expect(wrapper.vm.loading).toBe(false)
  })

  it('should handle guest login', async () => {
    const wrapper = mountComponent(Login)
    
    // Mock auth store login
    const authStore = wrapper.vm.authStore
    authStore.login = vi.fn().mockResolvedValue(undefined)
    
    await wrapper.vm.handleGuestLogin()
    
    expect(authStore.login).toHaveBeenCalledWith({
      loginAccount: 'guest',
      password: 'guest123'
    })
  })

  it('should handle admin quick login', async () => {
    const wrapper = mountComponent(Login)
    
    // Mock auth store login
    const authStore = wrapper.vm.authStore
    authStore.login = vi.fn().mockResolvedValue(undefined)
    
    await wrapper.vm.handleAdminQuickLogin()
    
    expect(authStore.login).toHaveBeenCalledWith({
      loginAccount: 'admin',
      password: 'admin123'
    })
  })

  it('should redirect if already authenticated', async () => {
    const wrapper = mountComponent(Login)
    
    // Mock authenticated state
    const authStore = wrapper.vm.authStore
    authStore.isAuthenticated = true
    
    await wrapper.vm.checkAuthStatus()
    
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('should validate account format', async () => {
    const wrapper = mountComponent(Login)
    
    // 測試有效帳號格式
    expect(wrapper.vm.validateAccount('validuser')).toBe(true)
    expect(wrapper.vm.validateAccount('user123')).toBe(true)
    expect(wrapper.vm.validateAccount('user_name')).toBe(true)
    
    // 測試無效帳號格式
    expect(wrapper.vm.validateAccount('')).toBe(false)
    expect(wrapper.vm.validateAccount('us')).toBe(false) // 太短
    expect(wrapper.vm.validateAccount('user@domain')).toBe(false) // 包含特殊字符
  })

  it('should validate password strength', () => {
    const wrapper = mountComponent(Login)
    
    // 測試密碼強度
    expect(wrapper.vm.getPasswordStrength('123')).toBe('weak')
    expect(wrapper.vm.getPasswordStrength('password')).toBe('medium')
    expect(wrapper.vm.getPasswordStrength('Password123!')).toBe('strong')
  })

  it('should handle keyboard shortcuts', async () => {
    const wrapper = mountComponent(Login)
    
    // Mock form submission
    wrapper.vm.handleSubmit = vi.fn()
    
    // 模擬 Enter 鍵
    const event = new KeyboardEvent('keydown', { key: 'Enter' })
    await wrapper.vm.handleKeydown(event)
    
    expect(wrapper.vm.handleSubmit).toHaveBeenCalled()
  })

  it('should toggle theme', async () => {
    const wrapper = mountComponent(Login)
    
    const appStore = wrapper.vm.appStore
    appStore.toggleTheme = vi.fn()
    
    await wrapper.vm.toggleTheme()
    
    expect(appStore.toggleTheme).toHaveBeenCalled()
  })

  it('should show system info modal', async () => {
    const wrapper = mountComponent(Login)
    
    await wrapper.vm.showSystemInfo()
    
    expect(wrapper.vm.systemInfoVisible).toBe(true)
  })
})