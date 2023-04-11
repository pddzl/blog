---
outline: deep
---

# 接口

## 概述

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

## 动态派发
