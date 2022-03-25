// @ts-check
/**
 * @type {import('vitepress').UserConfig}
 */
module.exports = {
  base: '/blog/',
  title: 'Pddzl',
  lang: 'zh-CN',
  description: '天道酬勤',
  head: createHead(),
  themeConfig: {
    repo: 'pddzl',
    docsRepo: 'pddzl/blog',
    logo: '/sheep.png',
    docsBranch: 'main',
    // editLinks: true,
    // editLinkText: '为此页提供修改建议',
    nav: createNav(),
    sidebar: createSidebar(),
  },
};

/**
 * @type {()=>import('vitepress').HeadConfig[]}
 */

function createHead() {
  return [
    ['meta', { name: 'author', content: 'pddzl' }],
    [
      'meta',
      {
        name: 'keywords',
        content: 'docker, k8s, vue, golang',
      },
    ],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    [
      'meta',
      {
        name: 'viewport',
        content:
          'width=device-width,initial-scale=1,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no',
      },
    ],
    ['meta', { name: 'keywords', content: 'pddzl' }],
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ];
}

/**
 * @type {()=>import('./theme-default/config').DefaultTheme.NavItem[]}
 */
function createNav() {
  return [
    // { text: 'Home', link: '/' },
    {
      text: 'Linux',
      link: '/linux/',
      items: [
        {
          text: 'Shell',
          link: '/docs/linux/shell/README'
        },
        {
          text: 'Awk',
          link: '/docs/linux/awk/README'
        }
      ]
    },
    {
      text: '前端',
      link: '/frontend/',
      items: [
        {
          text: 'CSS',
          link: '/docs/frontend/css/README'
        },
        {
          text: 'JavaScript',
          link: '/docs/frontend/javascript/README'
        },
        {
          text: 'Vue',
          link: '/docs/frontend/vue/README'
        },
        {
          text: 'Vite',
          link: '/docs/frontend/vite/README'
        }
      ]
    },
    {
      text: 'Golang',
      link: '/golang/',
      items: [
        {
          text: 'Golang',
          link: '/docs/golang/base/README'
        },
        {
          text: 'Gin',
          link: '/docs/golang/gin/README'
        },
        {
          text: 'Gorm',
          link: '/docs/golang/gorm/README'
        }
      ]
    },
    {
      text: '云原生',
      link: '/cloud-native/',
      items: [
        {
          text: 'Docker',
          link: '/docs/cloud-native/docker/README'
        },
        {
          text: 'Docker Compose',
          link: '/docs/cloud-native/compose/README'
        },
        {
          text: 'Kubernetes',
          link: '/docs/cloud-native/kubernetes/README'
        },
      ]
    }
  ];
}

function createSidebar() {
  return {
    '/docs/guide/': [
      {
        text: '指南',
        children: [
          {
            text: '介绍',
            link: '/docs/guide/introduction'
          }
        ]
      }
    ],
    '/docs/linux/': [
      {
        text: 'Shell',
        link: '/docs/linux/shell/README'
      },
      {
        text: "Awk",
        link: '/docs/linux/awk/README'
      }
    ],
    '/docs/frontend/': [
      {
        text: 'CSS',
        link: '/docs/frontend/css/README'
      },
      {
        text: 'JavaScript',
        link: '/docs/frontend/javascript/README'
      },
      {
        text: 'Vue',
        link: '/docs/frontend/vue/README'
      },
      {
        text: 'Vite',
        link: '/docs/frontend/vite/README'
      },
    ],
    '/docs/golang/': [
      {
        text: 'Golang',
        children: [
          {
            text: '前言',
            link: '/docs/golang/base/README'
          },
          {
            text: '数据类型',
            link: '/docs/golang/base/data-type'
          },
          {
            text: '函数',
            link: '/docs/golang/base/functions'
          },
          {
            text: '系统',
            link: '/docs/golang/base/system'
          },
          {
            text: '输入输出',
            link: '/docs/golang/base/io'
          }
        ]
      },
      {
        text: 'Gin',
        link: '/docs/golang/gin/README'
      },
      {
        text: 'Gorm',
        link: '/docs/golang/gorm/README'
      }
    ],
    '/docs/cloud-native/': [
      {
        text: 'Docker',
        link: '/docs/cloud-native/docker/README'
      },
      {
        text: 'Docker Compose',
        link: '/docs/cloud-native/compose/README'
      },
      {
        text: 'Kubernetes',
        children: [
          {
            text: '概述',
            link: '/docs/cloud-native/kubernetes/README'
          },
          {
            text: '安装',
            link: '/docs/cloud-native/kubernetes/install'
          },
          {
            text: '控制器',
            link: '/docs/cloud-native/kubernetes/controller'
          }
        ]
      }
    ]
  };
}

// /**
//  * @type {(namespace:string,items:string[])=>string[]}
//  */
// function urlWrapper(namespace, items) {
//   return items.map((item) => namespace + item);
// }

// function getGuildNav() {
//   return urlWrapper('/guide', ['/']);
// }
