import wyNav from './nav.js'
import wySidebar from './sidebar.js'

// https://vitepress.dev/reference/site-config
export default ({
  base: '/blog/',
  title: "pddzl",
  lang: 'zh-CN',
  description: "pddzl做笔记的地方",
  lastUpdated: true,
  markdown: {
    lineNumbers: true, //显示代码行数
  },
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
