---
outline: deep
---

# 接口

## 概述

Go 语言中的接口是一组方法的签名

```go
type mi interface {
  keep()
}

type pdd struct{}

func (p *pdd) keep() {
  fmt.Println("keep running")
}

func main() {
  var pdd1 mi = &pdd{}
  pdd1.keep()
}
```

### 空接口

数据结构

```go
type eface struct { // 16 字节
  _type *_type // 动态类型
  data  unsafe.Pointer // 动态值
}
```

示例

```go
var e interface{}
f, _ := os.Open("test.txt")
e = f
```

<img src="./images/eface.png" alt="eface" style="zoom:50%;" />

### 非空接口

数据结构

```go
type iface struct { // 16 字节
  tab  *itab
  data unsafe.Pointer
}

type itab struct {
  inter *interfacetype
  _type *_type  // 动态类型
  hash  uint32 // 类型哈希值
  _     [4]byte
  fun   [1]uintptr // 方法地址数组
}

type interfacetype struct {
  typ     _type
  pkgpath name
  mhdr    []imethod // 方法列表
}
```

示例

```go
var rw io.ReadWriter
f, _ := os.Open("test.txt")
rw = f
```

<img src="./images/iface.png" alt="iface" style="zoom:50%;" />

## 类型断言

接口类型转换成具体类型 `x.(T)`

1. 空接口.(具体类型)

```go
var a interface{}
a = 5
value, ok := a.(int)
```

对比 _type 是否为 int 类型，如果是则 ok 为 true

2. 非空接口.(具体类型)

```go
type mi interface {
  keep()
}

type pdd struct {
  name string
}

func (p *pdd) keep() {
  fmt.Println("keep running")
}

func main() {
  var pdd1 mi = &pdd{name: "pddzl"}
  p, ok := pdd1.(*pdd)
  if ok {
    fmt.Println("value =", p)
  }
}
```

3. 空接口.(非空接口)

```go
var e interface{}
rw, ok := e.(io.ReadWriter)
```

判断 e 是否实现了 io.ReadWriter 接口，如果是则 ok 为 true

```go
var e interface{}
f, _ := os.Open("test.txt") // func Open(name string) (*File, error)
e = f // f 为 *os.File 指针结构体
rw, ok := e.(io.ReadWriter)
```

判断 *os.File 是否实现了 io.ReadWriter 接口，如果是则 ok 为 true

4. 非空接口.(非空接口)

```go
var w io.Writer
f, _ := os.Open("test.txt")
w = f
rw, ok := w.(io.ReadWriter)
```

先判断 *os.File 是否实现了 io.Writer 接口，再判断是否实现了 io.ReadWriter 接口

## 动态派发
