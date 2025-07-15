import dotenv from 'dotenv';
import path from 'path';

// 載入測試環境變數
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

// 全域測試設置
global.console = {
  ...console,
  // 在測試期間禁用某些日誌輸出
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// 設置測試超時
jest.setTimeout(30000);

// 模擬 Winston logger
jest.mock('../utils/logger.js', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));