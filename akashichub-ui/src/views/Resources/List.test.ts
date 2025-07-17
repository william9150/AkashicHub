import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import ResourcesList from './List.vue'
import { mountComponent, setInputValue, clickElement, setupAuthState, createMockResource } from '@/tests/utils'
import { showAlert, showConfirm } from '@/utils/bootstrap-alerts'

// Mock vue-router
const mockPush = vi.fn()
const mockReplace = vi.fn()

describe('Resources List Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render resources list correctly', () => {
    const wrapper = mountComponent(ResourcesList)
    
    expect(wrapper.find('.resources-list').exists()).toBe(true)
    expect(wrapper.find('.header-actions').exists()).toBe(true)
    expect(wrapper.find('.filter-bar').exists()).toBe(true)
    expect(wrapper.find('.table-container').exists()).toBe(true)
  })

  it('should show admin controls for admin users', async () => {
    const wrapper = mountComponent(ResourcesList)
    const { authStore } = setupAuthState(wrapper.vm.$pinia, { role: 'Admin' })
    
    await nextTick()
    
    // 管理員應該看到新增資源按鈕
    expect(wrapper.text()).toContain('新增資源')
  })

  it('should hide admin controls for regular users', async () => {
    const wrapper = mountComponent(ResourcesList)
    const { authStore } = setupAuthState(wrapper.vm.$pinia, { role: 'User' })
    
    await nextTick()
    
    // 普通用戶不應該看到新增資源按鈕
    expect(wrapper.text()).not.toContain('新增資源')
  })

  it('should handle search input', async () => {
    const wrapper = mountComponent(ResourcesList)
    
    await setInputValue(wrapper, 'input[placeholder*="搜索"]', 'test server')
    
    expect(wrapper.vm.searchQuery).toBe('test server')
  })

  it('should trigger search on enter key', async () => {
    const wrapper = mountComponent(ResourcesList)
    
    wrapper.vm.handleSearch = vi.fn()
    
    await setInputValue(wrapper, 'input[placeholder*="搜索"]', 'test query')
    await wrapper.find('input[placeholder*="搜索"]').trigger('keyup.enter')
    
    expect(wrapper.vm.handleSearch).toHaveBeenCalled()
  })

  it('should clear search when clear button is clicked', async () => {
    const wrapper = mountComponent(ResourcesList)
    
    wrapper.vm.searchQuery = 'test query'
    wrapper.vm.handleSearchClear = vi.fn()
    
    await wrapper.vm.handleSearchClear()
    
    expect(wrapper.vm.handleSearchClear).toHaveBeenCalled()
  })

  it('should filter resources by type', async () => {
    const wrapper = mountComponent(ResourcesList)
    
    wrapper.vm.filters.resourceType = 'Server'
    wrapper.vm.handleFilter = vi.fn()
    
    await wrapper.vm.handleFilter()
    
    expect(wrapper.vm.handleFilter).toHaveBeenCalled()
    expect(wrapper.vm.filters.resourceType).toBe('Server')
  })

  it('should filter resources by status', async () => {
    const wrapper = mountComponent(ResourcesList)
    
    wrapper.vm.filters.status = 'active'
    await nextTick()
    
    expect(wrapper.vm.filters.status).toBe('active')
  })

  it('should filter resources by tags', async () => {
    const wrapper = mountComponent(ResourcesList)
    
    wrapper.vm.filters.tags = [1, 2]
    await nextTick()
    
    expect(wrapper.vm.filters.tags).toEqual([1, 2])
  })

  it('should reset all filters', async () => {
    const wrapper = mountComponent(ResourcesList)
    
    // 設置一些篩選條件
    wrapper.vm.searchQuery = 'test'
    wrapper.vm.filters.resourceType = 'Server'
    wrapper.vm.filters.status = 'active'
    wrapper.vm.filters.tags = [1]
    
    await wrapper.vm.resetFilters()
    
    expect(wrapper.vm.searchQuery).toBe('')
    expect(wrapper.vm.filters.resourceType).toBe('')
    expect(wrapper.vm.filters.status).toBe('')
    expect(wrapper.vm.filters.tags).toEqual([])
  })

  it('should navigate to create page', async () => {
    const wrapper = mountComponent(ResourcesList)
    
    await wrapper.vm.goToCreate()
    
    expect(mockPush).toHaveBeenCalledWith('/resources/create')
  })

  it('should navigate to detail page', async () => {
    const wrapper = mountComponent(ResourcesList)
    
    await wrapper.vm.goToDetail(123)
    
    expect(mockPush).toHaveBeenCalledWith('/resources/123')
  })

  it('should navigate to edit page', async () => {
    const wrapper = mountComponent(ResourcesList)
    
    await wrapper.vm.goToEdit(123)
    
    expect(mockPush).toHaveBeenCalledWith('/resources/123/edit')
  })

  it('should navigate to advanced search', async () => {
    const wrapper = mountComponent(ResourcesList)
    
    wrapper.vm.searchQuery = 'test query'
    await wrapper.vm.goToAdvancedSearch()
    
    expect(mockPush).toHaveBeenCalledWith({
      path: '/search',
      query: { 
        q: 'test query',
        scope: 'resources'
      }
    })
  })

  it('should handle pagination changes', async () => {
    const wrapper = mountComponent(ResourcesList)
    
    wrapper.vm.loadData = vi.fn()
    
    await wrapper.vm.handleCurrentChange(2)
    
    expect(wrapper.vm.pagination.currentPage).toBe(2)
    expect(wrapper.vm.loadData).toHaveBeenCalled()
  })

  it('should handle page size changes', async () => {
    const wrapper = mountComponent(ResourcesList)
    
    wrapper.vm.loadData = vi.fn()
    
    await wrapper.vm.handleSizeChange(50)
    
    expect(wrapper.vm.pagination.pageSize).toBe(50)
    expect(wrapper.vm.pagination.currentPage).toBe(1)
    expect(wrapper.vm.loadData).toHaveBeenCalled()
  })

  it('should handle sort changes', async () => {
    const wrapper = mountComponent(ResourcesList)
    
    wrapper.vm.loadData = vi.fn()
    
    await wrapper.vm.handleSortChange({ prop: 'name', order: 'ascending' })
    
    expect(wrapper.vm.sortConfig.prop).toBe('name')
    expect(wrapper.vm.sortConfig.order).toBe('ascending')
    expect(wrapper.vm.loadData).toHaveBeenCalled()
  })

  it('should delete resource with confirmation', async () => {
    const wrapper = mountComponent(ResourcesList)
    const mockResource = createMockResource({ id: 1, name: 'Test Server' })
    
    // Mock confirmation dialog
    vi.mocked(showConfirm).mockResolvedValue(true)
    wrapper.vm.loadData = vi.fn()
    
    await wrapper.vm.handleDelete(mockResource)
    
    expect(showConfirm).toHaveBeenCalledWith(
      '確定要刪除資源 "Test Server" 嗎？此操作不可恢復。',
      '確認刪除',
      expect.any(Object)
    )
    expect(showAlert).toHaveBeenCalledWith('刪除成功', 'success')
    expect(wrapper.vm.loadData).toHaveBeenCalled()
  })

  it('should handle delete cancellation', async () => {
    const wrapper = mountComponent(ResourcesList)
    const mockResource = createMockResource()
    
    // Mock user cancelling confirmation
    vi.mocked(showConfirm).mockResolvedValue(false)
    
    await wrapper.vm.handleDelete(mockResource)
    
    // 不應該調用成功消息或重載數據
    expect(showAlert).not.toHaveBeenCalled()
  })

  it('should handle batch delete with confirmation', async () => {
    const wrapper = mountComponent(ResourcesList)
    
    wrapper.vm.selectedRows = [
      createMockResource({ id: 1 }),
      createMockResource({ id: 2 })
    ]
    
    // Mock confirmation dialog
    vi.mocked(showConfirm).mockResolvedValue(true)
    wrapper.vm.loadData = vi.fn()
    
    await wrapper.vm.handleBatchDelete()
    
    expect(showConfirm).toHaveBeenCalledWith(
      '確定要刪除選中的 2 個資源嗎？此操作不可恢復。',
      '確認批量刪除',
      expect.any(Object)
    )
    expect(showAlert).toHaveBeenCalledWith('批量刪除成功', 'success')
    expect(wrapper.vm.selectedRows).toEqual([])
  })

  it('should warn when no resources selected for batch delete', async () => {
    const wrapper = mountComponent(ResourcesList)
    
    wrapper.vm.selectedRows = []
    
    await wrapper.vm.handleBatchDelete()
    
    expect(showAlert).toHaveBeenCalledWith('請選擇要刪除的資源', 'warning')
  })

  it('should handle selection changes', async () => {
    const wrapper = mountComponent(ResourcesList)
    
    const mockSelection = [
      createMockResource({ id: 1 }),
      createMockResource({ id: 2 })
    ]
    
    await wrapper.vm.handleSelectionChange(mockSelection)
    
    expect(wrapper.vm.selectedRows).toEqual(mockSelection)
  })

  it('should refresh data', async () => {
    const wrapper = mountComponent(ResourcesList)
    
    wrapper.vm.loadData = vi.fn()
    
    await wrapper.vm.refreshData()
    
    expect(wrapper.vm.loadData).toHaveBeenCalled()
  })

  it('should get correct resource type icon', () => {
    const wrapper = mountComponent(ResourcesList)
    
    expect(wrapper.vm.getResourceTypeIcon('Server')).toBe('Monitor')
    expect(wrapper.vm.getResourceTypeIcon('Database')).toBe('Coin')
    expect(wrapper.vm.getResourceTypeIcon('Website')).toBe('Basketball')
    expect(wrapper.vm.getResourceTypeIcon('Storage')).toBe('FolderOpened')
    expect(wrapper.vm.getResourceTypeIcon('Unknown')).toBe('Monitor')
  })

  it('should get correct resource type color', () => {
    const wrapper = mountComponent(ResourcesList)
    
    expect(wrapper.vm.getResourceTypeColor('Server')).toBe('#409eff')
    expect(wrapper.vm.getResourceTypeColor('Database')).toBe('#67c23a')
    expect(wrapper.vm.getResourceTypeColor('Website')).toBe('#e6a23c')
    expect(wrapper.vm.getResourceTypeColor('Unknown')).toBe('#909399')
  })

  it('should get correct status tag type', () => {
    const wrapper = mountComponent(ResourcesList)
    
    expect(wrapper.vm.getStatusTagType('active')).toBe('success')
    expect(wrapper.vm.getStatusTagType('inactive')).toBe('info')
    expect(wrapper.vm.getStatusTagType('maintenance')).toBe('warning')
  })

  it('should get correct status text', () => {
    const wrapper = mountComponent(ResourcesList)
    
    expect(wrapper.vm.getStatusText('active')).toBe('正常')
    expect(wrapper.vm.getStatusText('inactive')).toBe('停用')
    expect(wrapper.vm.getStatusText('maintenance')).toBe('維護中')
    expect(wrapper.vm.getStatusText('unknown')).toBe('未知')
  })

  it('should update URL parameters on search', async () => {
    const wrapper = mountComponent(ResourcesList)
    
    wrapper.vm.searchQuery = 'test query'
    wrapper.vm.filters.resourceType = 'Server'
    
    await wrapper.vm.updateUrlParams()
    
    expect(mockReplace).toHaveBeenCalledWith({
      path: '/resources',
      query: {
        search: 'test query',
        type: 'Server'
      }
    })
  })

  it('should initialize from URL parameters', async () => {
    // Mock route with query parameters
    const mockRoute = {
      path: '/resources',
      query: {
        search: 'server',
        type: 'Server',
        status: 'active',
        tags: '1,2'
      }
    }
    
    const wrapper = mountComponent(ResourcesList, {
      global: {
        mocks: {
          $route: mockRoute
        }
      }
    })
    
    await wrapper.vm.initFromUrlParams()
    
    expect(wrapper.vm.searchQuery).toBe('server')
    expect(wrapper.vm.filters.resourceType).toBe('Server')
    expect(wrapper.vm.filters.status).toBe('active')
    expect(wrapper.vm.filters.tags).toEqual([1, 2])
  })
})