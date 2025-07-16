// 簡單的 API 測試腳本
import express from 'express';

const app = express();
app.use(express.json());

// 模擬資源數據
const mockResources = [
  {
    Id: 1,
    Name: '測試伺服器',
    ResourceType: 'Server',
    IpAddress: '192.168.1.100',
    Port: 80,
    Description: '測試用的Web伺服器',
    Tags: []
  },
  {
    Id: 2,
    Name: '測試資料庫',
    ResourceType: 'Database',
    IpAddress: '192.168.1.101',
    Port: 3306,
    Description: 'MySQL測試資料庫',
    Tags: []
  }
];

// 測試路由
app.get('/api/resources', (req, res) => {
  console.log('✅ 收到資源列表請求');
  
  const { keyword, page = 1, limit = 20 } = req.query;
  
  let filteredResources = mockResources;
  
  // 如果有關鍵字，進行篩選
  if (keyword) {
    filteredResources = mockResources.filter(resource => 
      resource.Name.toLowerCase().includes(keyword.toLowerCase()) ||
      resource.Description.toLowerCase().includes(keyword.toLowerCase()) ||
      resource.IpAddress.includes(keyword)
    );
  }
  
  const totalCount = filteredResources.length;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const paginatedResources = filteredResources.slice(offset, offset + parseInt(limit));
  
  const response = {
    success: true,
    data: {
      resources: paginatedResources,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < totalCount,
        hasPrev: parseInt(page) > 1
      }
    }
  };
  
  console.log('✅ 返回資源數據:', response);
  res.json(response);
});

// 啟動測試服務器
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🧪 測試 API 服務器運行在 http://localhost:${PORT}`);
  console.log('📋 可用的測試端點:');
  console.log('   GET /api/resources - 獲取資源列表');
  console.log('   GET /api/resources?keyword=測試 - 搜尋資源');
  console.log('   GET /api/resources?page=1&limit=10 - 分頁資源');
});

export default app;