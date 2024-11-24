const sidebar = {
  "/linux/": [
    {
      // text: "Date",
      items: [
        { text: 'Date', link: "/linux/date" }
      ]
    },
    {
      // text: "Awk",
      items: [
        { text: 'Awk', link: "/linux/awk" }
      ]
    },
  ],
  "/frontend/": [
    {
      text: "CSS",
      items: [
        { text: '选择器', link: "/frontend/css/selector" },
        { text: '布局', link: "/frontend/css/layout" }
      ]
    },
    {
      // text: "JavaScript",
      items: [
        { text: 'JavaScript', link: "/frontend/javascript/README" }
      ]
    },
    {
      // text: "Vue",
      items: [
        { text: 'Vue', link: "/frontend/vue/README" }
      ]
    },
    {
      // text: "Vite",
      items: [
        { text: 'Vite', link: "/frontend/vite/README" }
      ]
    },
  ],
  "/backend/": [
    {
      text: "Golang",
      items: [
        { text: "数据类型",
          items: [
            { text: '基础类型', link: "/backend/golang/data_type/base" },
            { text: '聚合类型', link: "/backend/golang/data_type/aggregation" },
            { text: '引用类型', link: "/backend/golang/data_type/reference" }
          ]
        },
        { text: "函数", link: "/backend/golang/functions" },
        { text: "关键字", link: "/backend/golang/keyword" },
        { text: '接口', link: '/backend/golang/interface' },
        { text: '反射', link: '/backend/golang/reflect' },
        { text: "并发", 
          items: [
            { text: 'Context', link: '/backend/golang/concurrence/context' },
            { text: 'Goroutine', link: '/backend/golang/concurrence/goroutine' },
            { text: 'Channel', link: '/backend/golang/concurrence/channel' }
          ]
        },
        { text: "系统", link: "/backend/golang/system" },
        { text: "输入输出", link: "/backend/golang/io" },
      ],
    },
    {
      text: "Gorm",
      items: [
        { text: '入门指南', link: '/backend/gorm/introduction' },
        { text: 'CURD', link: '/backend/gorm/curd' },
        { text: '关联', link: '/backend/gorm/assocation' },
        { text: '教程', link: '/backend/gorm/tutorial' }
      ]
    },
    { text: "Gin", link: "/backend/gin/README"}
  ],
  "/cloud-native/": [
    { text: "Docker", link: "/cloud-native/docker/README" },
    { text: "Docker Compose", link: "/cloud-native/compose/README" },
    {
      text: "Kubernetes",
      items: [
        { text: "概述", link: "/cloud-native/kubernetes/README" },
        { text: "安装", link: "/cloud-native/kubernetes/install" },
        { text: "Pod", link: "/cloud-native/kubernetes/workloads/pod" },
        { text: "控制器", link: "/cloud-native/kubernetes/workloads/controller" },
        { text: "策略", link: "/cloud-native/kubernetes/policy/README" },
        { text: "服务",
          items: [
            { text: "Ingress", link: "/cloud-native/kubernetes/services/ingress" }
          ]
        }
      ],
    },
    { text: "KubeSphere", link: "/cloud-native/kubeSphere/README" }
  ],
  "/db/": [
    { text: "Redis", link: "/db/redis/README" },
    {
      text: 'MySQL',
      items: [
        { text: 'Join', link: '/db/mysql/join' }
      ]
    }
  ],
};

export default sidebar
