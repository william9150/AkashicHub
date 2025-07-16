import dotenv from 'dotenv';
import path from 'path';

// 載入測試環境變數
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

// 全域測試設置 - 簡化版本，移除jest相關設置
global.console = {
  ...console,
  // 在測試期間保留基本輸出
  log: console.log,
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
};