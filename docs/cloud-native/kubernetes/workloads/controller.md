---
title: 控制器
---

Kubernetes 中内建了很多的 controller（控制器），这些控制器相当于一个状态机，用来控制 Pod 的具体状态和行为

## ReplicaSet

ReplicaSet 的目的是维护一组在任何时候都处于运行状态的 Pod 副本的稳定集合。 因此，它通常用来保证给定数量的、完全相同的 Pod 的可用性。

**建议使用Deployment**

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

默认选项

`.spec.strategy.type==RollingUpdate` 采取滚动更新的方式更新 Pods。可以指定 maxUnavailable 和 maxSurge 来控制滚动更新过程。

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

DaemonSet 确保全部（或者某些）节点上运行一个 Pod 的副本。当有节点加入集群时，也会为他们新增一个 Pod。当有节点从集群移除时，这些 Pod 也会被回收。删除 DaemonSet 将会删除它创建的所有 Pod。

DaemonSet 的一些典型用法

+ 在每个节点上运行集群守护进程

+ 在每个节点上运行日志收集守护进程

+ 在每个节点上运行监控守护进程

## Jobs

Job 会创建一个或者多个 Pods，并将继续重试 Pods 的执行，直到指定数量的 Pods 成功终止。 随着 Pods 成功结束，Job 跟踪记录成功完成的 Pods 个数。当数量达到指定的成功个数阈值时，任务（即 Job）结束。 删除 Job 的操作会清除所创建的全部 Pods。 挂起 Job 的操作会删除 Job 的所有活跃 Pod，直到 Job 被再次恢复执行。

## CronJob

CronJob 创建基于时隔重复调度的 Jobs。

一个 CronJob 对象就像 crontab (cron table) 文件中的一行。它用 Cron 格式进行编写，并周期性地在给定的调度时间执行 Job。
