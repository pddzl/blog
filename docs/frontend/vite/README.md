---
title: Vite
---

## 配置文件

vite.config.js

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    open: true,
    port: process.env.VITE_CLI_PORT,
    proxy: {
      [process.env.VITE_BASE_API]: { // 需要代理的路径   例如 '/api'
        target: `${process.env.VITE_BASE_PATH}:${process.env.VITE_SERVER_PORT}/`, // 代理到 目标路径
        changeOrigin: true,
        // rewrite: path => path.replace(new RegExp('^' + process.env.VITE_BASE_API), ''),
      }
    }
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
  }
})
```
