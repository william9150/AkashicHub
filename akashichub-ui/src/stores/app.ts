// 應用全域狀態管理

import { defineStore } from 'pinia'
import { ref, computed, watch, readonly } from 'vue'
import type { ThemeMode, Locale } from '@/types'

export const useAppStore = defineStore('app', () => {
  // 狀態
  const theme = ref<ThemeMode>('light')
  const locale = ref<Locale>('zh-TW')
  const sidebarCollapsed = ref(false)
  const device = ref<'desktop' | 'tablet' | 'mobile'>('desktop')
  const loading = ref(false)
  const cachedViews = ref<string[]>([])
  const visitedViews = ref<Array<{ name: string; title: string; path: string }>>([])
  const pageTitle = ref('')
  const breadcrumbs = ref<Array<{ title: string; path?: string }>>([])
  const fullscreen = ref(false)
  const settingsVisible = ref(false)
  const showNotifications = ref(false)
  const onlineStatus = ref(navigator.onLine)
  
  // 設定
  const settings = ref({
    showLogo: true,
    showTabs: true,
    showBreadcrumb: true,
    showFooter: true,
    fixedHeader: true,
    enableTransition: true,
    enableProgress: true,
    enableKeepAlive: true,
    enableWatermark: false,
    watermarkText: 'AkashicHub',
    themeColor: '#409eff',
    layoutMode: 'vertical' as 'vertical' | 'horizontal' | 'mixed',
    contentWidth: 'fluid' as 'fluid' | 'fixed',
    animation: 'fade' as 'fade' | 'slide' | 'zoom' | 'none',
    showSettingsButton: true,
    showThemeSwitch: true,
    showLanguageSwitch: true,
    showFullscreenButton: true,
    showRefreshButton: true,
    uniqueOpened: false,
    enableLoadingAnimation: true,
    autoSave: true,
    keepAlive: true,
  })

  // 計算屬性
  const isDark = computed(() => theme.value === 'dark')
  const isDarkMode = computed(() => theme.value === 'dark')
  const isLight = computed(() => theme.value === 'light')
  const isAuto = computed(() => theme.value === 'auto')
  
  const isMobile = computed(() => device.value === 'mobile')
  const isTablet = computed(() => device.value === 'tablet')
  const isDesktop = computed(() => device.value === 'desktop')
  
  const currentTheme = computed(() => {
    if (theme.value === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme.value
  })
  
  const appTitle = computed(() => {
    const baseTitle = import.meta.env.VITE_APP_TITLE
    return pageTitle.value ? `${pageTitle.value} - ${baseTitle}` : baseTitle
  })

  // 動作
  const setTheme = (newTheme: ThemeMode) => {
    theme.value = newTheme
    updateTheme()
    localStorage.setItem('akashichub_theme', newTheme)
  }

  const updateTheme = () => {
    const htmlElement = document.documentElement
    const actualTheme = currentTheme.value
    
    if (actualTheme === 'dark') {
      htmlElement.classList.add('dark')
      htmlElement.setAttribute('data-theme', 'dark')
    } else {
      htmlElement.classList.remove('dark')
      htmlElement.setAttribute('data-theme', 'light')
    }
  }

  const setLocale = (newLocale: Locale) => {
    locale.value = newLocale
    localStorage.setItem('akashichub_locale', newLocale)
    document.documentElement.lang = newLocale
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('akashichub_sidebar_collapsed', String(sidebarCollapsed.value))
  }

  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
    localStorage.setItem('akashichub_sidebar_collapsed', String(collapsed))
  }

  const setDevice = (newDevice: 'desktop' | 'tablet' | 'mobile') => {
    device.value = newDevice
    
    // 移動設備自動收起側邊欄
    if (newDevice === 'mobile') {
      setSidebarCollapsed(true)
    }
  }

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  const setPageTitle = (title: string) => {
    pageTitle.value = title
    document.title = appTitle.value
  }

  const setBreadcrumbs = (crumbs: Array<{ title: string; path?: string }>) => {
    breadcrumbs.value = crumbs
  }

  const addCachedView = (viewName: string) => {
    if (!cachedViews.value.includes(viewName)) {
      cachedViews.value.push(viewName)
    }
  }

  const removeCachedView = (viewName: string) => {
    const index = cachedViews.value.indexOf(viewName)
    if (index > -1) {
      cachedViews.value.splice(index, 1)
    }
  }

  const clearCachedViews = () => {
    cachedViews.value = []
  }

  const addVisitedView = (viewName: string, title?: string, path?: string) => {
    const existingIndex = visitedViews.value.findIndex(v => 
      typeof v === 'string' ? v === viewName : v.name === viewName
    )
    
    if (existingIndex === -1) {
      visitedViews.value.push({
        name: viewName,
        title: title || viewName,
        path: path || `/${viewName.toLowerCase()}`
      })
    }
  }

  const removeVisitedView = (viewName: string) => {
    const index = visitedViews.value.findIndex(v => 
      typeof v === 'string' ? v === viewName : v.name === viewName
    )
    if (index > -1) {
      visitedViews.value.splice(index, 1)
    }
  }

  const clearVisitedViews = () => {
    visitedViews.value = []
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      fullscreen.value = true
    } else {
      document.exitFullscreen()
      fullscreen.value = false
    }
  }

  const setSettingsVisible = (visible: boolean) => {
    settingsVisible.value = visible
  }
  
  const toggleSettings = () => {
    settingsVisible.value = !settingsVisible.value
  }
  
  const toggleTheme = () => {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  const toggleNotifications = () => {
    showNotifications.value = !showNotifications.value
  }

  const updateSettings = (newSettings: Partial<typeof settings.value>) => {
    settings.value = { ...settings.value, ...newSettings }
    localStorage.setItem('akashichub_settings', JSON.stringify(settings.value))
  }

  const resetSettings = () => {
    settings.value = {
      showLogo: true,
      showTabs: true,
      showBreadcrumb: true,
      showFooter: true,
      fixedHeader: true,
      enableTransition: true,
      enableProgress: true,
      enableKeepAlive: true,
      enableWatermark: false,
      watermarkText: 'AkashicHub',
      themeColor: '#409eff',
      layoutMode: 'vertical',
      contentWidth: 'fluid',
      animation: 'fade',
      showSettingsButton: true,
      showThemeSwitch: true,
      showLanguageSwitch: true,
      showFullscreenButton: true,
      showRefreshButton: true,
      uniqueOpened: false,
      enableLoadingAnimation: true,
      autoSave: true,
      keepAlive: true,
    }
    localStorage.removeItem('akashichub_settings')
  }

  const setOnlineStatus = (status: boolean) => {
    onlineStatus.value = status
  }

  // 初始化
  const initializeApp = () => {
    // 初始化主題
    const savedTheme = localStorage.getItem('akashichub_theme') as ThemeMode
    if (savedTheme) {
      theme.value = savedTheme
    }
    updateTheme()

    // 初始化語言
    const savedLocale = localStorage.getItem('akashichub_locale') as Locale
    if (savedLocale) {
      locale.value = savedLocale
    }
    document.documentElement.lang = locale.value

    // 初始化側邊欄狀態
    const savedSidebarState = localStorage.getItem('akashichub_sidebar_collapsed')
    if (savedSidebarState !== null) {
      sidebarCollapsed.value = savedSidebarState === 'true'
    }

    // 初始化設定
    const savedSettings = localStorage.getItem('akashichub_settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        settings.value = { ...settings.value, ...parsed }
      } catch (error) {
        console.error('Failed to parse saved settings:', error)
      }
    }

    // 初始化設備類型
    updateDeviceType()

    // 監聽系統主題變化
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', updateTheme)
    }

    // 監聽網路狀態
    window.addEventListener('online', () => setOnlineStatus(true))
    window.addEventListener('offline', () => setOnlineStatus(false))

    // 監聽全屏狀態
    document.addEventListener('fullscreenchange', () => {
      fullscreen.value = !!document.fullscreenElement
    })

    // 監聽視窗大小變化
    window.addEventListener('resize', updateDeviceType)
  }

  const updateDeviceType = () => {
    const width = window.innerWidth
    if (width < 768) {
      setDevice('mobile')
    } else if (width < 1024) {
      setDevice('tablet')
    } else {
      setDevice('desktop')
    }
  }

  // 監聽主題變化
  watch(theme, (newTheme) => {
    updateTheme()
  })

  // 監聽設定變化
  watch(
    settings,
    (newSettings) => {
      localStorage.setItem('akashichub_settings', JSON.stringify(newSettings))
    },
    { deep: true }
  )

  // 返回狀態和方法
  return {
    // 狀態
    theme: readonly(theme),
    locale: readonly(locale),
    sidebarCollapsed: readonly(sidebarCollapsed),
    device: readonly(device),
    loading: readonly(loading),
    cachedViews: readonly(cachedViews),
    visitedViews: readonly(visitedViews),
    pageTitle: readonly(pageTitle),
    breadcrumbs: readonly(breadcrumbs),
    fullscreen: readonly(fullscreen),
    settingsVisible: readonly(settingsVisible),
    showNotifications: readonly(showNotifications),
    onlineStatus: readonly(onlineStatus),
    settings: readonly(settings),
    
    // 計算屬性
    isDark,
    isDarkMode,
    isLight,
    isAuto,
    isMobile,
    isTablet,
    isDesktop,
    currentTheme,
    appTitle,
    
    // 動作
    setTheme,
    setLocale,
    toggleSidebar,
    setSidebarCollapsed,
    setDevice,
    setLoading,
    setPageTitle,
    setBreadcrumbs,
    addCachedView,
    removeCachedView,
    clearCachedViews,
    addVisitedView,
    removeVisitedView,
    clearVisitedViews,
    toggleFullscreen,
    setSettingsVisible,
    toggleSettings,
    toggleTheme,
    toggleNotifications,
    updateSettings,
    resetSettings,
    setOnlineStatus,
    initializeApp,
    updateDeviceType,
  }
})

// 類型定義
export type AppStore = ReturnType<typeof useAppStore>