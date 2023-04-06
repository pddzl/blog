---
outline: deep
---

# Context

## 介绍

上下文 `context.Context` 在 Go 语言中用来设置截止日期、同步信号，传递请求相关值的结构体。上下文与 `Goroutine` 有比较密切的关系，主要用于超时控制和多Goroutine间的数据传递

## Demo演示

```go
package main

import (
  "context"
  "fmt"
  "time"
)

func main() {
  ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
  defer cancel()
  fmt.Printf("i am ctx, address: %p\n", ctx)

  go handle(ctx)
  go end(ctx)

  select {
  case <-ctx.Done():
    fmt.Println("main", ctx.Err())
  }
}

func handle(ctx context.Context) {
  ctx1, cancel := context.WithCancel(ctx) // 与ctx建立父子关系
  fmt.Printf("i am ctx1, address: %p\n", ctx1)
  cancel()

  select {
  case <-ctx1.Done():
    fmt.Println("ctx1 down")
  }
}

func end(ctx context.Context) {
  fmt.Printf("i am ctx2, address: %p\n", ctx)
  select {
  case <-ctx.Done(): // 与ctx共享一个channel
    fmt.Println("ctx2 down")
  }
}
```

```shell
i am ctx, address: 0x1400006c120
i am ctx2, address: 0x1400006c120
i am ctx1, address: 0x1400001e080
ctx1 down
// 等待2秒
ctx2 down
main context deadline exceeded
```

## 源码分析

退出的原理: 监听 ctx 里面的 channel（关闭 channel 后，可以从 channel 里面读取到对应类型的零值）

context.WithCancel(parent Context): 从 parent Context 创建一个带有取消方法的 child Context，该 Context 可以手动调用 cancel

cancel() 关闭当前 ctx 的 channel 以及 children 节点的 channel
