// HTTP 請求工具

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { showAlert } from './bootstrap-alerts'
import type { ApiResponse, ApiError } from '@/types'
import { getToken, removeToken } from './auth'
import router from '@/router'

// 創建 axios 實例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 請求攔截器
request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 添加認證 Token
    const token = getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 添加請求時間戳
    if (config.params) {
      config.params._t = Date.now()
    } else {
      config.params = { _t: Date.now() }
    }

    // 開發環境日誌
    if (import.meta.env.DEV) {
      console.log('🚀 Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
        data: config.data,
      })
    }

    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// 響應攔截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data, status, statusText } = response

    // 開發環境日誌
    if (import.meta.env.DEV) {
      console.log('✅ Response:', {
        status,
        statusText,
        data,
      })
    }

    // 檢查 API 回應格式
    if (data && typeof data === 'object' && 'success' in data) {
      if (data.success) {
        return data.data
      } else {
        // API 業務錯誤
        const error: ApiError = {
          code: data.error?.code || 'UNKNOWN_ERROR',
          message: data.error?.message || '未知錯誤',
          status,
        }
        return Promise.reject(error)
      }
    }

    // 直接返回原始數據（用於非標準格式的 API）
    return data
  },
  (error) => {
    console.error('❌ Response Error:', error)

    // 網路錯誤
    if (!error.response) {
      showAlert('網路連接失敗，請檢查網路設定', 'error')
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: '網路連接失敗',
      })
    }

    const { status, data } = error.response

    // 處理不同的 HTTP 狀態碼
    switch (status) {
      case 401:
        // 認證失敗
        showAlert('登入已過期，請重新登入', 'error')
        removeToken()
        router.push('/login')
        break

      case 403:
        // 權限不足
        showAlert('權限不足，無法執行此操作', 'error')
        break

      case 404:
        // 資源不存在
        showAlert('請求的資源不存在', 'error')
        break

      case 422:
        // 驗證錯誤
        const message = data?.error?.message || '輸入資料驗證失敗'
        showAlert(message, 'error')
        break

      case 429:
        // 請求過於頻繁
        showAlert('請求過於頻繁，請稍後再試', 'warning')
        break

      case 500:
        // 伺服器錯誤
        showAlert('伺服器內部錯誤，請聯繫管理員', 'error')
        break

      case 502:
      case 503:
      case 504:
        // 伺服器不可用
        showAlert('伺服器暫時不可用，請稍後再試', 'error')
        break

      default:
        // 其他錯誤
        const errorMessage = data?.error?.message || `請求失敗 (${status})`
        showAlert(errorMessage, 'error')
    }

    const apiError: ApiError = {
      code: data?.error?.code || `HTTP_${status}`,
      message: data?.error?.message || error.message,
      status,
      details: data,
    }

    return Promise.reject(apiError)
  }
)

// 請求方法封裝
export const get = <T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> => {
  return request.get(url, { params, ...config })
}

export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return request.post(url, data, config)
}

export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return request.put(url, data, config)
}

export const del = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return request.delete(url, config)
}

export const patch = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return request.patch(url, data, config)
}

// 文件上傳
export const upload = <T = any>(
  url: string,
  file: File,
  config?: AxiosRequestConfig & {
    onUploadProgress?: (progressEvent: any) => void
  }
): Promise<T> => {
  const formData = new FormData()
  formData.append('file', file)

  return request.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...config,
  })
}

// 下載文件
export const download = (url: string, filename?: string, config?: AxiosRequestConfig): Promise<void> => {
  return request
    .get(url, {
      responseType: 'blob',
      ...config,
    })
    .then((response) => {
      const blob = new Blob([response])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    })
}

// 批量請求
export const all = <T = any>(requests: Promise<any>[]): Promise<T[]> => {
  return Promise.all(requests)
}

// 請求重試
export const retry = <T = any>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  return new Promise((resolve, reject) => {
    let retries = 0

    const attempt = () => {
      requestFn()
        .then(resolve)
        .catch((error) => {
          retries++
          if (retries <= maxRetries) {
            setTimeout(attempt, delay * retries)
          } else {
            reject(error)
          }
        })
    }

    attempt()
  })
}

// 取消請求
export const createCancelToken = () => {
  return axios.CancelToken.source()
}

// 檢查是否為取消請求
export const isCancel = (error: any): boolean => {
  return axios.isCancel(error)
}

// 請求攔截器管理
export const addRequestInterceptor = (
  onFulfilled?: (value: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>,
  onRejected?: (error: any) => any
) => {
  return request.interceptors.request.use(onFulfilled, onRejected)
}

export const addResponseInterceptor = (
  onFulfilled?: (value: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>,
  onRejected?: (error: any) => any
) => {
  return request.interceptors.response.use(onFulfilled, onRejected)
}

export const removeInterceptor = (type: 'request' | 'response', interceptor: number) => {
  if (type === 'request') {
    request.interceptors.request.eject(interceptor)
  } else {
    request.interceptors.response.eject(interceptor)
  }
}

// 默認導出
export default request
export { request }