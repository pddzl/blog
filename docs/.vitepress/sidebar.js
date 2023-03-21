module.exports = {
  "/guide/": [
    {
      text: "指南",
      children: [
        {
          text: "介绍",
          link: "/guide/introduction",
        },
      ],
    },
  ],
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
        {
          text: "数据类型",
          link: "/backend/golang/data-type",
        },
        {
          text: "函数",
          link: "/backend/golang/functions",
        },
        {
          text: "关键字",
          link: "/backend/golang/keyword",
        },
        {
          text: "系统",
          link: "/backend/golang/system",
        },
        {
          text: "输入输出",
          link: "/backend/golang/io",
        },
      ],
    },
    {
      text: "Gorm",
      items: [
        {
          text: '介绍', link: "/backend/gorm/README",
        }
      ]
    },
  ],
  "/cloud-native/": [
    {
      text: "Docker",
      link: "/cloud-native/docker/README",
    },
    {
      text: "Docker Compose",
      link: "/cloud-native/compose/README",
    },
    {
      text: "Kubernetes",
      items: [
        {
          text: "概述",
          link: "/cloud-native/kubernetes/README",
        },
        {
          text: "安装",
          link: "/cloud-native/kubernetes/install",
        },
        {
          text: "Pod",
          link: "/cloud-native/kubernetes/workloads/pod",
        },
        {
          text: "控制器",
          link: "/cloud-native/kubernetes/workloads/controller",
        },
      ],
    },
  ],
  "/db/": [
    {
      text: "Redis",
      link: "/db/redis/README",
    },
  ],
};
