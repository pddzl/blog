---
outline: deep
---

# 安装

以下内容为使用 kubeadm 部署 `kubernetes v1.23.1`

## 系统准备

| 主机名 | IP | 角色 |
| ----- | -- | --- |
| node1 | 10.192.104.101 | master |
| node2 | 10.192.104.102 | node |
| node3 | 10.192.104.103 | node |

### 设置主机名称

```shell
sudo hostnamectl set-hostname node1 --static
```

/etc/hosts文件追加

```shell
10.192.104.101 node1
10.192.104.102 node2
10.192.104.103 node3
```

### 设置DNS

`/etc/resolv.conf` **设置成阿里云的DNS，不然阿里云的k8s镜像解析不了**

```shell
nameserver 223.5.5.5
```

### 关闭防火墙

```shell
systemctl stop firewalld
systemctl disable firewalld
```

### 禁用selinux

```shell
setenforce 0
```

```shell
vim /etc/selinux/config
SELINUX=disabled
```

### 关闭Swap

Kubernetes 1.8 开始要求关闭系统的 Swap，如果不关闭，默认配置下 kubelet 将无法启动。 关闭系统的 Swap 方法如下

```shell
swapoff -a
```

修改 /etc/fstab 文件，注释掉 SWAP 的自动挂载，使用 free -m 确认 swap 已经关闭

swappiness 参数调整，修改 `/etc/sysctl.d/99-kubernetes-cri.conf` 添加下面一行

```shell
vm.swappiness=0
```

使生效

```shell
sysctl -p /etc/sysctl.d/99-kubernetes-cri.conf
```

### 开启ipvs

由于ipvs已经加入到了内核的主干，所以为 kube-proxy 开启 ipvs 的前提需要加载以下的内核模块

```txt
ip_vs
ip_vs_rr
ip_vs_wrr
ip_vs_sh
nf_conntrack_ipv4
```

在各个服务器节点上执行以下脚本

```shell
cat > /etc/sysconfig/modules/ipvs.modules <<EOF
#!/bin/bash
modprobe -- ip_vs
modprobe -- ip_vs_rr
modprobe -- ip_vs_wrr
modprobe -- ip_vs_sh
modprobe -- nf_conntrack_ipv4
EOF
chmod 755 /etc/sysconfig/modules/ipvs.modules && bash /etc/sysconfig/modules/ipvs.modules && lsmod | grep -e ip_vs -e nf_conntrack_ipv4
```

上面脚本创建了 `/etc/sysconfig/modules/ipvs.modules` 文件，保证在节点重启后能自动加载所需模块。 使用 `lsmod | grep -e ip_vs -e nf_conntrack_ipv4` 命令查看是否已经正确加载所需的内核模块。

接下来还需要确保各个节点上已经安装了 ipset 软件包，为了便于查看 ipvs 的代理规则，最好安装一下管理工具 ipvsadm 。

```shell
yum install -y ipset ipvsadm
```

**如果以上前提条件如果不满足，则即使 kube-proxy 的配置开启了 ipvs 模式，也会退回到 iptables 模式。**

## 部署CRI

这里的 `cri` 选择 `Containerd`

### 内核配置

创建 `/etc/modules-load.d/containerd.conf` 配置文件

```shell
cat << EOF > /etc/modules-load.d/containerd.conf
overlay
br_netfilter
EOF
```

```shell
modprobe overlay
modprobe br_netfilter
```

创建 `/etc/sysctl.d/99-kubernetes-cri.conf` 配置文件

```shell
cat << EOF > /etc/sysctl.d/99-kubernetes-cri.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
user.max_user_namespaces=28633
EOF
```

使生效

```shell
sysctl -p /etc/sysctl.d/99-kubernetes-cri.conf
```

### 下载安装

**在各个服务器节点上安装容器运行时 Containerd**

下载Containerd的二进制包

```shell
wget https://github.com/containerd/containerd/releases/download/v1.5.8/cri-containerd-cni-1.5.8-linux-amd64.tar.gz
```

`cri-containerd-cni-1.5.8-linux-amd64.tar.gz` 压缩包中已经按照官方二进制部署推荐的目录结构布局好。里面包含了 systemd 配置文件，containerd 以及 cni 的部署文件。 将解压缩到系统的根目录/中

```shell
[root@node1 ~]# tar -zxvf cri-containerd-cni-1.5.8-linux-amd64.tar.gz -C /
etc/
etc/systemd/
etc/systemd/system/
etc/systemd/system/containerd.service
etc/crictl.yaml
etc/cni/
etc/cni/net.d/
etc/cni/net.d/10-containerd-net.conflist
usr/
usr/local/
usr/local/sbin/
usr/local/sbin/runc
usr/local/bin/
usr/local/bin/critest
usr/local/bin/containerd-shim
usr/local/bin/containerd-shim-runc-v1
usr/local/bin/ctd-decoder
usr/local/bin/containerd
usr/local/bin/containerd-shim-runc-v2
usr/local/bin/containerd-stress
usr/local/bin/ctr
usr/local/bin/crictl
......
opt/cni/
opt/cni/bin/
opt/cni/bin/bridge
......
```

注意经测试 `cri-containerd-cni-1.5.8-linux-amd64.tar.gz` 包中包含的 runc 在 CentOS 7 下的动态链接有问题，这里从 runc 的 github 上单独下载 runc，并替换上面安装的 containerd 中的 runc

```shell
wget https://github.com/opencontainers/runc/releases/download/v1.1.0-rc.1/runc.amd64
mv /usr/local/sbin/runc /usr/local/sbin/runc.bak
mv runc.amd64 /usr/local/sbin/runc
chmod +x /usr/local/sbin/runc
```

### 配置

生成 containerd 的配置文件

```shell
mkdir -p /etc/containerd
containerd config default > /etc/containerd/config.toml
```

根据文档 Container runtimes 中的内容，对于使用 systemd 作为 init system 的 Linux 的发行版，使用 systemd 作为容器的   cgroup driver 可以确保服务器节点在资源紧张的情况更加稳定，因此这里配置各个节点上 containerd 的 cgroup driver 为 systemd

修改前面生成的配置文件 `/etc/containerd/config.toml`

```shell
[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc]
  ...
  [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
    SystemdCgroup = true
```

再修改 `/etc/containerd/config.toml` 中的

```shell
[plugins."io.containerd.grpc.v1.cri"]
  ...
  # sandbox_image = "k8s.gcr.io/pause:3.5"
  sandbox_image = "registry.aliyuncs.com/google_containers/pause:3.6"
```

配置 `containerd` 开机启动，并启动 `containerd`

```shell
systemctl enable containerd --now
```

使用 crictl 测试一下，确保可以打印出版本信息并且没有错误信息输出

```shell
[root@node1 ~]# crictl version
Version:  0.1.0
RuntimeName:  containerd
RuntimeVersion:  v1.5.8
RuntimeApiVersion:  v1alpha2
```

## 安装k8s

下面在各节点安装 kubeadm 和 kubelet

### 安装kubeadm和kubelet

```shell
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=http://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=http://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg
        http://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF
```

```shell
yum makecache fast
yum install -y kubelet-1.23.1 kubeadm-1.23.1 kubectl-1.23.1
```

### 初始化集群

在各节点开机启动 kubelet 服务

```shell
systemctl enable kubelet.service
```

使用 `kubeadm config print init-defaults --component-configs KubeletConfiguration` 可以打印集群初始化默认的使用的配置

```shell
kubeadm config print init-defaults --component-configs KubeletConfiguration > kubeadm.yaml
```

**需要修改的地方**

+ 将 advertiseAddress 修改为本机地址
+ imageRepository 改为阿里云的 registry，避免因 gcr 被墙，无法直接拉取镜像
+ criSocket 设置容器运行时为 containerd
+ kubelet 的 cgroupDriver 为 systemd
+ kube-proxy 代理模式为 ipvs
+ 添加 podSubnet 地址

以下为修改完的 kubeadm.yaml

```yaml
apiVersion: kubeadm.k8s.io/v1beta3
bootstrapTokens:
- groups:
  - system:bootstrappers:kubeadm:default-node-token
  token: abcdef.0123456789abcdef
  ttl: 24h0m0s
  usages:
  - signing
  - authentication
kind: InitConfiguration
localAPIEndpoint:
  advertiseAddress: 10.192.104.101
  bindPort: 6443
nodeRegistration:
  #criSocket: /run/containerd/containerd.sock
  criSocket: unix:///run/containerd/containerd.sock
  imagePullPolicy: IfNotPresent
#  name: node
  taints:
  - effect: PreferNoSchedule
    key: node-role.kubernetes.io/master
---
apiServer:
  timeoutForControlPlane: 4m0s
apiVersion: kubeadm.k8s.io/v1beta3
certificatesDir: /etc/kubernetes/pki
clusterName: kubernetes
controllerManager: {}
dns: {}
etcd:
  local:
    dataDir: /var/lib/etcd
imageRepository: registry.aliyuncs.com/google_containers
kind: ClusterConfiguration
kubernetesVersion: 1.23.0
networking:
  dnsDomain: cluster.local
  serviceSubnet: 10.96.0.0/12
  podSubnet: 10.244.0.0/16
scheduler: {}
---
apiVersion: kubelet.config.k8s.io/v1beta1
authentication:
  anonymous:
    enabled: false
  webhook:
    cacheTTL: 0s
    enabled: true
  x509:
    clientCAFile: /etc/kubernetes/pki/ca.crt
authorization:
  mode: Webhook
  webhook:
    cacheAuthorizedTTL: 0s
    cacheUnauthorizedTTL: 0s
cgroupDriver: systemd
clusterDNS:
- 10.96.0.10
clusterDomain: cluster.local
cpuManagerReconcilePeriod: 0s
evictionPressureTransitionPeriod: 0s
fileCheckFrequency: 0s
healthzBindAddress: 127.0.0.1
healthzPort: 10248
httpCheckFrequency: 0s
imageMinimumGCAge: 0s
kind: KubeletConfiguration
logging:
  flushFrequency: 0
  options:
    json:
      infoBufferSize: "0"
  verbosity: 0
memorySwap: {}
nodeStatusReportFrequency: 0s
nodeStatusUpdateFrequency: 0s
rotateCertificates: true
runtimeRequestTimeout: 0s
shutdownGracePeriod: 0s
shutdownGracePeriodCriticalPods: 0s
staticPodPath: /etc/kubernetes/manifests
streamingConnectionIdleTimeout: 0s
syncFrequency: 0s
volumeStatsAggPeriod: 0s
---
apiVersion: kubeproxy.config.k8s.io/v1alpha1
kind: KubeProxyConfiguration
mode: ipvs
```

在开始初始化集群之前可以使用 `kubeadm config images pull --config kubeadm.yaml` 预先在各个服务器节点上拉取 k8s 需要的容器镜像

```shell
[root@node1 ~]# kubeadm config images pull --config kubeadm.yaml
[config/images] Pulled registry.aliyuncs.com/google_containers/kube-apiserver:v1.23.1
[config/images] Pulled registry.aliyuncs.com/google_containers/kube-controller-manager:v1.23.1
[config/images] Pulled registry.aliyuncs.com/google_containers/kube-scheduler:v1.23.1
[config/images] Pulled registry.aliyuncs.com/google_containers/kube-proxy:v1.23.1
[config/images] Pulled registry.aliyuncs.com/google_containers/pause:3.6
[config/images] Pulled registry.aliyuncs.com/google_containers/etcd:3.5.1-0
[config/images] Pulled registry.aliyuncs.com/google_containers/coredns:v1.8.6
```

接下来使用 kubeadm 初始化集群，选择 node1 作为 Master Node，在 node1 上执行下面的命令

```shell
[root@node1 ~]# kubeadm init --config kubeadm.yaml
[init] Using Kubernetes version: v1.23.0
[preflight] Running pre-flight checks
[preflight] Pulling images required for setting up a Kubernetes cluster
[preflight] This might take a minute or two, depending on the speed of your internet connection
[preflight] You can also perform this action in beforehand using 'kubeadm config images pull'
[certs] Using certificateDir folder "/etc/kubernetes/pki"
[certs] Generating "ca" certificate and key
[certs] Generating "apiserver" certificate and key
[certs] apiserver serving cert is signed for DNS names [kubernetes kubernetes.default kubernetes.default.svc kubernetes.default.svc.cluster.local node1] and IPs [10.96.0.1 10.192.104.101]
[certs] Generating "apiserver-kubelet-client" certificate and key
[certs] Generating "front-proxy-ca" certificate and key
[certs] Generating "front-proxy-client" certificate and key
[certs] Generating "etcd/ca" certificate and key
[certs] Generating "etcd/server" certificate and key
[certs] etcd/server serving cert is signed for DNS names [localhost node1] and IPs [10.192.104.101 127.0.0.1 ::1]
[certs] Generating "etcd/peer" certificate and key
[certs] etcd/peer serving cert is signed for DNS names [localhost node1] and IPs [10.192.104.101 127.0.0.1 ::1]
[certs] Generating "etcd/healthcheck-client" certificate and key
[certs] Generating "apiserver-etcd-client" certificate and key
[certs] Generating "sa" key and public key
[kubeconfig] Using kubeconfig folder "/etc/kubernetes"
[kubeconfig] Writing "admin.conf" kubeconfig file
[kubeconfig] Writing "kubelet.conf" kubeconfig file
[kubeconfig] Writing "controller-manager.conf" kubeconfig file
[kubeconfig] Writing "scheduler.conf" kubeconfig file
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Starting the kubelet
[control-plane] Using manifest folder "/etc/kubernetes/manifests"
[control-plane] Creating static Pod manifest for "kube-apiserver"
[control-plane] Creating static Pod manifest for "kube-controller-manager"
[control-plane] Creating static Pod manifest for "kube-scheduler"
[etcd] Creating static Pod manifest for local etcd in "/etc/kubernetes/manifests"
[wait-control-plane] Waiting for the kubelet to boot up the control plane as static Pods from directory "/etc/kubernetes/manifests". This can take up to 4m0s
[apiclient] All control plane components are healthy after 12.506459 seconds
[upload-config] Storing the configuration used in ConfigMap "kubeadm-config" in the "kube-system" Namespace
[kubelet] Creating a ConfigMap "kubelet-config-1.23" in namespace kube-system with the configuration for the kubelets in the cluster
NOTE: The "kubelet-config-1.23" naming of the kubelet ConfigMap is deprecated. Once the UnversionedKubeletConfigMap feature gate graduates to Beta the default name will become just "kubelet-config". Kubeadm upgrade will handle this transition transparently.
[upload-certs] Skipping phase. Please see --upload-certs
[mark-control-plane] Marking the node node1 as control-plane by adding the labels: [node-role.kubernetes.io/master(deprecated) node-role.kubernetes.io/control-plane node.kubernetes.io/exclude-from-external-load-balancers]
[mark-control-plane] Marking the node node1 as control-plane by adding the taints [node-role.kubernetes.io/master:PreferNoSchedule]
[bootstrap-token] Using token: abcdef.0123456789abcdef
[bootstrap-token] Configuring bootstrap tokens, cluster-info ConfigMap, RBAC Roles
[bootstrap-token] configured RBAC rules to allow Node Bootstrap tokens to get nodes
[bootstrap-token] configured RBAC rules to allow Node Bootstrap tokens to post CSRs in order for nodes to get long term certificate credentials
[bootstrap-token] configured RBAC rules to allow the csrapprover controller automatically approve CSRs from a Node Bootstrap Token
[bootstrap-token] configured RBAC rules to allow certificate rotation for all node client certificates in the cluster
[bootstrap-token] Creating the "cluster-info" ConfigMap in the "kube-public" namespace
[kubelet-finalize] Updating "/etc/kubernetes/kubelet.conf" to point to a rotatable kubelet client certificate and key
[addons] Applied essential addon: CoreDNS
[addons] Applied essential addon: kube-proxy

Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

Alternatively, if you are the root user, you can run:

  export KUBECONFIG=/etc/kubernetes/admin.conf

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join 10.192.104.101:6443 --token abcdef.0123456789abcdef \
	--discovery-token-ca-cert-hash sha256:99cb615c1ae266ba41b9255202cee44109f4a3f12b31125964d8932df6120249
```

上面记录了完成的初始化输出的内容，根据输出的内容基本上可以看出手动初始化安装一个 Kubernetes 集群所需要的关键步骤。其中有以下关键内容

+ [certs] 生成相关的各种证书
+ [kubeconfig] 生成相关的 kubeconfig 文件
+ [kubelet-start] 生成 kubelet 的配置文件 `/var/lib/kubelet/config.yaml`
+ [control-plane] 使用 `/etc/kubernetes/manifests` 目录中的 yaml 文件创建 apiserver、controller-manager、scheduler 的静态 pod
+ [bootstraptoken] 生成 token 记录下来，后边使用 `kubeadm join` 往集群中添加节点时会用到
下面的命令是配置常规用户如何使用 kubectl 访问集群

**如果初始化失败，使用以下命令进行重置**

```shell
kubeadm reset
```

配置常规用户如何使用kubectl访问集群

```shell
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

查看集群状态，确认组件都处于 healthy 状态

```shell
[root@node1 ~]# kubectl get cs
Warning: v1 ComponentStatus is deprecated in v1.19+
NAME                 STATUS    MESSAGE                         ERROR
scheduler            Healthy   ok
controller-manager   Healthy   ok
etcd-0               Healthy   {"health":"true","reason":""}
```

查看 kube-proxy 是否启用 ipvs

```shell
[root@node1 ~]# kubectl get pods -n kube-system | grep kube-proxy
kube-proxy-4c8bc                1/1     Running   0          4h47m
kube-proxy-9k48h                1/1     Running   0          4h47m
kube-proxy-rcjkh                1/1     Running   0          4h56m
[root@node1 ~]# kubectl logs kube-proxy-4c8bc -n kube-system
I0119 07:07:09.310730       1 node.go:163] Successfully retrieved node IP: 10.192.104.103
I0119 07:07:09.310862       1 server_others.go:138] "Detected node IP" address="10.192.104.103"
I0119 07:07:09.341749       1 server_others.go:269] "Using ipvs Proxier"
I0119 07:07:09.341801       1 server_others.go:271] "Creating dualStackProxier for ipvs"
I0119 07:07:09.341856       1 server_others.go:491] "Detect-local-mode set to ClusterCIDR, but no IPv6 cluster CIDR defined, , defaulting to no-op detect-local for IPv6"
E0119 07:07:09.342069       1 proxier.go:379] "Can't set sysctl, kernel version doesn't satisfy minimum version requirements" sysctl="net/ipv4/vs/conn_reuse_mode" minimumKernelVersion="4.1"
I0119 07:07:09.342176       1 proxier.go:438] "IPVS scheduler not specified, use rr by default"
E0119 07:07:09.342349       1 proxier.go:379] "Can't set sysctl, kernel version doesn't satisfy minimum version requirements" sysctl="net/ipv4/vs/conn_reuse_mode" minimumKernelVersion="4.1"
```

### 安装网络插件

这里选用 flannel

```shell
curl -O https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
kubectl apply -f kube-flannel.yml
```

查看 flannel pod 的状态

```shell
[root@node1 ~]# kubectl get pods -n kube-system -o wide | grep flannel
kube-flannel-ds-frdm4           1/1     Running   0          4h29m   10.192.104.103   node3   <none>           <none>
kube-flannel-ds-ghhnw           1/1     Running   0          4h37m   10.192.104.101   node1   <none>           <none>
kube-flannel-ds-hnknh           1/1     Running   0          4h28m   10.192.104.102   node2   <none>           <none>
```

### 添加节点

在 node2, node3 上执行

```shell
kubeadm join 10.192.104.101:6443 --token abcdef.0123456789abcdef \
	--discovery-token-ca-cert-hash sha256:99cb615c1ae266ba41b9255202cee44109f4a3f12b31125964d8932df6120249
```

master 节点查看集群中的节点

```shell
[root@node1 ~]# kubectl get nodes
NAME    STATUS   ROLES                  AGE     VERSION
node1   Ready    control-plane,master   4h41m   v1.23.1
node2   Ready    <none>                 4h32m   v1.23.1
node3   Ready    <none>                 4h32m   v1.23.1
```

## 参考

+ <https://blog.frognew.com/2021/12/kubeadm-install-kubernetes-1.23.html>

## 安装Dashboard

```shell
wget https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
```

修改service type 为 NodePort

```yaml
kind: Service
apiVersion: v1
metadata:
  labels:
    k8s-app: kubernetes-dashboard
  name: kubernetes-dashboard
  namespace: kubernetes-dashboard
spec:
  ports:
    - port: 443
      targetPort: 8443
  type: NodePort
  selector:
    k8s-app: kubernetes-dashboard
```

```shell
kubectl apply -f recommended.yaml
```

创建 Service Account

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
```

创建 ClusterRoleBinding

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
```

获取登录 token

```shell
kubectl -n kubernetes-dashboard create token admin-user
```
