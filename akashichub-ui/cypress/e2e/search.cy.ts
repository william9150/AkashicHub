describe('搜索功能測試', () => {
  beforeEach(() => {
    cy.login()
  })

  describe('全局搜索', () => {
    it('應該能夠使用全局搜索', () => {
      cy.get('.global-search input').type('test server')
      cy.get('.global-search').click()
      
      // 應該顯示搜索結果彈窗
      cy.get('.search-popover').should('be.visible')
    })

    it('應該顯示搜索建議', () => {
      cy.get('.global-search input').click()
      
      cy.contains('搜索建議').should('be.visible')
      cy.contains('最近搜索').should('be.visible')
      cy.contains('熱門搜索').should('be.visible')
      cy.contains('快捷入口').should('be.visible')
    })

    it('應該能夠使用鍵盤快捷鍵', () => {
      cy.get('body').type('{ctrl}k')
      cy.get('.global-search').should('have.class', 'is-focus')
    })

    it('應該能夠導航到高級搜索', () => {
      cy.get('.global-search input').type('advanced search')
      cy.get('.global-search input').type('{enter}')
      
      cy.url().should('include', '/search')
      cy.url().should('include', 'q=advanced%20search')
    })
  })

  describe('高級搜索頁面', () => {
    beforeEach(() => {
      cy.navigateTo('/search')
    })

    it('應該顯示高級搜索頁面', () => {
      cy.contains('高級搜索')
      cy.get('.search-form-card').should('be.visible')
      cy.get('input[placeholder="輸入搜索關鍵字..."]').should('be.visible')
    })

    it('應該能夠執行基本搜索', () => {
      cy.intercept('GET', '/api/search*', {
        fixture: 'search-results.json'
      }).as('search')

      cy.get('input[placeholder="輸入搜索關鍵字..."]').type('web server')
      cy.contains('搜索').click()

      cy.wait('@search')
      cy.contains('找到').should('be.visible')
      cy.get('.search-results').should('be.visible')
    })

    it('應該能夠設置搜索範圍', () => {
      cy.get('[placeholder="選擇搜索範圍"]').click()
      cy.contains('資源').click()
      cy.contains('用戶').click()
      
      cy.get('input[placeholder="輸入搜索關鍵字..."]').type('test')
      cy.contains('搜索').click()
      
      cy.url().should('include', 'scope=resources,users')
    })

    it('應該能夠設置高級篩選條件', () => {
      // 設置資源類型篩選
      cy.contains('資源類型').parent().find('.el-select').click()
      cy.contains('伺服器').click()

      // 設置用戶角色篩選
      cy.contains('用戶角色').parent().find('.el-select').click()
      cy.contains('管理員').click()

      cy.get('input[placeholder="輸入搜索關鍵字..."]').type('admin')
      cy.contains('搜索').click()

      cy.url().should('include', 'resourceType=Server')
      cy.url().should('include', 'userRole=Admin')
    })

    it('應該能夠設置時間範圍', () => {
      cy.get('.el-date-picker').first().click()
      cy.get('.el-picker-panel__body').should('be.visible')
      
      // 選擇日期範圍（簡化處理）
      cy.get('.el-date-picker').first().type('2024-01-01 00:00:00')
      
      cy.get('input[placeholder="輸入搜索關鍵字..."]').type('test')
      cy.contains('搜索').click()
    })

    it('應該能夠重置搜索條件', () => {
      // 設置一些搜索條件
      cy.get('input[placeholder="輸入搜索關鍵字..."]').type('test')
      cy.contains('資源類型').parent().find('.el-select').click()
      cy.contains('伺服器').click()

      // 重置
      cy.contains('重置').click()

      cy.get('input[placeholder="輸入搜索關鍵字..."]').should('have.value', '')
    })

    it('應該顯示搜索結果統計', () => {
      cy.intercept('GET', '/api/search*', {
        body: {
          success: true,
          data: {
            resources: [{ id: 1, name: 'Test Server' }],
            users: [],
            tags: []
          }
        }
      }).as('searchWithResults')

      cy.get('input[placeholder="輸入搜索關鍵字..."]').type('server')
      cy.contains('搜索').click()

      cy.wait('@searchWithResults')
      cy.contains('找到 1 個結果').should('be.visible')
    })

    it('應該能夠切換搜索結果標籤頁', () => {
      cy.intercept('GET', '/api/search*', {
        fixture: 'search-results.json'
      }).as('searchResults')

      cy.get('input[placeholder="輸入搜索關鍵字..."]').type('test')
      cy.contains('搜索').click()

      cy.wait('@searchResults')

      // 切換到資源標籤頁
      cy.contains('資源 (').click()
      cy.get('[name="resources"]').should('be.visible')

      // 切換到用戶標籤頁
      cy.contains('用戶 (').click()
      cy.get('[name="users"]').should('be.visible')

      // 切換到標籤標籤頁
      cy.contains('標籤 (').click()
      cy.get('[name="tags"]').should('be.visible')
    })

    it('應該能夠點擊搜索結果導航', () => {
      cy.intercept('GET', '/api/search*', {
        body: {
          success: true,
          data: {
            resources: [{ 
              id: 1, 
              name: 'Test Server',
              type: 'resource',
              resourceType: 'Server',
              ipAddress: '192.168.1.100'
            }],
            users: [],
            tags: []
          }
        }
      }).as('searchWithResource')

      cy.get('input[placeholder="輸入搜索關鍵字..."]').type('server')
      cy.contains('搜索').click()

      cy.wait('@searchWithResource')
      cy.contains('Test Server').click()

      cy.url().should('include', '/resources/1')
    })

    it('應該能夠保存搜索模板', () => {
      cy.get('input[placeholder="輸入搜索關鍵字..."]').type('template test')
      cy.contains('保存為模板').click()

      cy.get('.el-dialog').should('be.visible')
      cy.get('input[placeholder="輸入模板名稱"]').type('我的搜索模板')
      cy.contains('保存').click()

      cy.checkMessage('success', '搜索模板已保存')
    })

    it('應該處理無搜索結果的情況', () => {
      cy.intercept('GET', '/api/search*', {
        body: {
          success: true,
          data: {
            resources: [],
            users: [],
            tags: []
          }
        }
      }).as('noResults')

      cy.get('input[placeholder="輸入搜索關鍵字..."]').type('nonexistent')
      cy.contains('搜索').click()

      cy.wait('@noResults')
      cy.contains('沒有找到相關結果').should('be.visible')
      cy.contains('重新搜索').should('be.visible')
    })
  })

  describe('列表頁面搜索', () => {
    it('應該能夠在資源列表中搜索', () => {
      cy.navigateTo('/resources')
      
      cy.get('input[placeholder*="搜索"]').type('web server')
      cy.get('button[icon="Search"]').click()

      cy.url().should('include', 'search=web%20server')
    })

    it('應該能夠在用戶列表中搜索', () => {
      cy.navigateTo('/users')
      
      cy.get('input[placeholder*="搜索"]').type('admin')
      cy.get('button[icon="Search"]').click()

      cy.url().should('include', 'search=admin')
    })

    it('應該能夠在標籤列表中搜索', () => {
      cy.navigateTo('/tags')
      
      cy.get('input[placeholder*="搜索"]').type('環境')
      cy.get('button[icon="Search"]').click()

      cy.url().should('include', 'search=環境')
    })

    it('應該能夠從列表頁面前往高級搜索', () => {
      cy.navigateTo('/resources')
      
      cy.get('.search-input .el-button[icon="Setting"]').click()
      
      cy.url().should('include', '/search')
      cy.url().should('include', 'scope=resources')
    })
  })
})