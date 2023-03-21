import { defineConfig } from 'vitepress'
const wyNav = require('./nav.js')
const wySidebar = require('./sidebar.js')

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/blog/',
  title: "pddzl",
  lang: 'zh-CN',
  description: "pddzl做笔记的地方",
  lastUpdated: true,
  markdown: {
    lineNumbers: true, //显示代码行数
  },
  head: [
    ['links', {rel: 'icon', href: '/images/logo.png'}]
  ],
  themeConfig: {
    lastUpdatedText: '上次更新',
    docFooter: { //上下篇文本
      prev: '上一篇',
      next: '下一篇'
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: wyNav,
    sidebar: wySidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/pddzl' }
    ]
  }
})
