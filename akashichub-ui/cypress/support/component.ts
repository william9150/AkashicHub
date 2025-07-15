// Cypress 組件測試支持文件

import { mount } from 'cypress/vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'

// 增強 mount 命令
Cypress.Commands.add('mount', (component, options = {}) => {
  // 設置預設的 Pinia 和 Router
  const pinia = createPinia()
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } }
    ]
  })

  return mount(component, {
    global: {
      plugins: [pinia, router],
      stubs: {
        'router-link': true,
        'router-view': true
      }
    },
    ...options
  })
})

// TypeScript 聲明
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}