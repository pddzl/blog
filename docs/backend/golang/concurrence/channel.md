---
outline: deep
---

# Channel

## 简介

`Channel` 是一种先入先出（FIFO）通信机制，可以用它在 `goroutine` 之间传递消息

我们常见的编程语言中，线程之间传递数据一般都是共享内存，为了解决线程竞争，我们需要限制同一时间能够读写这些数据的线程

在 `Go` 语言中也能使用共享内存加互斥锁进行通信，但 `Go` 语言提供了一种不同的并发模式，即通信顺序进程（Communicating sequential processes，CSP）。

`Goroutine` 和 `Channel` 分别对应 `CSP` 中的实体和传递信息的媒介，`Goroutine` 之间会通过 `Channel` 传递数据。

这就是我们常说的不要通过共享内存的方式进行通信，而是应该通过通信的方式共享内存

### 初始化

和 `map` 类似，`channel` 也对应一个由 `make` 创建的底层数据结构的引用，默认值为 `nil`

```go
ch := make(chan int) // 不带缓冲
ch := make(chan int, 3) // 带缓冲
```

`channel` 支持三种通信模式，全双工、只读，只写

```go
chan T          // 可以接收和发送类型为T的数据
chan<- float64  // 只可以用来发送 float64 类型的数据（只写）
<-chan int      // 只可以用来接收int类型的数据（只读）
```

`range c` 产生的迭代值为 `channel` 中发送的值，它会一直迭代直到 `channel` 被关闭。
### 关闭管道

可以用内置 `close` 函数关闭 `channel`，随后对该 `channel` 写数据将导致 `panic` 异常，但仍可以正常从该 `channel` 读取数据，如果 `channel` 已经没有数据的话将产生一个零值的数据。

```go
package main

import "fmt"

func main() {
  ch := make(chan int, 1)
  ch <- 1
  close(ch)
  //ch <- 2 // panic
  a1 := <-ch
  a2 := <-ch
  fmt.Printf("a1=%d a2=%d\n", a1, a2)
}
```

```shell
a1=1 a2=0
```

检查 `channel` 是否已经被关闭

```go
v, ok := <-ch
```

### 遍历管道

`for ... range` 语句可以遍历 channel

```go
package main

import (
  "fmt"
  "time"
)

func main() {
  c := make(chan int)
  go func() {
    for i := 0; i < 10; i = i + 1 {
      c <- i
      time.Sleep(1 * time.Second)
    }
    close(c)
  }()
  for i := range c {
    fmt.Println(i)
  }
  fmt.Println("Finished")
}
```

## 数据结构

```go
type hchan struct {
  qcount   uint           // total data in the queue
  dataqsiz uint           // size of the circular queue
  buf      unsafe.Pointer // points to an array of dataqsiz elements
  elemsize uint16
  closed   uint32
  elemtype *_type // element type
  sendx    uint   // send index
  recvx    uint   // receive index
  recvq    waitq  // list of recv waiters
  sendq    waitq  // list of send waiters

  // lock protects all fields in hchan, as well as several
  // fields in sudogs blocked on this channel.
  //
  // Do not change another G's status while holding this lock
  // (in particular, do not ready a G), as this can deadlock
  // with stack shrinking.
  lock mutex
}
```

sendq 和 recvq 存储了当前 Channel 由于缓冲区空间不足而阻塞的 Goroutine 列表，这些等待队列使用双向链表 runtime.waitq 表示，链表中所有的元素都是 runtime.sudog 结构

```go
type waitq struct {
  first *sudog
  last  *sudog
}
```

runtime.sudog 表示一个在等待列表中的 Goroutine，该结构中存储了两个分别指向前后 runtime.sudog 的指针以构成链表

## 不带缓冲的管道

```go
ch := make(chan int)
```

一个基于无缓冲 `channel` 的发送操作将导致发送者 `goroutine` 阻塞，直到另一个 `goroutine` 在相同的 `channel` 上执行接收操作，当发送的值通过 `channel` 成功传输之后，两个 `goroutine` 可以继续执行后面的语句。反之，如果接收操作先发生，那么接收者 `goroutine` 也将阻塞，直到有另一个 `goroutine` 在相同的 `channel` 上执行发送操作

```go
package main

import (
  "fmt"
  "time"
)

func worker(done chan bool) {
  time.Sleep(time.Second * 2)
  // 通知任务已完成
  done <- true
}

func main() {
  start := time.Now()

  done := make(chan bool, 1)
  go worker(done)
  // 阻塞直到接收到数据
  <-done

  end := time.Since(start)
  fmt.Println("task Done!")
  fmt.Println("cost time=", end)
}
```

```shell
task Done!
cost time= 2.001512833s
```

## 带缓冲的管道

带缓冲的 `channel` 内部持有一个元素队列。队列的最大容量是在调用 make 函数创建 `channel` 时通过第二个参数指定的。下面的语句创建了一个可以持有三个字符串元素的带缓冲 `channel`

```go
ch := make(chan int, 3)
```

当缓存满的时候写阻塞，当缓存空的时候读阻塞
