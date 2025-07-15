// Cypress E2E 支持文件

import './commands'

// 全局 beforeEach 設置
beforeEach(() => {
  // 在每個測試前清除本地存儲
  cy.clearLocalStorage()
  cy.clearCookies()
})

// 處理未捕獲的異常
Cypress.on('uncaught:exception', (err, runnable) => {
  // 忽略某些已知的錯誤
  if (err.message.includes('ResizeObserver')) {
    return false
  }
  if (err.message.includes('Non-Error promise rejection')) {
    return false
  }
  return true
})

// 全局配置
Cypress.config('defaultCommandTimeout', 10000)
Cypress.config('requestTimeout', 10000)
Cypress.config('responseTimeout', 10000)