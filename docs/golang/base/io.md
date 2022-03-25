---
title: Input/Output
---

## io

io 包为 I/O 原语提供了基本的接口。它主要包装了这些原语的已有实现

### Reader

```go
type Reader interface {
  Read(p []byte) (n int, err error)
}
```

`Reader` 是包装了基本 Read 方法的接口

Read 将 len(p) 个字节读取到 p 中。它返回读取的字节数 n（0 <= n <= len(p)）以及任何遇到的错误。即使 Read 返回的 n < len(p)，它也会在调用过程中占用 len(p) 个字节作为暂存空间。若可读取的数据不到 len(p) 个字节，Read 会返回可用数据，而不是等待更多数据。

当 Read 在成功读取 n > 0 个字节后遇到一个错误或 EOF (end-of-file)，它会返回读取的字节数。它可能会同时在本次的调用中返回一个 non-nil 错误，或在下一次的调用中返回这个错误（且 n 为 0）。一般情况下, `Reader` 会返回一个非0字节数 n, 若 n = len(p) 个字节从输入源的结尾处由 Read 返回，Read 可能返回 err == EOF 或者 err == nil。并且之后的 Read() 都应该返回 (n:0, err:EOF)。

调用者在考虑错误之前应当首先处理返回的数据。这样做可以正确地处理在读取一些字节后产生的 I/O 错误，同时允许 EOF 的出现。

### LimitReader

```go
func LimitReader(r Reader, n int64) Reader
```

`LimitReader` 读取 n bytes 后返回一个 `Reader`

Exmaple

```go
package main

import (
  "io"
  "log"
  "os"
  "strings"
)

func main() {
  r := strings.NewReader("some io.Reader stream to be read\n")
  lr := io.LimitReader(r, 4)

  if _, err := io.Copy(os.Stdout, lr); err != nil {
    log.Fatal(err)
  }
}
```

```shell
some
```

### MultiReader

```go
func MultiReader(readers ...Reader) Reader
```

`MultiReader` 返回一个逻辑串联 input readers 的 `Reader`，input 是按照顺序读取的，所有 input 都返回 EOF，Read 将返回 EOF。如果有一个 input 返回 non-nil，non-EOF 错误，Read 将返回该错误

Example

```go
package main

import (
  "io"
  "log"
  "os"
  "strings"
)

func main() {
  r1 := strings.NewReader("first reader ")
  r2 := strings.NewReader("second reader ")
  r3 := strings.NewReader("third reader\n")
  r := io.MultiReader(r1, r2, r3)

  if _, err := io.Copy(os.Stdout, r); err != nil {
    log.Fatal(err)
  }
}
```

```shell
first reader second reader third reader
```

### Writer

```go
type Writer interface {
  Write(p []byte) (n int, err error)
}
```

`Writer` 是包装了基本 Write 方法的接口

Write 将 len(p) 个字节从 p 中写入到基本数据流中。它返回从 p 中被写入的字节数 n（0 <= n <= len(p)）以及任何遇到的引起写入提前停止的错误。若 Write 返回的 n < len(p)，它就必须返回一个 non-nil 的错误

### MultiWriter

```go
func MultiWriter(writers ...Writer) Writer
```

`MultiWriter` 创建一个 writer 将写入数据复制到所有的 writers，类似于 Unix tee 命令

Example

```go
package main

import (
  "bytes"
  "fmt"
  "io"
  "log"
  "strings"
)

func main() {
  r := strings.NewReader("some io.Reader stream to be read\n")

  var buf1, buf2 bytes.Buffer
  w := io.MultiWriter(&buf1, &buf2)

  if _, err := io.Copy(w, r); err != nil {
    log.Fatal(err)
  }

  fmt.Print(buf1.String())
  fmt.Print(buf2.String())
}
```

```shell
some io.Reader stream to be read
some io.Reader stream to be read
```

### Copy

```go
func Copy(dst Writer, src Reader) (written int64, err error)
```

`Copy` 拷贝 src 到 dst 直到遇到 EOF 或者错误发生。

Example

```go
package main

import (
  "io"
  "log"
  "os"
  "strings"
)

func main() {
  r := strings.NewReader("some io.Reader stream to be read\n")

  if _, err := io.Copy(os.Stdout, r); err != nil {
    log.Fatal(err)
  }
}
```

```shell
some io.Reader stream to be read
```
