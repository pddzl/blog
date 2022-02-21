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
    {
      text: 'Linux',
      link: '/linux/',
      items: [
        {
          text: 'Shell',
          link: '/docs/linux/shell'
        },
        {
          text: 'Awk',
          link: '/docs/linux/awk'
        }
      ]
    },
    {
      text: '前端',
      link: '/frontend/',
      items: [
        {
          text: 'CSS',
          link: '/docs/frontend/css'
        },
        {
          text: 'Vue',
          link: '/docs/frontend/vue'
        },
        {
          text: 'Vite',
          link: '/docs/frontend/vite'
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
          link: '/docs/golang/gin'
        },
        {
          text: 'Gorm',
          link: '/docs/golang/gorm'
        }
      ]
    },
    {
      text: '云原生',
      link: '/cloud-native/',
      items: [
        {
          text: 'Docker',
          link: '/docs/cloud-native/docker'
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
    '/docs/linux/': [
      {
        text: 'Shell',
        children: [
          {
            text: 'shell',
            link: '/docs/linux/shell'
          }
        ]
      },
      {
        text: "Awk",
        children: [
          {
            text: 'awk',
            link: '/docs/linux/awk'
          }
        ]
      }
    ],
    '/docs/frontend/': [
      {
        text: 'CSS',
        children: [
          {
            text: 'CSS',
            link: '/docs/frontend/css'
          }
        ]
      },
      {
        text: 'Vue',
        children: [
          {
            text: 'Vue',
            link: '/docs/frontend/vue'
          }
        ]
      },
      {
        text: 'Vite',
        children: [
          {
            text: 'Vite',
            link: '/docs/frontend/vite'
          }
        ]
      },
    ],
    '/docs/golang/': [
      {
        text: 'Golang',
        children: [
          {
            text: '数据类型',
            link: '/docs/golang/base/data-type'
          },
          {
            text: '函数',
            link: '/docs/golang/base/functions'
          }
        ]
      }
    ],
    '/docs/cloud-native/': [
      {
        text: 'Docker',
        link: '/docs/cloud-native/docker'
      },
      {
        text: 'Kubernetes',
        children: [
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
