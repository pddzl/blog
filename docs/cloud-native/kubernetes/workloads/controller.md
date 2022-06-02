---
title: 控制器
---

Kubernetes 中内建了很多的 controller（控制器），这些控制器相当于一个状态机，用来控制 Pod 的具体状态和行为

## ReplicaSet

## Deployments

一个 Deployment 为 Pods 和 ReplicaSets 提供声明式的更新能力。

### 创建

下面是一个 Deployment 示例。其中创建了一个 ReplicaSet，负责启动三个 myhttp Pods：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  namespace: test
  name: myhttp
  labels:
    app: myhttp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myhttp
  template:
    metadata:
      labels:
        app: myhttp
    spec:
      containers:
      - name: myhttp
        image: myhttp:v1
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 9090
```

1. 通过运行以下命令创建 Deployment ：

```shell
kubectl apply -f myhttp.yml
```

2. 检查 Deployment 是否已创建。

```shell
[root@node1 ~]# kubectl get deployments -n test
NAME     READY   UP-TO-DATE   AVAILABLE   AGE
myhttp   3/3     3            3           6d6h
```

### 更新

+ set 命令行更新

```shell
kubectl set image deployment/myhttp myhttp=docker.io/library/myhttp:v2 --record
```

+ edit 修改文件更新

`.spec.template.spec.containers[0].image` 从 `myhttp:v1` 更改为 `myhttp:v2`

```shell
kubectl edit deployment myhttp -n test
```

#### 更新策略

1. 重新构建（Recreate）

`.spec.strategy.type==Recreate` 在创建新 Pods 之前，所有现有的 Pods 会被杀死。

2. 滚动更新（RollingUpdate）

`.spec.strategy.type==RollingUpdate` 采取滚动更新的方式更新 Pods。可以指定 maxUnavailable 和 maxSurge 来控制滚动更新 过程。

最大不可用 `.spec.strategy.rollingUpdate.maxUnavailable` 是一个可选字段，用来指定更新过程中不可用的 Pod 的个数上限

最大峰值 `.spec.strategy.rollingUpdate.maxSurge` 是一个可选字段，用来指定可以创建的超出期望 Pod 个数的 Pod 数量。此值可以是绝对数（例如，5）或所需 Pods 的百分比（例如，10%）。

### 回滚

1. 首先，检查 Deployment 修订历史：

```shell
kubectl rollout history deployment/myhttp
```

2. 要查看修订历史的详细信息，运行：

```shell
kubectl rollout history deployment/myhttp --revision=1
```

3. 回滚到之前的修订版本（即版本1）

```shell
kubectl rollout undo deployment/myhttp --to-revision=1
```

### 伸缩

+ 手动伸缩

```shell
kubectl scale deployment/myhttp --replicas=10 -n test
```

+ 自动伸缩

根据一定的条件自动伸缩

```shell
kubectl autoscale deployment/myhttp -n test --min=10 --max=15 --cpu-percent=80
```

## StatefulSets

## DaemonSet

## Jobs

## CronJob
