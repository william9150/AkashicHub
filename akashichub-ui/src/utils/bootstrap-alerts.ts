// Bootstrap 警告和確認對話框工具函數
export function showAlert(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  const alertContainer = document.createElement('div')
  alertContainer.className = 'position-fixed top-0 start-50 translate-middle-x'
  alertContainer.style.zIndex = '9999'
  alertContainer.style.marginTop = '20px'
  
  const alertTypeClass = {
    success: 'alert-success',
    error: 'alert-danger',
    warning: 'alert-warning',
    info: 'alert-info'
  }
  
  const iconClass = {
    success: 'bi-check-circle',
    error: 'bi-exclamation-triangle',
    warning: 'bi-exclamation-triangle',
    info: 'bi-info-circle'
  }
  
  alertContainer.innerHTML = `
    <div class="alert ${alertTypeClass[type]} alert-dismissible fade show" role="alert">
      <i class="bi ${iconClass[type]} me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `
  
  document.body.appendChild(alertContainer)
  
  // 自動移除
  setTimeout(() => {
    if (alertContainer.parentNode) {
      alertContainer.parentNode.removeChild(alertContainer)
    }
  }, 5000)
}

export function showConfirm(
  message: string,
  title: string = '確認',
  options: {
    confirmText?: string
    cancelText?: string
    type?: 'primary' | 'danger' | 'warning'
  } = {}
): Promise<boolean> {
  return new Promise((resolve) => {
    const { confirmText = '確定', cancelText = '取消', type = 'primary' } = options
    
    // 創建模態對話框
    const modalId = 'confirm-modal-' + Date.now()
    const modal = document.createElement('div')
    modal.id = modalId
    modal.className = 'modal fade'
    modal.tabIndex = -1
    modal.setAttribute('aria-labelledby', `${modalId}-label`)
    modal.setAttribute('aria-hidden', 'true')
    
    const buttonTypeClass = {
      primary: 'btn-primary',
      danger: 'btn-danger',
      warning: 'btn-warning'
    }
    
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="${modalId}-label">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            ${message}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${cancelText}</button>
            <button type="button" class="btn ${buttonTypeClass[type]}" id="${modalId}-confirm">${confirmText}</button>
          </div>
        </div>
      </div>
    `
    
    document.body.appendChild(modal)
    
    // 初始化 Bootstrap 模態對話框
    const bootstrapModal = new (window as any).bootstrap.Modal(modal)
    bootstrapModal.show()
    
    // 綁定事件
    const confirmBtn = modal.querySelector(`#${modalId}-confirm`)
    const cancelBtn = modal.querySelector('[data-bs-dismiss="modal"]')
    
    confirmBtn?.addEventListener('click', () => {
      bootstrapModal.hide()
      resolve(true)
    })
    
    cancelBtn?.addEventListener('click', () => {
      resolve(false)
    })
    
    // 清理
    modal.addEventListener('hidden.bs.modal', () => {
      document.body.removeChild(modal)
    })
  })
}