#!/usr/bin/env node

import net from 'net'
import os from 'os'
import dns from 'dns'

console.log('🔍 診斷網絡和端口狀態...\n')

// 檢查端口是否被佔用
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.listen(port, (err) => {
      if (err) {
        resolve(false)
      } else {
        server.close(() => resolve(true))
      }
    })
    server.on('error', () => resolve(false))
  })
}

// 檢查網絡介面
function getNetworkInterfaces() {
  const interfaces = os.networkInterfaces()
  const result = []
  
  for (const name in interfaces) {
    const nets = interfaces[name]
    for (const net of nets) {
      // 只顯示 IPv4 且非內部地址
      if (net.family === 'IPv4' && !net.internal) {
        result.push({ name, address: net.address })
      }
    }
  }
  
  return result
}

// 測試DNS解析
function testDNS(hostname) {
  return new Promise((resolve) => {
    dns.resolve4(hostname, (err, addresses) => {
      if (err) {
        resolve(null)
      } else {
        resolve(addresses[0])
      }
    })
  })
}

// 測試TCP連接
function testConnection(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    const timeout = 3000
    
    socket.setTimeout(timeout)
    socket.on('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.on('timeout', () => {
      socket.destroy()
      resolve(false)
    })
    socket.on('error', () => {
      resolve(false)
    })
    
    socket.connect(port, host)
  })
}

async function diagnose() {
  console.log('📊 系統資訊:')
  console.log(`   作業系統: ${os.type()} ${os.release()}`)
  console.log(`   架構: ${os.arch()}`)
  console.log(`   Node.js: ${process.version}`)
  console.log(`   平台: ${process.platform}`)
  console.log()

  console.log('🌐 網絡介面:')
  const interfaces = getNetworkInterfaces()
  if (interfaces.length === 0) {
    console.log('   ❌ 沒有找到可用的網絡介面')
  } else {
    for (const iface of interfaces) {
      console.log(`   ✅ ${iface.name}: ${iface.address}`)
    }
  }
  console.log()

  console.log('🔌 端口檢查:')
  const ports = [5173, 5174, 3000, 80, 443]
  for (const port of ports) {
    const available = await checkPort(port)
    const status = available ? '✅ 可用' : '❌ 被佔用'
    console.log(`   端口 ${port}: ${status}`)
  }
  console.log()

  console.log('🔍 DNS解析測試:')
  const hosts = ['localhost', 'google.com', 'github.com']
  for (const host of hosts) {
    const ip = await testDNS(host)
    if (ip) {
      console.log(`   ✅ ${host} -> ${ip}`)
    } else {
      console.log(`   ❌ ${host} -> 解析失敗`)
    }
  }
  console.log()

  console.log('🔗 連接測試:')
  const connections = [
    { host: 'localhost', port: 5173 },
    { host: '127.0.0.1', port: 5173 },
    { host: '0.0.0.0', port: 5173 }
  ]
  
  for (const conn of connections) {
    const success = await testConnection(conn.host, conn.port)
    const status = success ? '✅ 連接成功' : '❌ 連接失敗'
    console.log(`   ${conn.host}:${conn.port} -> ${status}`)
  }
  console.log()

  console.log('💡 建議:')
  const port5173Available = await checkPort(5173)
  if (!port5173Available) {
    console.log('   ⚠️  端口 5173 被佔用，請使用以下命令查看佔用進程:')
    console.log('      Windows: netstat -ano | findstr :5173')
    console.log('      然後使用: taskkill /PID <PID> /F 終止進程')
  } else {
    console.log('   ✅ 端口 5173 可用')
  }
  
  if (interfaces.length > 0) {
    console.log('   💻 嘗試使用以下地址訪問:')
    console.log('      - http://localhost:5173/')
    console.log('      - http://127.0.0.1:5173/')
    for (const iface of interfaces) {
      console.log(`      - http://${iface.address}:5173/`)
    }
  }
  
  console.log('\n🚀 啟動開發服務器:')
  console.log('   npm run dev:windows')
  console.log('   或使用: npm run dev:development')
}

diagnose().catch(console.error)