---
outline: deep
---

# Compose

## 安装

```shell
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.2.3/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
```

```shell
➜  ~ docker compose version
Docker Compose version v2.2.3
```

## Usage

`build` Build or rebuild services

`down` Stop and remove containers, networks. -v, --volumes volumes **推荐使用**

`ls` List running compose projects

`ps` List containers
  
`pull` Pull service images
  
`restart` Restart containers

`rm` Removes stopped service containers
  
`start` Start services
  
`stop` Stop services
  
`up` Create and start containers. -d, --detach, Detached mode: 容器在后台运行

## 案例

### Django

Django + Nginx

#### 目录结构

```shell
├── backend
│   └── Dockerfile
├── docker-compose.yml
└── frontend
    ├── Dockerfile
    └── nginx
        └── default.template
```

```yaml
version: "3"
services:
  backend:
    container_name: lcm_backend
    sysctls:
      net.core.somaxconn: 65535
    build: ./backend/
    image: backend:1.4
#    volumes:
#      - ./backend/archerosLcm2:/code
    environment:
      - CLOUD_NAME=pdd
      - HY_TOOLS_CONF=testing
      - SCAN_HOST_LIST=10.192.116.11 10.192.116.12 10.192.116.13
      - DEPLOY_CALLBACK_URL=192.168.1.10
#    command: bash -c "gunicorn archerosLcm2.asgi:application -k uvicorn.workers.UvicornWorker --capture-output -b 0.0.0.0:51381 && celery multi start w1 -A archerosLcm2 -P solo --time-limit=300 --concurrency=1 -l info --logfile=/tmp/celery.log"
    command: bash -c "gunicorn -c /usr/local/archeros-lcm/conf/gunicorn.conf.py & celery -A archerosLcm2 worker -P solo --time-limit=300 --concurrency=1 -l info --logfile=/tmp/celery.log"
#    ports:
#      - 51381:51381
    restart: on-failure
  frontend:
    container_name: lcm_frontend
    build: ./frontend/
    image: frontend:1.4
    environment:
      - BACKEND=backend
    command: bash -c "envsubst '$$BACKEND' < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"
    ports:
      - 51380:51380
    restart: always
```

#### 运行

当前目录下，`docker-compose up -d`

### Gin

Gin + Nginx

#### 目录结构

```shell
├── docker-compose.yml
├── mysql
│   └── init
│       └── sdn.sql
├── redis
│   └── redis.conf
├── server
│   ├── Dockerfile
│   └── wait-for.sh
└── web
    ├── Dockerfile
    └── nginx
        └── default.conf
```

#### 运行

当前目录下，`docker-compose up -d`
