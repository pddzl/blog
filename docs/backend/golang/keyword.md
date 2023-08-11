---
outline: deep
---

# 关键字

## defer

1. go执行到一个defer时，不会立即执行defer后的语句，而是将defer后的语句压入到一个栈中，然后继续执行函数下面的语句。**defer将语句放入栈时，也会将相关的值拷贝入栈**

2. 函数执行完毕后，再从defer栈中依次取出语句执行（遵循栈先入后出的规则 FILO）

```go
package main

import "fmt"

func sum(n1 int, n2 int) int {
  defer fmt.Println("n1 =", n1)
  defer fmt.Println("n2 =", n2)
  n1++
  n2++
  res := n1 + n2
  fmt.Println("res =", res)
  return res
}

func main()  {
  res := sum(10,20)
  fmt.Println("main res =", res)
}

$ go run main.go
res = 32
n2 = 20
n1 = 10
main res = 32
```

3. defer、return、返回值三者的执行逻辑：return最先执行，return负责将结果写入返回值中；接着defer开始执行一些收尾工作；最后函数携带当前返回值退出。如果函数的返回值是无名的（不带命名返回值），则go语言会在执行return的时候会执行一个类似创建一个临时变量作为保存return值的动作，而有名返回值的函数，由于返回值在函数定义的时候已经将该变量进行定义，在执行return的时候会先执行返回值保存操作，而后续的defer函数会改变这个返回值(虽然defer是在return之后执行的，但是由于使用的函数定义的变量，所以执行defer操作后对该变量的修改会影响到return的值。

```go
package main

import (
    "fmt"
)

func test() int {
    a := 1
    defer func() {
        a = 4
    }()
    return a
}

func main() {
    a := test()
    fmt.Println("a", a)
}

a 1
```

```go
package main

import (
    "fmt"
)

func test() (a int) {
    a = 1
    defer func() {
        a = 4
    }()
    return
}

func main() {
    a := test()
    fmt.Println("a", a)
}

a 4
```

4. defer最主要的价值是在当函数执行完毕后，可以及时释放函数创建的资源

```go
func test() {
  connect = openDatabase()
  defer connect.close()
    // 其它代码
}
```

## panic 和 recover

`panic` 能够改变程序的控制流，调用 `panic` 后会立刻停止执行当前函数的剩余代码，并在当前 Goroutine 中递归执行调用方的 `defer`

`recover` 可以中止 `panic` 造成的程序崩溃。它是一个只能在 `defer` 中发挥作用的函数，在其他作用域中调用不会发挥作用

```go
func main() {
  defer fmt.Println("in main")

  defer func(){
    if err := recover(); err != nil {
      fmt.Println(err)
    }
  }()

  panic("unknown err")

  fmt.Println("end") // 这里代码不会执行了
}

$ go run main.go
unknown err
in main
```

`panic` 只会触发当前 Goroutine 的 `defer`

```go
func main() {
  defer fmt.Println("in main")

  defer func(){
    if err := recover(); err != nil {
      fmt.Println(err)
    }
  }()

  go func() {
    defer fmt.Println("in goroutine")
    panic("")
  }()

  time.Sleep(1 * time.Second)
}
```

```shell
in goroutine
panic:

goroutine 18 [running]:
main.main.func2()
	/Users/paul/1.go:19 +0x68
created by main.main
	/Users/paul/1.go:17 +0x80
exit status 2
```

`recover` 只有在 `defer` 中调用才会生效

```go
func main() {
  defer fmt.Println("in main")
  if err := recover(); err != nil {
    fmt.Println(err)
  }

  panic("unknown err")
}

$ go run main.go
in main
panic: unknown err

goroutine 1 [running]:
main.main()
  ...
exit status 2
```

`panic` 允许在 `defer` 中嵌套多次调用

```go
func main() {
  defer fmt.Println("in main")
  defer func() {
    defer func() {
      panic("panic again and again")
    }()
    panic("panic again")
  }()

  panic("panic once")
}

$ go run main.go
in main
panic: panic once
  panic: panic again
  panic: panic again and again

goroutine 1 [running]:
...
exit status 2
```

## make 和 new

`make` 的作用是初始化内置的数据结构，也就是我们在前面提到的切片、哈希表和 Channel

```go
slice := make([]int, 0, 100)
hash := make(map[int]bool, 10)
ch := make(chan int, 5)
```

`new` 的作用是根据传入的类型分配一片内存空间并返回指向这片内存空间的指针

```go
i := new(int)

var v int
i := &v
```
