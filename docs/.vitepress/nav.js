const myNav = [
  { text: "Home", link: "/" },
  {
    text: "Linux",
    activeMatch: "/linux/",
    items: [
      { text: "Date", link: "/linux/date" },
      { text: "Awk", link: "/linux/awk" },
    ],
  },
  {
    text: "前端",
    activeMatch: "/frontend/",
    items: [
      { text: "CSS", link: "/frontend/css/selector" },
      { text: "JavaScript", link: "/frontend/javascript/README" },
      { text: "Vue", link: "/frontend/vue/README" },
      { text: "Vite", link: "/frontend/vite/README" },
    ],
  },
  {
    text: "后端",
    activeMatch: "/backend/",
    items: [
      { text: "Golang", link: "/backend/golang/data_type/base" },
      { text: "Gorm", link: "/backend/gorm/introduction" },
      { text: "Gin", link: "/backend/gin/README" }
    ],
  },
  {
    text: "云原生",
    activeMatch: "/cloud-native/",
    items: [
      { text: "Docker", link: "/cloud-native/docker/README" },
      { text: "Docker Compose", link: "/cloud-native/compose/README" },
      { text: "Kubernetes", link: "/cloud-native/kubernetes/README" },
      { text: "KubeSphere", link: "/cloud-native/kubeSphere/README" },
    ],
  },
  {
    text: "数据库",
    activeMatch: "/db/",
    items: [
      { text: 'MySQL', link: '/db/mysql/join' },
      { text: "Redis", link: "/db/redis/README" }
    ],
  },
];

export default myNav
