---
outline: deep
---

# 聚合类型

## 数组

数组是由相同类型元素的集合组成的数据结构，计算机会为数组分配一块连续的内存来保存其中的元素

### 初始化

```go
a := [3]int{1, 2, 3}
b := [...]int{1, 2, 3} // 编译期间通过源代码推导数组的大小
```

### 语句转换

1. 当元素数量小于或者等于 4 个时，会直接将数组中的元素放置在栈上

2. 当元素数量大于 4 个时，会将数组中的元素放置到静态区并在运行时取出

参考：<https://draveness.me/golang/docs/part2-foundation/ch03-datastructure/golang-array/>

### 内存布局

+ 数组地址可以通过数组名来获取 &数组名

+ 数组第一个元素的地址就是数组的地址

+ 数组各个元素的地址间隔是依据数组类型决定的，比如int64 -> 8字节，int32 -> 4字节 ...

```go
package main

import "fmt"

func main() {
  var intArr [3]int
  fmt.Printf("intArr的地址=%p\n"+
    "intArr[0]的地址=%p\n"+
    "intArr[1]的地址=%p\n"+
    "intArr[2]的地址=%p\n",
    &intArr, &intArr[0], &intArr[1], &intArr[2])
  // 为什么内存地址是一个字节加1，google内存最小寻址单位
}
```

```shell
intArr的地址=0xc000014090
intArr[0]的地址=0xc000014090
intArr[1]的地址=0xc000014098
intArr[2]的地址=0xc0000140a0
```

Example: 修改数组的值

```go
package main

import "fmt"

func modify(arr *[3]int) {
  (*arr)[0] = 80
  arr[1] = 90 // 指针隐式解引用
  // arr++ go中没有指针运算
}

func main() {
  var intArr [3]int = [3]int{10, 20, 30}
  modify(&intArr)
  fmt.Println("intArr", intArr)
}
```

```shell
intArr [80 90 30]
```

## 结构体

结构体是由零个或多个任意类型的值聚合成的实体

在创建一个结构体变量后，如果没有给字段赋值，则字段对应其默认值

### 初始化

```go
type Cat struct {
  Name string
  Age int
  Color string
  Hobby string
}

// 结构体变量
var cat1 Cat
cat1.Name = "小猫"
cat.Age = 2
cat.Color = "黄色"
cat.Hobby = "吃鱼"

// cat2 cat3 结构体字面量
cat2 := Cat{"小猫", 2, "黄色", "吃鱼"} // 字段顺序与Cat一致

// 字段顺序可以与Cat不一致
cat3 := Cat{
  Name: "小猫",
  Age: 2,
  Color: "黄色",
  Hobby: "吃鱼",
}

var cat4 *Cat = new(Cat)
cat4.Name = "小猫" // 隐式解引用 等价于(*cat4).Name = "小猫"
cat4.Age = 2
cat4.Color = "黄色"
cat4.Hobby = "吃鱼"

var cat5 *Cat = &Cat{}
```

### 继承

```go
type A struct {
  Name string
  Price int
}

type B string {
  A // 嵌套匿名结构体A
  Writing string
}
```

+ 匿名结构体字段访问可以简化

```go
var b B
b.name = "tom" // b.A.name = "tom"
b.age = 78 // b.A.age = 78
b.say() // b.A.say()
```

+ 当结构体和匿名结构体有相同的字段或者方法时，编译器采用就近访问原则访问，如希望访问匿名结构体的字段和方法，可以通过匿名结构体名来区分

+ 结构体嵌入两个（或多个）匿名结构体（多重继承），如两个匿名结构体有相同的字段和方法（同时结构体本身没有同名的字段和方法），在访问时，就必须明确指定匿名结构体名字，否则编译出错

+ 结构体嵌入有名结构体，这种模式就叫组合，如果是组合关系，那么访问组合的结构体的字段和方法时，就必须带上结构体的名字

```go
type A struct {
  Name string
  Age int
}

type C struct {
  a A
}

var c C
c.a.Name = "jack"
```

+ 嵌套匿名结构体后，也可以在创建结构体变量时，直接指定各个匿名结构体字段的值

```go
type Goods struct {
  Name string
  Price float64
}

type Brand struct {
  Name string
  Address string
}

type Tv struct {
  Goods
  Brand
}

tv := Tv{ Goods{"电视机", 2999}, Brand{
  Name:    "小米",
  Address: "北京",
},}
```

### 结构体内存分布

结构体字段内存地址是连续的

```go
package main

import (
  "fmt"
  "unsafe"
)

type Cat struct {
  Name  string
  Age   int
  Color string
  Hobby string
  }

func main() {
  var cat1 Cat
  cat1.Name = "小猫"
  cat1.Age = 2
  cat1.Color = "黄色"
  cat1.Hobby = "吃鱼"

  fmt.Printf("%p %p %p %p %p\n", &cat1, &cat1.Name, &cat1.Age, &cat1.Color, &cat1.Hobby)
  fmt.Println("内存大小", unsafe.Sizeof(cat1), unsafe.Sizeof(cat1.Name), unsafe.Sizeof(cat1.Age))
}
```

```shell
0xc000070040 0xc000070040 0xc000070050 0xc000070058 0xc000070068
内存大小 56 16 8
```
