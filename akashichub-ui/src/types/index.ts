// 類型定義統一導出

// API 相關類型
export * from './api'

// 認證相關類型
export * from './auth'

// 資源相關類型
export * from './resources'

// 共用類型
export * from './common'

// 環境變數類型
export interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_BASE_URL: string
  readonly VITE_ENABLE_MOCK: string
  readonly VITE_ENABLE_DEVTOOLS: string
  readonly VITE_SHOW_PERFORMANCE: string
}

export interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 全域類型擴展
declare global {
  interface Window {
    // 全域配置
    __APP_CONFIG__: {
      version: string
      buildTime: string
      env: string
    }
    
    // 開發工具
    __VUE_DEVTOOLS_GLOBAL_HOOK__: any
    
    // 第三方庫
    echarts: any
  }
}

// Vite 環境類型
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 樣式模組
declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string }
  export default classes
}

// 靜態資源
declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

declare module '*.ico' {
  const src: string
  export default src
}

// JSON 文件
declare module '*.json' {
  const value: any
  export default value
}

// 工具函數類型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Nullable<T> = T | null

export type Optional<T> = T | undefined

export type KeyOf<T> = keyof T

export type ValueOf<T> = T[keyof T]

export type NonEmptyArray<T> = [T, ...T[]]

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

export type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R
  ? R
  : never

export type Push<T extends any[], V> = [...T, V]

export type Length<T extends any[]> = T['length']

// 表單驗證類型
export interface ValidationRule {
  required?: boolean
  message?: string
  pattern?: RegExp
  min?: number
  max?: number
  type?: 'string' | 'number' | 'email' | 'url' | 'date'
  validator?: (rule: any, value: any, callback: (error?: Error) => void) => void
  trigger?: 'blur' | 'change' | 'submit'
}

export type ValidationRules = Record<string, ValidationRule | ValidationRule[]>

// 事件處理類型
export type EventHandler<T = Event> = (event: T) => void

export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>

// 組件 Props 類型
export interface ComponentProps {
  [key: string]: any
}

// 組件 Emits 類型
export interface ComponentEmits {
  [key: string]: (...args: any[]) => boolean
}

// 組件實例類型
export interface ComponentInstance {
  $props: ComponentProps
  $emit: (event: string, ...args: any[]) => void
  $slots: Record<string, any>
  $attrs: Record<string, any>
  $refs: Record<string, any>
  $parent: ComponentInstance | null
  $root: ComponentInstance
}

// 路由類型
export interface RouteLocationNormalized {
  path: string
  name?: string
  params: Record<string, string | string[]>
  query: Record<string, string | string[]>
  hash: string
  fullPath: string
  matched: any[]
  meta: RouteMeta
  redirectedFrom?: RouteLocationNormalized
}

// 存儲類型
export interface StorageData {
  [key: string]: any
}

// 主題類型
export type ThemeMode = 'light' | 'dark' | 'auto'

// 語言類型
export type Locale = 'zh-TW' | 'zh-CN' | 'en-US' | 'ja-JP'

// 權限類型
export type Permission = string

export type Role = 'Admin' | 'User'

// 時間格式類型
export type TimeFormat = 'YYYY-MM-DD' | 'YYYY-MM-DD HH:mm:ss' | 'MM/DD/YYYY' | 'DD/MM/YYYY'

// 文件類型
export type FileType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other'

// 響應式類型
export type Responsive<T> = T | { xs?: T; sm?: T; md?: T; lg?: T; xl?: T; xxl?: T }

// 狀態類型
export type Status = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'default'

// 尺寸類型
export type Size = 'small' | 'default' | 'large'

// 位置類型
export type Position = 'top' | 'right' | 'bottom' | 'left'

// 對齊類型
export type Align = 'left' | 'center' | 'right'

// 方向類型
export type Direction = 'horizontal' | 'vertical'

// 顏色類型
export type Color = string

// 導出默認類型
export default {}