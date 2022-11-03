---
title: JavaScript
---

## 下载

前端下载文件通常会遇到这样两种情况：

- 文件上传到资源服务器上，后端只保存了文件地址，前端拿到后端返回的文件地址直接下载。

- 文件就存在后端服务器上（通常是临时根据前端参数动态生成，用完就删除），后端读取文件后向前端返回文件的二进制流。

### 直接下载

我们知道，a标签可以访问下载文件的地址，浏览器帮助进行下载。但是对于浏览器支持直接浏览的txt、png、jpg、gif等文件，是不提供直接下载（可右击从菜单里另存为）的。

为了解决这个直接浏览不下载的问题，可以利用 `download` 属性，`download` 属性是 HTML5 新增的属性

要知道浏览器是否支持 `download` 属性，简单的一句代码即可区分

```js
const isSupport = 'download' in document.createElement('a')
```

#### 优点

- 能解决不能直接下载浏览器可浏览的文件

#### 缺点

- 必须已知下载文件地址

- 不能下载跨域下的浏览器可浏览的文件

- 有兼容性问题，特别是IE

- 不能进行鉴权

Example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Download</title>
</head>
<body>
  <a href="http://192.168.1.10:8080/test.txt" download>下载</a>
</body>
</html>
```

可以带上属性值，指定下载的文件名，即重命名下载文件。不设置的话默认是文件原本名。

```html
<a href="http://192.168.1.10:8080/test.txt" download="123.txt">下载</a>
```

### 利用Blob对象

利用 `Blob` 对象可以将文件流转化成 `Blob` 二进制对象

进行下载的思路很简单：发请求获取二进制数据，转化为 `Blob` 对象，利用 `URL.createObjectUrl` 生成url地址，赋值在 `a` 标签的 `href` 属性上，结合 `download` 进行下载。

#### 优点

- 能解决不能直接下载浏览器可浏览的文件

- 可设置header，也就可添加鉴权信息

#### 缺点

- 兼容性问题，IE10以下不可用

Example:

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Download</title>
</head>

<body>
  <button onclick="donwloadFunc()">下载</button>
</body>
<script type="text/javascript">
  function donwloadFunc() {
    const xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const result = JSON.parse(xhr.responseText)
        const url = window.URL.createObjectURL(new Blob([JSON.stringify(result.data)]))
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.setAttribute('download', 'result.txt')
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(a.href)
        document.body.removeChild(a)
      }
    }
    xhr.open('get', 'http://10.192.104.101:8888/user/getUserInfo', true)
    xhr.setRequestHeader('content-type', 'application/json')
    xhr.setRequestHeader('x-token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVVUlEIjoiZTY3YmQ3NjEtZTdhMC00Y2Y4LWFlZTQtZjNiNGMzMTkzYTJkIiwiSUQiOjEsIlVzZXJuYW1lIjoiYWRtaW4iLCJOaWNrTmFtZSI6Iui2hee6p-euoeeQhuWRmCIsIkF1dGhvcml0eUlkIjoiODg4IiwiQnVmZmVyVGltZSI6MCwiZXhwIjoxNjQ3Mzk4NDIxLCJuYmYiOjE2NDY3OTI2MjF9.IbjQEU8Od0K3IciNlP9rMvQClJfbCKQqQPqkLEPtFMI')
    xhr.send()
  }
</script>

</html>
```

参考：`https://juejin.cn/post/6844904069958467592`

## 事件循环

## 网络

### IP校验
