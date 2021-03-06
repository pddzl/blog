---
title: CSS
---

## 选择器

### 基本选择器

- 通用选择器

`*` 选择所有元素

语法：`*` `ns|*` `*|*`

例子：

```css
* {
  backgroud-color: purple;
}
```

- 元素选择器

按照给定的节点名称，选择所有匹配的元素

语法：`element name`

例子：

```css
p {
  font-size: 12px;
}
```

- 类选择器

按照给定的类属性的值，选择所有匹配的元素

语法：`.class name`

例子：

```css
.bottom {
  margin-bottom: 10px;
}
```

- ID选择器

按照 id 属性选择一个与之匹配的元素。需要注意的是，**一个文档中，每个 ID 属性都应当是唯一的**

语法：`#id name`

例子：

```css
#pdd {
  padding: 10px;
}
```

- 属性选择器

按照给定的属性，选择所有匹配的元素

语法：`[attr]` `[attr=value]` `[attr~=value]` `[attr|=value]` `[attr^=value]` `[attr$=value]` `[attr*=value]`

例子：

```css
[title]
{
  color:blue;
}
```

### 分组选择器

- 选择器列表

`,` 是将不同的选择器组合在一起的方法，它选择所有能被列表中的任意一个选择器选中的节点

语法：`A, B`

例子：`div, span` 会同时匹配 `<span>` 元素和 `<div>` 元素

### 组合器

- 后代组合器

（空格）组合器选择前一个元素的后代节点。

语法：A B

例子：`div span` 匹配所有位于任意 `<div>` 元素之内的 `<span>` 元素。

- 直接子代组合器

`>` 组合器选择前一个元素的直接子代的节点。

语法：`A > B`

例子：

```html
<html>
  <head>
    <style type="text/css">
      .test >p {
        color: red;
      }
    </style>
  </head>
  <body>
    <div class="test">
      <p>first line</p>
      <p>second line</p>
      <div>
        <p>nested first line</p>
      </div>
    </div>
  </body>
</html>
```

<img src="./images/child.png" />

- 一般兄弟组合器

`~` 组合器选择兄弟元素，也就是说，后一个节点在前一个节点后面的任意位置，并且共享同一个父节点。

语法：`A ~ B`

例子：`p ~ span` 匹配同一父元素下，`<p>` 元素后的所有 `<span>` 元素。

- 紧邻兄弟组合器

`+` 组合器选择相邻元素，即后一个元素紧跟在前一个之后，并且共享同一个父节点。

语法：`A + B`

例子：`h2 + p` 会匹配所有紧邻在 `<h2>` 元素后的 `<p>` 元素。

- 列组合器

`||` 组合器选择属于某个表格行的节点。

语法： `A || B`

例子： `col || td` 会匹配所有 `<col>` 作用域内的 `<td>` 元素。

### 伪选择器

- 伪类

`:` 伪选择器支持按照未被包含在文档树中的状态信息来选择元素

| 选择器 | 描述 | 备注 |
| ----- | --- | ---- |
| :first-child | 匹配兄弟元素中的第一个元素 | 所选元素前面不能有兄弟节点 |
| :last-child | 匹配兄弟元素中最末的那个元素 | 所选元素后面不能有兄弟节点 |
| :not | 匹配作为值传入自身的选择器未匹配的物件 | |
| :nth-child | 匹配一列兄弟元素中的元素——兄弟元素按照an+b形式的式子进行匹配（比如2n+1匹配元素1、3、5、7等。即所有的奇数个）|

例子：

```css
.box p:nth-child(1) {
  color: pink;
}
.detail:not(:last-child) {
    margin-bottom: 15px;
}
```

- 伪元素

`::` 伪选择器用于表示无法用 HTML 语义表达的实体

例子：`p::first-line` 匹配所有 `<p>` 元素的第一行

## 布局

### float

`float` CSS属性指定一个元素应沿其容器的左侧或右侧放置，允许**文本**和**内联元素**环绕它。该元素从网页的正常流动(文档流)中移除，尽管仍然保持部分的流动性（与绝对定位相反）

#### 语法

`float: left` 表明元素必须浮动在其所在的块容器左侧的关键字

`float: right` 表明元素必须浮动在其所在的块容器右侧的关键字

#### 清除浮动

在非IE浏览器（如Firefox）下，当容器的高度为auto，且容器的内容中有浮动（float为left或right）的元素，在这种情况下，容器的高度不能自动伸长以适应内容的高度，使得内容溢出到容器外面而影响（甚至破坏）布局的现象。这个现象叫浮动溢出，为了防止这个现象的出现而进行的CSS处理，就叫CSS清除浮动。

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style type="text/css">
    .test {
      background-color: rgba(128, 128, 128, 0.185);
      border: solid 1px black;
      width: 270px;
      padding: 5px;
    }

    p {
      color: blue;
      float: left;
    }

    .left {
      width: 50px;
      height: 50px;
      background-color: aqua;
      float: left;
    }

    .right {
      width: 50px;
      height: 50px;
      background-color: aquamarine;
      float: right;
    }

    /* .clearfix:after {
      content: "020";
      display: block;
      height: 0;
      clear: both;
      visibility: hidden;
    } */
  </style>
</head>

<body>
  <div class="test clearfix">
    <div class="left"></div>
    <p>
      hello everyone, i am pdd.
    </p>
    <div class="right"></div>
  </div>
</body>

</html>
```

<img src="./images/unclear.png" />

清除浮动，不注释`.clearfix:after`

<img src="./images/clear.png" />

参考：`https://segmentfault.com/a/1190000004865198`

### position

`position` 属性用于指定一个元素在文档中的定位方式，一共有5种定位方式

- static

`static` 是 `position` 属性的默认值。

这时，浏览器会按照源码的顺序，决定每个元素的位置，这称为"正常的页面流"（normal flow）。每个块级元素占据自己的区块（block），元素与元素之间不产生重叠，这个位置就是元素的默认位置。（top、buttom、left、right属性失效）

- relative

相对定位，`relative` 是相对于**自身默认位置**进行偏移，元素不会被移出正常文档流

example: block1向右向下偏移20px

```html
<html>
  <head>
    <style>
      .block1 {
        width: 50px;
        height: 50px;
        background-color: aqua;
        position: relative;
        left: 20px;
        top: 20px;
      }
      .block2 {
        width: 50px;
        height: 50px;
        background-color: pink;
      }
    </style>
  </head>
  <body>
    <div class="block1">
      <p>block1</p>
    </div>
    <div class="block2">
      <p>block2</p>
    </div>
  </body>
</html>
```

<img src="./images/position/relative.png" />

- absolute

绝对定位，`absolute` 相对于父级元素进行偏移（最近父一级的非 `static` 定位元素，如果未找到定位元素，则定位基点就会变成整个网页的根元素 `html`），元素会被移出正常文档流

<img src="./images/position/absolute.png" />

- fixed

固定定位，`fixed` 相对于视口（viewport，浏览器窗口）进行偏移，即定位基点是浏览器窗口。这会导致元素的位置不随页面滚动而变化，好像固定在网页上一样。元素会被移出正常文档流。

- sticky

`sticky` 跟前面四个属性值都不一样，它会产生动态效果，很像 `relative` 和 `fixed` 的结合：一些时候是 `relative` 定位（定位基点是自身默认位置），另一些时候自动变成`fixed`定位（定位基点是视口）。元素不会被移出正常文档流

#### z-index

`z-index` 属性设定了一个定位元素及其后代元素或 `flex` 项目的 `z-order`。当元素之间重叠的时候，`z-index` 较大的元素会覆盖较小的元素在上层进行显示。(默认是后面的元素覆盖前面的元素)

```html
<html>
  <head>
    <style>
      .block1 {
        width: 50px;
        height: 50px;
        background-color: aqua;
        position: relative;
        left: 20px;
        top: 20px;
        z-index: 2;
      }
      .block2 {
        width: 50px;
        height: 50px;
        background-color: pink;
        position: relative;
        z-index: 1;
      }
    </style>
  </head>
  <body>
    <div class="block1">
      <p>1</p>
    </div>
    <div class="block2">
      <p>2</p>
    </div>
  </body>
</html>
```

<img src="./images/position/z-index.png" />

#### 定位实现水平垂直居中

```html
position: relative;
left: 50%;
top: 50%;
transform: trnaslate(-%50, -%50);
```

### flex

### grid
