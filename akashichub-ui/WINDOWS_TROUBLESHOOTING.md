# Windows 環境故障排除指南

## 問題：瀏覽器無法訪問 localhost:5173

### 可能原因和解決方案

#### 1. 防火牆阻擋
**症狀**: 開發服務器啟動成功，但瀏覽器顯示「找不到網頁」

**解決方案**:
```bash
# 方法1: 使用專用的Windows命令
npm run dev:windows

# 方法2: 使用批次檔啟動
start-dev.bat

# 方法3: 手動指定host
npx vite --host localhost --port 5173
```

#### 2. Windows Defender 防火牆設置
1. 開啟「Windows Defender 防火牆」
2. 點擊「允許應用程式或功能通過 Windows Defender 防火牆」
3. 找到「Node.js」並確保已勾選「私人」和「公用」
4. 如果沒有找到，點擊「允許其他應用程式」並添加 Node.js

#### 3. 網絡介面卡問題
```bash
# 檢查網絡配置
ipconfig /all

# 刷新DNS
ipconfig /flushdns

# 重置網絡堆疊
netsh winsock reset
netsh int ip reset
```

#### 4. 端口被佔用
```bash
# 檢查端口5173是否被佔用
netstat -ano | findstr :5173

# 如果端口被佔用，終止佔用的進程
taskkill /PID <PID> /F

# 或使用不同端口
npx vite --port 3000
```

#### 5. 代理服務器干擾
- 檢查瀏覽器代理設置
- 暫時停用 VPN
- 檢查企業網絡代理設置

### 替代解決方案

#### 使用其他網絡地址
如果 localhost 無法訪問，嘗試：
- `http://127.0.0.1:5173/`
- `http://0.0.0.0:5173/`
- 使用顯示的 Network 地址（如 `http://192.168.169.60:5173/`）

#### 修改 hosts 文件
1. 以管理員身份打開記事本
2. 開啟 `C:\Windows\System32\drivers\etc\hosts`
3. 添加行: `127.0.0.1 localhost`
4. 儲存檔案

## 環境配置問題

### Node.js 版本問題
```bash
# 檢查 Node.js 版本（需要 >= 18.0.0）
node --version

# 如果版本過舊，請從 https://nodejs.org/ 下載最新版本
```

### npm 權限問題
```bash
# 清除 npm 快取
npm cache clean --force

# 刪除 node_modules 重新安裝
rmdir /s node_modules
npm install
```

### 環境變數問題
```bash
# 檢查環境變數
echo %PATH%

# 確保 Node.js 在 PATH 中
where node
where npm
```

## 開發工具建議

### 推薦的 Windows 開發環境設置

1. **使用 Windows Terminal**
   - 更好的命令行體驗
   - 支持多個標籤頁

2. **安裝 Git for Windows**
   - 提供 Git Bash
   - 更好的 Unix 命令支持

3. **使用 VSCode**
   - 優秀的 Vue.js 支持
   - 整合終端機

### 有用的 Windows 命令

```bash
# 快速啟動開發服務器
start-dev.bat

# 檢查網絡連接
ping localhost
telnet localhost 5173

# 監控端口
netstat -an | findstr :5173

# 檢查進程
tasklist | findstr node
```

## 常見錯誤訊息

### "EADDRINUSE: address already in use"
**解決**: 端口被佔用，使用不同端口或終止佔用進程

### "ENOENT: no such file or directory"
**解決**: 檢查檔案路徑，確保依賴已安裝

### "Cannot resolve module"
**解決**: 重新安裝依賴，檢查 node_modules

### "Permission denied"
**解決**: 以管理員身份執行，或更改檔案權限

## 效能優化

### Windows 特定優化
```bash
# 排除 node_modules 從 Windows Defender 掃描
# 在 Windows Security > Virus & threat protection > Exclusions
# 添加資料夾排除: your-project-path/node_modules

# 使用 RAM disk (可選)
# 將 node_modules 放在 RAM disk 上以提升效能
```

### Vite 配置優化
```javascript
// vite.config.ts 中的 Windows 優化
export default defineConfig({
  server: {
    host: true,
    port: 5173,
    // Windows 特定優化
    watch: {
      usePolling: true, // 如果檔案監視有問題
    }
  }
})
```

## 聯繫支援

如果以上方法都無法解決問題：

1. 檢查 [GitHub Issues](your-repo-url/issues)
2. 提交新的 Issue，包含：
   - Windows 版本
   - Node.js 版本
   - npm 版本
   - 錯誤訊息完整截圖
   - 執行的命令
3. 聯繫開發團隊

## 快速檢查清單

- [ ] Node.js 版本 >= 18.0.0
- [ ] npm 版本 >= 8.0.0
- [ ] 防火牆允許 Node.js
- [ ] 端口 5173 未被佔用
- [ ] 網絡連接正常
- [ ] 依賴已正確安裝
- [ ] 環境變數配置正確
- [ ] 無代理服務器干擾