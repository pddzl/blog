---
outline: deep
---

# Channel

`Channel`是一种先入先出（FIFO）通信机制，可以用它在goroutine之间传递消息

和map类似，channel也对应一个由make创建的底层数据结构的引用，默认值为nil

```go
ch := make(chan int)
```

`Channel`支持三种通信模式，全双工、只读，只写

```go
chan T          // 可以接收和发送类型为T的数据
chan<- float64  // 只可以用来发送float64类型的数据
<-chan int      // 只可以用来接收int类型的数据
```

### 关闭Channel

可以用内置close函数关闭channel，随后对该channel写数据将导致panic异常，但仍可以正常从该channel读取数据，如果channel已经没有数据的话将产生一个零值的数据。

```go
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

检查channel是否已经被关闭

```go
v, ok := <-ch
```

### 不带缓存的Channel

```go
ch := make(chan int)
```

一个基于无缓存channel的发送操作将导致发送者goroutine阻塞，直到另一个goroutine在相同的channel上执行接收操作，当发送的值通过channel成功传输之后，两个goroutine可以继续执行后面的语句。反之，如果接收操作先发生，那么接收者goroutine也将阻塞，直到有另一个goroutine在相同的channel上执行发送操作

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

### 带缓存的Channel

带缓存的channel内部持有一个元素队列。队列的最大容量是在调用make函数创建channel时通过第二个参数指定的。下面的语句创建了一个可以持有三个字符串元素的带缓存channel

```go
ch := make(chan int, 3)
```

当缓存满的时候写阻塞，当缓存空的时候读阻塞

### Channel遍历

`for ... range`语句可以遍历channel

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

`range c`产生的迭代值为channel中发送的值，它会一直迭代直到channel被关闭。上面的例子中如果把`close(c)`注释掉，程序会一直阻塞在`for ... range`那一行
