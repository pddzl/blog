---
outline: Gin
---

# Gin

## Websocket

gin 中使用websocket

```go
var upgrade = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func WebsocketTask(c *gin.Context) {
  // 升级成 websocket 连接
  ws, err := upgrade.Upgrade(c.Writer, c.Request, nil)
  if err != nil {
    log.Fatalln(err)
  }

  // 完成时关闭连接释放资源
  defer ws.close()
}
```

许多项目中前后端使用 jwt 认证，那么 websocket 中，如果使用jwt认证呢

```go
func WebsocketTask(c *gin.Context) {
	// 获取token
	token := c.Request.Header.Get("Sec-Websocket-Protocol")
	// 校验token
	// ... 省略校验过程
	// 这里只做个例子，实际校验逻辑会放在中间件jwt认证里面

  // 升级成 websocket 连接
  var upGrader = websocket.Upgrader{
		// 跨域
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
		Subprotocols: []string{c.Request.Header.Get("Sec-Websocket-Protocol")}, //设置Sec-Websocket-Protocol
	}
	ws, err := upGrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Fatalln(err)
	}
  
  // 完成时关闭连接释放资源
	defer ws.Close()
}
```

请求header

```shell
Accept-Encoding: gzip, deflate, br
Accept-Language: en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,lb;q=0.6
Cache-Control: no-cache
Connection: Upgrade
Host: localhost:8080
Origin: http://localhost:8080
Pragma: no-cache
Sec-Websocket-Extensions: permessage-deflate; client_max_window_bits
Sec-Websocket-Key: d1PW8//6vU6RnPbxkvkAiw==
Sec-Websocket-Protocol: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MSwiVXNlcm5hbWUiOiJhZG1pbiIsIkJ1ZmZlclRpbWUiOjIxNjAwLCJleHAiOjE2ODY4MjExNzQsImlzcyI6InNkbkxjbSIsIm5iZiI6MTY4NjczMzc3NH0.ehBnL-V3EM36ujtEjThcu_Iw9W7_zt4EjeLIZRegz6c
Sec-Websocket-Version: 13
Upgrade: websocket
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36
```

返回header
```shell
Connection: Upgrade
Sec-Websocket-Accept: QYEFwaHPJ1W48RCHoYzQTvRzgs0=
Sec-Websocket-Protocol: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MSwiVXNlcm5hbWUiOiJhZG1pbiIsIkJ1ZmZlclRpbWUiOjIxNjAwLCJleHAiOjE2ODY4MjExNzQsImlzcyI6InNkbkxjbSIsIm5iZiI6MTY4NjczMzc3NH0.ehBnL-V3EM36ujtEjThcu_Iw9W7_zt4EjeLIZRegz6c
Upgrade: websocket
```