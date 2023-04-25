---
outline: deep
---

# 策略

## limitRange

`LimitRange` 是限制命名空间内可为每个适用的对象类别 （例如 Pod 或 PersistentVolumeClaim） 指定的资源分配量（限制和请求）的策略对象。

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: cpu-mem-limits
  namespace: kube-test
spec:
  limits:
  - type: Container
    max:
      cpu: "1"
      memory: 1Gi
    min:
      cpu: "0.1"
      memory: 100Mi
    default:
      cpu: "0.5"
      memory: 500Mi
    defaultRequest:
      cpu: "0.3"
      memory: 300Mi
```

```shell
[root@node1 mine]# kubectl describe limitrange cpu-mem-limits -n kube-test
Name:       cpu-mem-limits
Namespace:  kube-test
Type        Resource  Min    Max  Default Request  Default Limit  Max Limit/Request Ratio
----        --------  ---    ---  ---------------  -------------  -----------------------
Container   cpu       100m   1    300m             500m           -
Container   memory    100Mi  1Gi  300Mi            500Mi          -
```

## resourceQuotas

资源配额，通过 `ResourceQuota` 对象来定义，对每个命名空间的资源消耗总量提供限制。 它可以限制命名空间中某种类型的对象的总数目上限，也可以限制命名空间中的 Pod 可以使用的计算资源的总上限。

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: kube-test
---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: quota-mem-cpu
  namespace: kube-test
spec:
  hard:
    requests.cpu: "1"
    requests.memory: 1Gi
    limits.cpu: "2"
    limits.memory: 2Gi
```

```shell
[root@node1 mine]# kubectl describe resourcequota -n kube-test
Name:            quota-mem-cpu
Namespace:       kube-test
Resource         Used   Hard
--------         ----   ----
limits.cpu       1      2
limits.memory    1Gi    2Gi
requests.cpu     500m   1
requests.memory  500Mi  1Gi
```