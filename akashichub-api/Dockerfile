# 使用官方 Node.js 映像
FROM node:20

# 建立工作目錄
WORKDIR /app

# 複製 package.json 及 package-lock.json
COPY package*.json ./

# 安裝相依套件
RUN npm ci --only=production

# 複製程式碼
COPY . .

# 開放服務埠
EXPOSE 3000

# 啟動指令：先同步資料表與預設管理員，再啟動服務
CMD ["sh", "-c", "node ./scripts/init.js && node index.js"]
