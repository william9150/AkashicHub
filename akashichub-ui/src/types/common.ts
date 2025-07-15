// 共用類型定義

// 基礎實體
export interface BaseEntity {
  id: number
  createdAt: string
  updatedAt: string
}

// 分頁配置
export interface PaginationConfig {
  page: number
  limit: number
  total: number
  totalPages: number
}

// 排序配置
export interface SortConfig {
  field: string
  order: 'ASC' | 'DESC'
}

// 篩選器
export interface FilterConfig {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'nin'
  value: any
}

// 表格列配置
export interface TableColumn {
  key: string
  title: string
  width?: string | number
  sortable?: boolean
  filterable?: boolean
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  render?: (value: any, record: any) => any
}

// 表格配置
export interface TableConfig {
  columns: TableColumn[]
  pagination?: PaginationConfig
  sort?: SortConfig
  filters?: FilterConfig[]
  selection?: boolean
  loading?: boolean
  stripe?: boolean
  border?: boolean
  height?: string | number
}

// 表單欄位
export interface FormField {
  key: string
  label: string
  type: 'text' | 'password' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'datetime' | 'file'
  required?: boolean
  placeholder?: string
  options?: { label: string; value: any }[]
  validation?: {
    min?: number
    max?: number
    pattern?: RegExp
    message?: string
  }
  disabled?: boolean
  hidden?: boolean
  defaultValue?: any
}

// 表單配置
export interface FormConfig {
  fields: FormField[]
  labelWidth?: string
  inline?: boolean
  disabled?: boolean
  showMessage?: boolean
  showIcon?: boolean
  validateOnRuleChange?: boolean
  hideRequiredAsterisk?: boolean
}

// 選項
export interface Option {
  label: string
  value: any
  disabled?: boolean
  children?: Option[]
}

// 選擇器配置
export interface SelectConfig {
  options: Option[]
  multiple?: boolean
  filterable?: boolean
  clearable?: boolean
  placeholder?: string
  noDataText?: string
  loading?: boolean
  remote?: boolean
  remoteMethod?: (query: string) => Promise<Option[]>
}

// 搜尋配置
export interface SearchConfig {
  placeholder?: string
  immediate?: boolean
  debounce?: number
  clearable?: boolean
  buttonText?: string
  loading?: boolean
  onSearch?: (value: string) => void
}

// 操作按鈕
export interface ActionButton {
  key: string
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'
  icon?: string
  disabled?: boolean
  loading?: boolean
  confirm?: {
    title: string
    message: string
    type?: 'warning' | 'info' | 'success' | 'error'
  }
  onClick?: (record?: any) => void
}

// 狀態選項
export interface StatusOption {
  value: string
  label: string
  color: string
  icon?: string
}

// 主題配置
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto'
  primaryColor: string
  borderRadius: string
  fontSize: string
  fontFamily: string
}

// 語言配置
export interface LanguageConfig {
  locale: string
  name: string
  messages: Record<string, string>
}

// 通知配置
export interface NotificationConfig {
  title: string
  message: string
  type: 'success' | 'warning' | 'info' | 'error'
  duration?: number
  showClose?: boolean
  onClose?: () => void
}

// 載入狀態
export interface LoadingState {
  loading: boolean
  message?: string
  tip?: string
}

// 錯誤狀態
export interface ErrorState {
  error: boolean
  message: string
  code?: string
  details?: any
}

// 頁面狀態
export interface PageState {
  loading: LoadingState
  error: ErrorState
  data: any
  pagination: PaginationConfig
  filters: FilterConfig[]
  sort: SortConfig
}

// 路由元信息
export interface RouteMeta {
  title?: string
  icon?: string
  requiresAuth?: boolean
  requiresAdmin?: boolean
  keepAlive?: boolean
  hidden?: boolean
  roles?: string[]
  permissions?: string[]
  breadcrumb?: boolean
  activeMenu?: string
}

// 菜單項
export interface MenuItem {
  id: string
  title: string
  icon?: string
  path?: string
  children?: MenuItem[]
  disabled?: boolean
  hidden?: boolean
  roles?: string[]
  permissions?: string[]
}

// 工具欄配置
export interface ToolbarConfig {
  title?: string
  showRefresh?: boolean
  showSettings?: boolean
  showFullscreen?: boolean
  showExport?: boolean
  showImport?: boolean
  customButtons?: ActionButton[]
}

// 空狀態配置
export interface EmptyStateConfig {
  image?: string
  title?: string
  description?: string
  buttonText?: string
  buttonAction?: () => void
}

// 統計卡片
export interface StatCard {
  title: string
  value: number | string
  unit?: string
  icon?: string
  color?: string
  trend?: {
    type: 'up' | 'down' | 'stable'
    value: number
    label: string
  }
  onClick?: () => void
}

// 圖表配置
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'scatter'
  data: any
  options?: any
  width?: string | number
  height?: string | number
  responsive?: boolean
}

// 上傳配置
export interface UploadConfig {
  action: string
  method?: string
  headers?: Record<string, string>
  data?: Record<string, any>
  accept?: string
  multiple?: boolean
  limit?: number
  fileSize?: number
  beforeUpload?: (file: File) => boolean
  onSuccess?: (response: any, file: File) => void
  onError?: (error: Error, file: File) => void
  onProgress?: (event: ProgressEvent, file: File) => void
}

// 導出所有類型
export type {
  BaseEntity,
  PaginationConfig,
  SortConfig,
  FilterConfig,
  TableColumn,
  TableConfig,
  FormField,
  FormConfig,
  Option,
  SelectConfig,
  SearchConfig,
  ActionButton,
  StatusOption,
  ThemeConfig,
  LanguageConfig,
  NotificationConfig,
  LoadingState,
  ErrorState,
  PageState,
  RouteMeta,
  MenuItem,
  ToolbarConfig,
  EmptyStateConfig,
  StatCard,
  ChartConfig,
  UploadConfig
}