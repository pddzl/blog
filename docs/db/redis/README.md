---
title: Redis
---

## 分布式锁

### 原理

`Redis` 的 SET 命令有个 NX 参数可以实现「key不存在才插入」，所以可以用它来实现分布式锁

```shell
set lock:key unique_value NX PX 10000
```

+ lock:key 就是 key 键

+ unique_value 是客户端生成的唯一的标识，区分来自不同客户端的锁操作

+ NX 代表只在 lock_key 不存在时，才对 lock_key 进行设置操作

+ PX 10000 表示设置 lock_key 的过期时间为 10s

### 具体实现

下面将基于 go 语言，使用一个常用的 go redis 客户端 (https://github.com/go-redis/redis), 一步一步探索与实现一个简单的 `Redis` 分布式锁

1. 基于 SetNX 的锁初步实现

使用 `redis` 的 SetNX 命令实现分布式锁

+ 如果 key 不存在，则显示插入成功，可以用来表示加锁成功。

+ 如果 key 存在，则会显示插入失败，可以用来表示加锁失败。

```go
// 初始化 redis 客户端
import (
  "github.com/go-redis/redis"
)

func Redis() *redis.Client {
  client := redis.NewClient(config())
  if _, err := client.Ping().Result(); err != nil {
    fmt.Println("redis connect", err)
  }
  return client
}
```

```go
// 加锁
// 等同于 set lock:key unique_value NX PX 10000
resp = client.SetNX("pdd:lock", 1, time.Second*10)

if err == nil && lockSuccess {
  fmt.Println("lock success!")
  return
}

// 解锁
unlockSuccess, err := client.Del(lockKey).Result()

if err == nil && unlockSuccess > 0 {
  fmt.Println("unlock success!")
} else {
  fmt.Println("unlock failed!", err)
}
```

2. 锁的防误删实现

这样就使用 `Redis` 实现了一个简单的分布式锁，但是仍然存在一个问题：如果键过期了，其持有者仍未完成任务，那么锁可能会被其他竞争者抢走，待原持有者完成任务进行解锁操作时，解除的将是当前其他持有者的锁，即发生误删。

为了解决这种问题，持有者可以给锁添加一个唯一标识，使之只能删除自己的锁。因此需要完善一下加解锁操作

```go
// 加锁
uuidS, _ := uuid.NewUUID()
taskId := uuidS.String()

resp = client.SetNX("pdd:lock", taskId, time.Second*10)

if err == nil && lockSuccess {
  fmt.Println("lock success!")
  return
}

// 解锁：锁值对比，结果一致则进行解锁操作
value, err := client.Get(lockKey).Result()
if err != nil || value == "" {
  fmt.Println("lock not exist")
  return
} else if value != taskId {
  fmt.Println("lock value different")
  return
} else {
  // 解锁
}
```

3. 解锁的原子化实现

上述解锁操作中，仍存在一个问题：在确认当前锁是自己的锁之后，删除锁之前，这段时间内，锁可能会恰巧过期释放且被其他竞争者抢占，那么继续删除则删除的是别人的锁，又会出现误删问题。

因此需要将整个解锁过程原子化，使得在解锁期间，其他竞争者的任何操作不能被 `Redis` 执行。

这里一般采用了 Lua 脚本，封装了判断标识与删除键的整个操作，通过 KEYS 与 ARGV 数组将键与值传入

```go
// lua 脚本
func redisScript() *redis.Script {
  return redis.NewScript(`
    if redis.call('get', KEYS[1]) == ARGV[1]
    then
      return redis.call('del', KEYS[1])
    else
      return 0
    end
  `)
}

resp, err := redisScript().Run(client, []string{taskId}, p.TaskId).Result()

if err != nil {
  fmt.Println("解锁失败")
  return err
}

reply, _ := resp.(int64)
if reply == 0 {
  fmt.Errorf("解锁失败")
  return
}
```

**参考**

<https://www.modb.pro/db/77169>

<https://www.zhihu.com/question/486526676/answer/2591864677>

## 发布订阅
