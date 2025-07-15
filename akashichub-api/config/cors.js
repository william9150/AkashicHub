import cors from 'cors';

// CORS配置選項
const corsOptions = {
  // 允許的來源
  origin: function (origin, callback) {
    // 允許的來源列表
    const allowedOrigins = [
      'http://localhost:3000',      // React開發伺服器
      'http://localhost:3001',      // 備用開發端口
      'http://localhost:5173',      // Vite開發伺服器
      'http://localhost:8080',      // Vue開發伺服器
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8080',
      'https://akashichub.com',     // 生產環境域名
      'https://www.akashichub.com', // 生產環境域名
      'https://admin.akashichub.com' // 管理後台域名
    ];

    // 在開發環境允許所有來源
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // 允許無來源的請求（如行動應用程式、Postman等）
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('不被CORS政策允許的來源'));
    }
  },

  // 允許的HTTP方法
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],

  // 允許的請求頭
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-API-Key'
  ],

  // 允許的回應頭
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Per-Page',
    'X-Rate-Limit-Limit',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset'
  ],

  // 是否允許攜帶認證資訊
  credentials: true,

  // 預檢請求的快取時間（秒）
  maxAge: 86400, // 24小時

  // 是否通過預檢請求
  optionsSuccessStatus: 200
};

// 開發環境的寬鬆CORS配置
const developmentCorsOptions = {
  origin: true, // 允許所有來源
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: '*',
  credentials: true,
  maxAge: 86400
};

// 根據環境選擇CORS配置
const selectedCorsOptions = process.env.NODE_ENV === 'development' 
  ? developmentCorsOptions 
  : corsOptions;

// 創建CORS中間件
export const corsMiddleware = cors(selectedCorsOptions);

// 手動CORS處理器（用於特殊情況）
export function handleCors(req, res, next) {
  const origin = req.headers.origin;
  const allowedOrigins = corsOptions.origin;

  // 設置CORS頭部
  if (process.env.NODE_ENV === 'development' || !origin) {
    res.header('Access-Control-Allow-Origin', '*');
  } else {
    // 生產環境檢查來源
    allowedOrigins(origin, (err, allowed) => {
      if (allowed) {
        res.header('Access-Control-Allow-Origin', origin);
      }
    });
  }

  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,X-API-Key');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');

  // 處理預檢請求
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
}

// API特定的CORS配置
export const apiCorsOptions = {
  ...corsOptions,
  // API可能需要更嚴格的配置
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key'
  ]
};

export default corsMiddleware;