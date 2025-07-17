import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        {
          '@/utils/request': ['request'],
          '@/utils/auth': ['getToken', 'setToken', 'removeToken'],
          '@/stores/auth': ['useAuthStore'],
          '@/stores/app': ['useAppStore']
        }
      ],
      dts: true,
      eslintrc: {
        enabled: true
      }
    }),
    Components({
      dirs: ['src/components'],
      extensions: ['vue'],
      deep: true,
      dts: true
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `
          @use "@/styles/variables.scss" as *;
          @use "@/styles/mixins.scss" as *;
        `
      }
    }
  },
  server: {
    port: 5173,
    host: '0.0.0.0', // 明確設置為 0.0.0.0 以支持所有網絡接口
    strictPort: true, // 如果端口被佔用則失敗
    open: false, // 不自動打開瀏覽器以避免Windows問題
    cors: true,
    hmr: {
      port: 5174 // HMR 使用不同端口
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          bootstrap: ['bootstrap'],
          echarts: ['echarts', 'vue-echarts'],
          utils: ['axios', 'dayjs', 'lodash-es']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false
  }
})