# CSS

## 选择器

### 类型选择器

### 类选择器

### ID选择器

### 通用选择器

### 组合器

### 属性选择器

### 伪类

| 选择器 | 描述 | 备注 |
| ----- | --- | ---- |
| :first-child | 匹配兄弟元素中的第一个元素 | <font color=red>所选元素前面不能有兄弟节点</font> |
| :last-child | 匹配兄弟元素中最末的那个元素 | <font color=red>所选元素后面不能有兄弟节点</font> |
| :not | 匹配作为值传入自身的选择器未匹配的物件 | |
| :nth-child | 匹配一列兄弟元素中的元素——兄弟元素按照an+b形式的式子进行匹配（比如2n+1匹配元素1、3、5、7等。即所有的奇数个）|

```css
.box p:nth-child(1) {
  color: pink;
}
.detail:not(:last-child) {
    margin-bottom: 15px;
}
```

### 伪元素
