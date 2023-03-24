---
outline: deep
---

# 引用类型

引用类型：变量存储的是一个地址、这个地址对应的空间存储数据（值），内存通常在堆上分配，当没有任何变量引用这个地址时，该地址对应的数据空间就成了一个垃圾，由GC来回收

## 切片

切片 `slice` 代表变长的序列，序列中每个元素都有相同的类型。一个 `slice` 类型一般写作 []T，其中 T 代表切片中元素的类型。

### 初始化

```go
// 1. 通过下标的方式获得数组或者切片的一部分
arr[0:3] or slice[0:3]

// 2. 使用字面量初始化新的切片
slice := []int{1, 2, 3}

// 3. 使用关键字 make 创建切片。make([]T, len, cap) 元素类型、长度和容量，容量部分可以省略，在这种情况下，容量将等于长度，未省略cap >= len
slice := make([]int, 10)
```

### 数据结构

```go
type SliceHeader struct {
  Data uintptr
  Len  int
  Cap  int
}
```

+ `Data` 是指向数组的指针

+ `Len` 是当前切片的长度

+ `Cap` 是当前切片的容量，即 `Data` 数组的大小

### 切片的内存布局

<img src="./images/slice.png" alt="slice" style="zoom:50%;" />

### 扩容

append内置函数可以对切片进行动态追加

```go
a := make([]int)
append(a, 5)
```

1. 如果期望容量大于当前容量的两倍就会使用期望容量

2. 如果当前切片的长度小于 1024 就会将容量翻倍

3. 如果当前切片的长度大于 1024 就会每次增加 25% 的容量，直到新容量大于期望容量

```go
package main

import "fmt"

func main() {
  var intArr [5]int = [...]int{1, 2, 3, 4, 5}
  slice := intArr[0:2]
  fmt.Printf("数组地址=%p\n", &intArr)
  fmt.Printf("slice=%v len=%d cap=%d\n", slice, len(slice), cap(slice))
  fmt.Printf("数组地址=%p 切片地址=%p\n", slice, &slice)
  slice = append(slice, 6, 7)
  fmt.Printf("slice=%v len=%d cap=%d\n", slice, len(slice), cap(slice))
  fmt.Printf("数组地址=%p 切片地址=%p\n", slice, &slice)
  slice = append(slice, 8, 9)
  fmt.Printf("slice=%v len=%d cap=%d\n", slice, len(slice), cap(slice))
  fmt.Printf("数组地址=%p 切片地址=%p\n", slice, &slice)
}

$ go run main.go
数组地址=0xc000098030
slice=[1 2] len=2 cap=5
数组地址=0xc000098030 切片地址=0xc0000a2000
slice=[1 2 6 7] len=4 cap=5
数组地址=0xc000098030 切片地址=0xc0000a2000
slice=[1 2 6 7 8 9] len=6 cap=10
数组地址=0xc0000ac000 切片地址=0xc0000a2000
```

### 切片拷贝

切片使用内置函数 `copy` 进行拷贝，copy(dst_para, src_para): dst_para 和 src_para 都是切片类型

```go
package main

import "fmt"

func main() {
  var slice1 []int = []int{1, 2, 3, 4, 5}
  var slice2 = make([]int, 10)
  var slice3 = make([]int, 1)
  copy(slice2, slice1)
  copy(slice3, slice1)
  fmt.Printf("slice1=%v\nslice2=%v\nslice3=%v\n", slice1, slice2, slice3)
}
```

```shell
slice1=[1 2 3 4 5]
slice2=[1 2 3 4 5 0 0 0 0 0]
slice3=[1]
```

## map

在 Go 语言中，一个 `map` 就是一个哈希表的引用，`map` 类型可以写为 `map[K]V`，其中 K 和 V 分别对应 key 和 value。

`slice`、`map`、`function` 不可以作为 key，因为这几个没法用 == 来判断

### 初始化

```go
// 字面量
ages := map[string]int{
  "alice":   31,
  "charlie": 34,
}

// make
ages := make(map[string]int, 2)
ages["alice"] = 31
ages["charlie"] = 34
```

### map增删查该

增加，更新

```go
map["key"] = value // key不存在则增加，存在则修改
```

删除

```go
delete(map, "key") // key存在则删除，key不存在也不会报错
```

查找

```go
val, ok := a["no1"] // 存在返回true, 否则false
if ok {
  fmt.Printf("key no1存在%v\n", val)
} else {
  fmt.Printf("key no1不存在\n")
}
```

### 扩容

map扩容不是个原子操作，触发扩容的因素

1. 装载因子已经超过 6.5

2. 哈希使用了太多溢出桶

## Channel

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

## 指针

Go支持指针，但不支持指针运算，指针默认值为nil

```go
package main

import "fmt"

func main() {
  //var a *int or a := new(int)
  b := 4
  a := new(int)
  a = &b
  fmt.Printf("%v, %d\n", a, *a)
}
```

Example: 数组指针和指针数组

```go
package main

import "fmt"

func main() {
  x, y := 1, 2
  var arr = [...]int{5: 2}
  //数组指针
  var pf *[6]int = &arr

  //指针数组
  pfArr := [...]*int{&x, &y}
  fmt.Println(*pf)
  fmt.Println(*pfArr[0], *pfArr[1])
}
```

```shell
[0 0 0 0 0 2]
1 2
```

### 隐式解引用

对于一些复杂类型的指针， 如果要访问成员变量的话，需要写成类似`(*p).field`的形式，Go提供了隐式解引用特性，我们只需要`p.field`即可访问相应的成员

```go
p1 := &Person{name: "易天", age: 24}
fmt.Println((*p1).name)
fmt.Println(p1.name)
```

## 接口

Go 语言中的接口是一组方法的签名

### 隐式接口

在接口中我们只能定义方法签名，不能包含成员变量

```go
type error interface {
	Error() string
}
```

如果一个类型需要实现 error 接口，那么它只需要实现 Error() string 方法，下面的 RPCError 结构体就是 error 接口的一个实现

```go
type RPCError struct {
  Code    int64
  Message string
}

func (e *RPCError) Error() string {
	return fmt.Sprintf("%s, code=%d", e.Message, e.Code)
}
```

**Go 语言中接口的实现都是隐式的，实现接口的所有方法就隐式地实现了接口**

### 类型

1. 带有一组方法的接口

2. 不带任何方法的接口

## 函数

函数也是一种引用类型，具体详见函数章节
