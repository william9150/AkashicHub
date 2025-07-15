describe('資源管理功能測試', () => {
  beforeEach(() => {
    cy.login()
    cy.navigateTo('/resources')
  })

  it('應該顯示資源列表頁面', () => {
    cy.contains('資源管理')
    cy.get('.resources-list').should('be.visible')
    cy.get('.header-actions').should('be.visible')
    cy.get('.filter-bar').should('be.visible')
    cy.get('.el-table').should('be.visible')
  })

  it('應該能夠搜索資源', () => {
    cy.intercept('GET', '/api/resources*', {
      fixture: 'resources.json'
    }).as('getResources')

    cy.get('input[placeholder*="搜索"]').type('Web Server')
    cy.get('button[icon="Search"]').click()

    cy.wait('@getResources')
    cy.url().should('include', 'search=Web%20Server')
  })

  it('應該能夠篩選資源類型', () => {
    cy.intercept('GET', '/api/resources*', {
      fixture: 'resources.json'
    }).as('getFilteredResources')

    cy.get('.filter-bar').within(() => {
      cy.contains('資源類型').parent().find('.el-select').click()
    })
    cy.contains('伺服器').click()

    cy.wait('@getFilteredResources')
    cy.url().should('include', 'type=Server')
  })

  it('應該能夠篩選資源狀態', () => {
    cy.get('.filter-bar').within(() => {
      cy.contains('狀態').parent().find('.el-select').click()
    })
    cy.contains('正常').click()

    cy.url().should('include', 'status=active')
  })

  it('應該能夠重置篩選條件', () => {
    // 先設置一些篩選條件
    cy.get('input[placeholder*="搜索"]').type('test')
    cy.get('.filter-bar').within(() => {
      cy.contains('資源類型').parent().find('.el-select').click()
    })
    cy.contains('伺服器').click()

    // 重置篩選
    cy.contains('重置篩選').click()

    cy.get('input[placeholder*="搜索"]').should('have.value', '')
    cy.url().should('not.include', 'search=')
    cy.url().should('not.include', 'type=')
  })

  it('應該能夠查看資源詳情', () => {
    cy.intercept('GET', '/api/resources/1', {
      fixture: 'resource-detail.json'
    }).as('getResourceDetail')

    cy.clickTableAction(0, '查看')

    cy.wait('@getResourceDetail')
    cy.url().should('include', '/resources/1')
  })

  it('應該能夠新增資源（管理員）', () => {
    cy.contains('新增資源').click()
    cy.url().should('include', '/resources/create')
  })

  it('應該能夠編輯資源（管理員）', () => {
    cy.clickTableAction(0, '編輯')
    cy.url().should('match', /\/resources\/\d+\/edit/)
  })

  it('應該能夠刪除資源（管理員）', () => {
    cy.intercept('DELETE', '/api/resources/1', {
      statusCode: 200,
      body: { success: true }
    }).as('deleteResource')

    cy.clickTableAction(0, '刪除')
    cy.confirmDialog()

    cy.wait('@deleteResource')
    cy.checkMessage('success', '刪除成功')
  })

  it('應該能夠批量選擇和刪除資源', () => {
    cy.intercept('DELETE', '/api/resources/batch', {
      statusCode: 200,
      body: { success: true }
    }).as('batchDelete')

    // 選擇多個資源
    cy.get('.el-table__header .el-checkbox').click()
    
    // 點擊批量刪除
    cy.contains('批量刪除').click()
    cy.confirmDialog()

    cy.wait('@batchDelete')
    cy.checkMessage('success', '批量刪除成功')
  })

  it('應該能夠排序資源', () => {
    cy.intercept('GET', '/api/resources*', {
      fixture: 'resources-sorted.json'
    }).as('getSortedResources')

    cy.get('.el-table__header th').contains('資源名稱').click()

    cy.wait('@getSortedResources')
    cy.url().should('include', 'sort=name')
  })

  it('應該能夠分頁瀏覽', () => {
    cy.intercept('GET', '/api/resources*', {
      fixture: 'resources-page2.json'
    }).as('getPage2')

    cy.get('.el-pagination .btn-next').click()

    cy.wait('@getPage2')
    cy.url().should('include', 'page=2')
  })

  it('應該能夠更改每頁顯示數量', () => {
    cy.get('.el-pagination .el-select').click()
    cy.contains('50 條/頁').click()

    cy.url().should('include', 'pageSize=50')
  })

  it('應該能夠刷新數據', () => {
    cy.intercept('GET', '/api/resources*', {
      fixture: 'resources.json'
    }).as('refreshResources')

    cy.contains('刷新').click()

    cy.wait('@refreshResources')
  })

  it('應該顯示正確的資源類型圖標和標籤', () => {
    cy.get('.el-table__body tr').first().within(() => {
      cy.get('.resource-name .el-icon').should('be.visible')
      cy.get('.el-tag').should('be.visible')
    })
  })

  it('應該能夠前往高級搜索', () => {
    cy.get('.search-input .el-button').click()
    cy.url().should('include', '/search')
  })
})

describe('資源創建功能測試', () => {
  beforeEach(() => {
    cy.login()
    cy.navigateTo('/resources/create')
  })

  it('應該顯示資源創建頁面', () => {
    cy.contains('新增資源')
    cy.get('.resource-form').should('be.visible')
  })

  it('應該能夠創建新資源', () => {
    cy.intercept('POST', '/api/resources', {
      statusCode: 201,
      body: {
        success: true,
        data: { id: 123 }
      }
    }).as('createResource')

    cy.fillForm({
      name: '測試伺服器',
      resourceType: 'Server',
      ipAddress: '192.168.1.100',
      loginUser: 'admin'
    })

    cy.contains('保存').click()

    cy.wait('@createResource')
    cy.checkMessage('success', '資源創建成功')
    cy.url().should('include', '/resources/123')
  })

  it('應該驗證必填欄位', () => {
    cy.contains('保存').click()
    cy.get('.el-form-item__error').should('be.visible')
  })
})