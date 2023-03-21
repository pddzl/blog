---
outline: deep
---

# Docker

## 安装

### Yum安装

安装 yum 源

```shell
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

列出 `docker` 的版本

```shell
[root@node1 ~]# yum list docker-ce.x86_64  --showduplicates |sort -r
 * updates: mirrors.aliyun.com
Loading mirror speeds from cached hostfile
Loaded plugins: fastestmirror
 * extras: mirrors.aliyun.com
docker-ce.x86_64            3:20.10.9-3.el7                     docker-ce-stable
docker-ce.x86_64            3:20.10.8-3.el7                     docker-ce-stable
docker-ce.x86_64            3:20.10.7-3.el7                     docker-ce-stable
docker-ce.x86_64            3:20.10.6-3.el7                     docker-ce-stable
docker-ce.x86_64            3:20.10.5-3.el7                     docker-ce-stable
docker-ce.x86_64            3:20.10.4-3.el7                     docker-ce-stable
docker-ce.x86_64            3:20.10.3-3.el7                     docker-ce-stable
docker-ce.x86_64            3:20.10.2-3.el7                     docker-ce-stable
docker-ce.x86_64            3:20.10.1-3.el7                     docker-ce-stable
docker-ce.x86_64            3:20.10.12-3.el7                    docker-ce-stable
docker-ce.x86_64            3:20.10.11-3.el7                    docker-ce-stable
docker-ce.x86_64            3:20.10.10-3.el7                    docker-ce-stable
docker-ce.x86_64            3:20.10.0-3.el7                     docker-ce-stable
docker-ce.x86_64            3:19.03.9-3.el7                     docker-ce-stable
docker-ce.x86_64            3:19.03.8-3.el7                     docker-ce-stable
docker-ce.x86_64            3:19.03.7-3.el7                     docker-ce-stable
docker-ce.x86_64            3:19.03.6-3.el7                     docker-ce-stable
docker-ce.x86_64            3:19.03.5-3.el7                     docker-ce-stable
docker-ce.x86_64            3:19.03.4-3.el7                     docker-ce-stable
docker-ce.x86_64            3:19.03.3-3.el7                     docker-ce-stable
docker-ce.x86_64            3:19.03.2-3.el7                     docker-ce-stable
docker-ce.x86_64            3:19.03.15-3.el7                    docker-ce-stable
docker-ce.x86_64            3:19.03.14-3.el7                    docker-ce-stable
docker-ce.x86_64            3:19.03.1-3.el7                     docker-ce-stable
docker-ce.x86_64            3:19.03.13-3.el7                    docker-ce-stable
...
```

安装

```shell
yum install -y --setopt=obsoletes=0 docker-ce-20.10.9-3.el7
```

启动、查看版本

```shell
[root@node1 ~]# docker version
Client: Docker Engine - Community
 Version:           20.10.12
 API version:       1.41
 Go version:        go1.16.12
 Git commit:        e91ed57
 Built:             Mon Dec 13 11:45:41 2021
 OS/Arch:           linux/amd64
 Context:           default
 Experimental:      true

Server: Docker Engine - Community
 Engine:
  Version:          20.10.9
  API version:      1.41 (minimum version 1.12)
  Go version:       go1.16.8
  Git commit:       79ea9d3
  Built:            Mon Oct  4 16:06:37 2021
  OS/Arch:          linux/amd64
  Experimental:     false
 containerd:
  Version:          v1.5.8
  GitCommit:        1e5ef943eb76627a6d3b6de8cd1ef6537f393a71
 runc:
  Version:          1.1.0-rc.1
  GitCommit:        v1.1.0-rc.1-0-g55df1fc4
 docker-init:
  Version:          0.19.0
  GitCommit:        de40ad0
```

### 案例

docker安装 `mysql` ，并映射数据到本地

```shell
docker run -p 3306:3306 --name kop -v /data/mysql/kop:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=kop@2022 -d mysql:8.0.21 --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
```

docker安装 `nginx`，并映射数据到本地

```shell
docker run -d -p 8080:80 --name myNginx -v /data/nginx:/usr/share/nginx/html nginx:1.21.6
```

## 镜像

### 拉取

`docker pull [OPTIONS] NAME[:TAG|@DIGEST]`

- 从官方仓库拉取镜像（Docker Hub）

`docker pull ubuntu:18.04`

- 从第三方仓库拉取镜像

`docker pull hub.pdd.com:9881/sc/kubeops/release:1.0.0`

### 列出

`docker image ls`

```shell
[root@localhost ~]# docker image ls
REPOSITORY           TAG                 IMAGE ID            CREATED             SIZE
redis                latest              5f515359c7f8        5 days ago          183 MB
nginx                latest              05a60462f8ba        5 days ago          181 MB
mongo                3.2                 fe9198c04d62        5 days ago          342 MB
<none>               <none>              00285df0df87        5 days ago          342 MB
ubuntu               18.04               f753707788c5        4 weeks ago         127 MB
ubuntu               latest              f753707788c5        4 weeks ago         127 MB
```

列表包含了`仓库名`、`标签`、`镜像ID`、`创建时间`以及`所占用的空间`。镜像 ID 则是镜像的唯一标识，**一个镜像可以对应多个标签**

### 构建

`docker build -t myhttp:v1 .`

```shell
[root@node1 ~]# docker image ls
REPOSITORY   TAG       IMAGE ID       CREATED         SIZE
myhttp       v1        b5d624877dd4   19 hours ago    10MB
```

## Dockerfile

### 多阶段构建

```shell
[root@node1 go]# tree .
.
├── dockerfile
├── go.mod
└── main.go

0 directories, 3 files
```

main.go

```go
package main

import (
  "log"
  "net/http"
  "os/exec"
)

func getHostName(w http.ResponseWriter, r *http.Request) {
  cmd := exec.Command("sh", "-c", "hostname")
  output, err := cmd.CombinedOutput()
  if err != nil {
    log.Fatal(err)
  }
  w.Write(output)
}

func main() {
  http.HandleFunc("/", getHostName)
  err := http.ListenAndServe(":9090", nil)
  if err != nil {
    log.Printf("http server failed, err:%v\n", err)
    return
  }
}
```

dockerfile

```dockerfile
FROM golang:alpine AS builder

WORKDIR /build

ADD go.mod .
COPY . .
RUN go build -ldflags="-s -w" -o myHttp main.go


FROM alpine

WORKDIR /build
COPY --from=builder /build/myHttp /build/myHttp

CMD ["./myHttp"]
```

构建

```shell
docker build -t myhttp:v1 .
```

参考: `https://segmentfault.com/a/1190000016137548`
