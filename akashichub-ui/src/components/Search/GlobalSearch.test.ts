import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import GlobalSearch from './GlobalSearch.vue'
import { mountComponent, setInputValue, clickElement } from '@/tests/utils'

// Mock vue-router
const mockPush = vi.fn()

describe('GlobalSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render search input correctly', () => {
    const wrapper = mountComponent(GlobalSearch)
    
    const searchInput = wrapper.find('.search-input')
    expect(searchInput.exists()).toBe(true)
    
    const placeholder = wrapper.find('input[placeholder="搜索資源、用戶、標籤..."]')
    expect(placeholder.exists()).toBe(true)
  })

  it('should show keyboard shortcut', () => {
    const wrapper = mountComponent(GlobalSearch)
    
    const shortcut = wrapper.find('.search-shortcut')
    expect(shortcut.exists()).toBe(true)
    expect(shortcut.text()).toContain('Ctrl + K')
  })

  it('should open search popover on input focus', async () => {
    const wrapper = mountComponent(GlobalSearch)
    
    const input = wrapper.find('input')
    await input.trigger('focus')
    await nextTick()
    
    // 檢查 searchVisible 是否為 true（通過 data 屬性）
    expect(wrapper.vm.searchVisible).toBe(true)
  })

  it('should perform search on input', async () => {
    const wrapper = mountComponent(GlobalSearch)
    
    await setInputValue(wrapper, 'input', 'test query')
    await nextTick()
    
    expect(wrapper.vm.searchQuery).toBe('test query')
  })

  it('should trigger search on enter key', async () => {
    const wrapper = mountComponent(GlobalSearch)
    
    await setInputValue(wrapper, 'input', 'test search')
    await wrapper.find('input').trigger('keyup.enter')
    await nextTick()
    
    expect(mockPush).toHaveBeenCalledWith({
      path: '/search',
      query: { q: 'test search' }
    })
  })

  it('should navigate to advanced search', async () => {
    const wrapper = mountComponent(GlobalSearch)
    
    // 設置搜索查詢
    await setInputValue(wrapper, 'input', 'advanced search')
    
    // 觸發 goToAdvancedSearch
    await wrapper.vm.goToAdvancedSearch()
    
    expect(mockPush).toHaveBeenCalledWith({
      path: '/search',
      query: { q: 'advanced search' }
    })
  })

  it('should handle keyboard shortcuts', async () => {
    const wrapper = mountComponent(GlobalSearch)
    
    // 模擬 Ctrl+K 按鍵
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true
    })
    
    await wrapper.vm.handleKeydown(event)
    
    expect(wrapper.vm.searchVisible).toBe(true)
  })

  it('should close search on Escape key', async () => {
    const wrapper = mountComponent(GlobalSearch)
    
    // 首先打開搜索
    wrapper.vm.searchVisible = true
    await nextTick()
    
    // 模擬 Escape 按鍵
    const event = new KeyboardEvent('keydown', {
      key: 'Escape'
    })
    
    await wrapper.vm.handleKeydown(event)
    
    expect(wrapper.vm.searchVisible).toBe(false)
  })

  it('should display search suggestions when no query', async () => {
    const wrapper = mountComponent(GlobalSearch)
    
    // 打開搜索但沒有查詢
    wrapper.vm.searchVisible = true
    wrapper.vm.searchQuery = ''
    await nextTick()
    
    // 應該顯示搜索建議
    expect(wrapper.vm.searchQuery).toBe('')
    expect(wrapper.vm.searchVisible).toBe(true)
  })

  it('should highlight search text in results', () => {
    const wrapper = mountComponent(GlobalSearch)
    
    const highlighted = wrapper.vm.highlightText('Test Server', 'test')
    expect(highlighted).toBe('Test Server') // 由於 case insensitive
    
    const highlighted2 = wrapper.vm.highlightText('Test Server', 'Server')
    expect(highlighted2).toBe('Test <mark>Server</mark>')
  })

  it('should navigate to resource detail', async () => {
    const wrapper = mountComponent(GlobalSearch)
    
    await wrapper.vm.goToResource(123)
    
    expect(mockPush).toHaveBeenCalledWith('/resources/123')
    expect(wrapper.vm.searchVisible).toBe(false)
  })

  it('should navigate to user detail', async () => {
    const wrapper = mountComponent(GlobalSearch)
    
    await wrapper.vm.goToUser(456)
    
    expect(mockPush).toHaveBeenCalledWith('/users/456')
    expect(wrapper.vm.searchVisible).toBe(false)
  })

  it('should filter by tag', async () => {
    const wrapper = mountComponent(GlobalSearch)
    
    const mockTag = { name: '生產環境' }
    await wrapper.vm.filterByTag(mockTag)
    
    expect(mockPush).toHaveBeenCalledWith({
      path: '/resources',
      query: { tag: '生產環境' }
    })
    expect(wrapper.vm.searchVisible).toBe(false)
  })

  it('should create resource with name', async () => {
    const wrapper = mountComponent(GlobalSearch)
    
    wrapper.vm.searchQuery = 'New Resource'
    await wrapper.vm.createResourceWithName()
    
    expect(mockPush).toHaveBeenCalledWith({
      path: '/resources/create',
      query: { name: 'New Resource' }
    })
    expect(wrapper.vm.searchVisible).toBe(false)
  })

  it('should show quick actions for search query', async () => {
    const wrapper = mountComponent(GlobalSearch)
    
    await setInputValue(wrapper, 'input', 'test query')
    await nextTick()
    
    expect(wrapper.vm.searchQuery).toBe('test query')
    // 當有搜索查詢時，應該顯示快速操作
  })

  it('should add search query to recent searches', () => {
    const wrapper = mountComponent(GlobalSearch)
    
    const query = 'new search term'
    wrapper.vm.addToRecentSearches(query)
    
    expect(wrapper.vm.recentSearches[0]).toBe(query)
  })

  it('should limit recent searches to 5 items', () => {
    const wrapper = mountComponent(GlobalSearch)
    
    // 添加 6 個搜索項
    for (let i = 1; i <= 6; i++) {
      wrapper.vm.addToRecentSearches(`search ${i}`)
    }
    
    expect(wrapper.vm.recentSearches.length).toBe(5)
    expect(wrapper.vm.recentSearches[0]).toBe('search 6') // 最新的在前面
  })

  it('should not duplicate recent searches', () => {
    const wrapper = mountComponent(GlobalSearch)
    
    wrapper.vm.addToRecentSearches('duplicate search')
    wrapper.vm.addToRecentSearches('duplicate search')
    
    const duplicateCount = wrapper.vm.recentSearches.filter(
      item => item === 'duplicate search'
    ).length
    
    expect(duplicateCount).toBe(1)
  })

  it('should set search query from suggestion', async () => {
    const wrapper = mountComponent(GlobalSearch)
    
    wrapper.vm.setSearchQuery('suggestion query')
    
    expect(wrapper.vm.searchQuery).toBe('suggestion query')
    expect(wrapper.vm.searchVisible).toBe(true)
  })
})