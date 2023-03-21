module.exports = [
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
      { text: "Golang", link: "/backend/golang/data-type" },
      { text: "Gorm", link: "/backend/gorm/README" },
    ],
  },
  {
    text: "云原生",
    activeMatch: "/cloud-native/",
    items: [
      { text: "Docker", link: "/cloud-native/docker/README" },
      { text: "Docker Compose", link: "/cloud-native/compose/README" },
      { text: "Kubernetes", link: "/cloud-native/kubernetes/README" },
    ],
  },
  {
    text: "数据库",
    activeMatch: "/db/",
    items: [
      { text: "Redis", link: "/db/redis/README" }
    ],
  },
];
