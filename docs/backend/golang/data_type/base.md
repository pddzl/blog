---
outline: deep
---

# 基础类型

## 整型

### 有符号整型

```go
int8    1字节 -2^7 ~ 2^7-1
int16   2字节 -2^15 ~ 2^15-1
int32   4字节 -2^31 ~ 2^31-1
int64   8字节 -2^63 ~ 2^63-1
int     32位系统为int32 64位系统为int64
```

### 无符号整型

```go
uint8   1字节 0 ~ 2^8-1
uint16  2字节 0 ~ 2^16-1
uint32  4字节 0 ~ 2^32-1
uint64  8字节 0 ~ 2^64-1
```

## 浮点数

浮点数都是有符号的，`go` 的浮点型默认为 `float64`

```go
float32 4字节
float64 8字节
```

## 字符

`Go` 语言有两种字符类型

+ byte（uint8 的别名），代表 `ASCII` 码的一个字符，一个 `ASCII` 字符占一个字节

```go
type byte = uint8
```

+ rune（int32 的别名），代表一个 `Unicode` 码，当需要处理中文的时候需要用到 `rune` 类型，一个中文占用3个字节

```go
type rune = int32
```

Example:

```go
package main

import (
  "fmt"
)

func main() {
  var c1 = 'a'
  var c2 = '0' // 字符0
  // 当我们直接输出byte值，就是直接输出对应字符的码值
  fmt.Println("c1=", c1, "c2=", c2)
  // 输出对应字符，需要使用格式化输出
  fmt.Printf("c1=%c c2=%c\n", c1, c2)
  // 数字转换成字符
  var c3 int = 22269
  fmt.Printf("c3=%c\n", c3)
  // 字符串可以进行运行，运算时按照码值
  var n1 = 10 + 'a' // 10 + 97 = 107
  fmt.Println("n1=", n1)
  c4 := []rune("中国")
  fmt.Printf("c4=%c, len=%d\n", c4, len(c4))
}
```

```shell
c1= 97 c2= 48
c1=a c2=0
c3=国
n1= 107
c4=[中 国], len=2
```

## 复数

```go
complex64 complex128
```

## 布尔值

`bool` 类型数据只允许取值 `true` 和 `false`，默认值为 `false`

`bool` 类型占一个字节

## 字符串

字符串是一个**只读**的字节数组

字符串底层实现的数据结构（结构体），占用16个字节，前8个字节是一个指针，指向字符数组的地址，后8个字节是一个整数，标识数组的长度。

```go
type StringHeader struct {
  Data uintptr
  Len  int
}
```

```go
var a string
a = "aa"
fmt.Println("a size=", unsafe.Sizeof(a)) // a size= 16

b = `{"name": "pdd", "age": 18}`
```

字符串和字节数组的转换

```go
a := "abcdefg"
// 字符串 -> []byte
b := []byte(a)
// []byte -> 字符串
c := string(b)
```

底层原理图：

<img src="./images/string.png" alt="string" style="zoom:60%;" />

## 常量

常量是一个简单值的标识符，在程序运行时，不会被修改的量

常量中的数据类型只可以是布尔型、数字型（整数型、浮点型和复数）和字符串型

```go
const s string = "abc"
```

## 数据类型转换

Example:

int32 -> float32

int32 -> int8

int32 -> int8

int32 -> int64

```go
package main

import "fmt"

func main() {
  var i int32 = 100
  var n1 float32 = float32(i)
  var n2 int8 = int8(i)
  var n3 int64 = int64(i)
  fmt.Printf("i=%v n1=%v n2=%v n3=%v\n", i, n1, n2, n3)

  // 被转换的是变量存储的数据（值），变量本身的数据类型没有变化
  fmt.Printf("i type is %T\n", i)

  // 高精度 -> 低精度；高精度的值超过低精度值的范围，编译时不会出错，结果会按溢出处理
  var num1 int64 = 999999
  var num2 int8 = int8(num1)
  fmt.Println("num2=", num2)
}
```

```shell
i=100 n1=100 n2=100 n3=100
i type is int32
num2= 63
```

Example:

```go
package main

import (
  "fmt"
  "strconv"
)

func main() {
  var num1 int = 99
  var num2 float64 = 23.456
  var b bool = true
  var str string = "hello"

  // int -> string
  str1 := strconv.FormatInt(int64(num1), 10)
  fmt.Printf("str1: type=%T, value=%q\n", str1, str1)
  // float64 -> string
  str2 := strconv.FormatFloat(num2, 'f', 10, 64)
  fmt.Printf("str2: type=%T, value=%q\n", str2, str2)
  // bool -> string
  str3 := strconv.FormatBool(b)
  fmt.Printf("str3: type=%T, value=%q\n", str3, str3)

  // string -> int64
  i1, _ := strconv.ParseInt("100", 10, 64)
  fmt.Printf("i1: type=%T, value=%d\n", i1, i1)
  // string -> float64
  i2, _ := strconv.ParseFloat("23.456", 64)
  fmt.Printf("i2: type=%T, value=%f\n", i2, i2)
  // string -> bool
  i3, _ := strconv.ParseBool("true")
  fmt.Printf("i3: type=%T, value=%t\n", i3, i3)
  // string在做数据类型转换时，要确保string能转换成有效的数据，否则转换为默认值
  i4, _ := strconv.ParseInt(str, 10, 64)
  fmt.Printf("i4: type=%T, value=%d\n", i4, i4)
}
```

```shell
str1: type=string, value="99"
str2: type=string, value="23.4560000000"
str3: type=string, value="true"
i1: type=int64, value=100
i2: type=float64, value=23.456000
i3: type=bool, value=true
i4: type=int64, value=0
```
