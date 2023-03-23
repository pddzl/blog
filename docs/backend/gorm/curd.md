---
outline: deep
---

# CURD

## 创建

### 创建记录

```go
user := User{Name: "pdd", Age: 18, Birthday: time.Now()}

result := db.Create(&user) // 通过数据的指针来创建

user.ID             // 返回插入数据的主键
result.Error        // 返回 error
result.RowsAffected // 返回插入记录的条数
```

### 批量插入

要有效地插入大量记录，请将一个 `slice` 传递给 `Create` 方法。 GORM 将生成单独一条SQL语句来插入所有数据，并回填主键的值，钩子方法也会被调用。

```go
var users = []User{{Name: "jinzhu1"}, {Name: "jinzhu2"}, {Name: "jinzhu3"}}
db.Create(&users)

for _, user := range users {
  user.ID // 1,2,3
}
```

使用 `CreateInBatches` 分批创建时，你可以指定每批的数量，例如：

```go
var users = []User{{name: "pdd_1"}, ...., {Name: "pdd_10000"}}

// 数量为 100
db.CreateInBatches(users, 100)
```

### 根据Map创建

GORM 支持根据 `map[string]interface{}` 和 `[]map[string]interface{}{}` 创建记录

```go
db.Model(&User{}).Create(map[string]interface{}{
  "Name": "jinzhu", "Age": 18,
})

// batch insert from `[]map[string]interface{}{}`
db.Model(&User{}).Create([]map[string]interface{}{
  {"Name": "jinzhu_1", "Age": 18},
  {"Name": "jinzhu_2", "Age": 20},
})
```

### upsert(update+insert) 冲突

`table cluster` 与 `table host` 一对多关联关系

```go
model cluster {
  hosts []host
}

model host {
  ssh_ip string `gorm:not null;unique`
}
```

添加cluster

```go
cluster.hosts = []host{"192.168.1.1", "192.168.1.2"}
db.create(&cluster)
```

实际执行的SQL语句

```sql
insert into host ... ON DUPLICATE KEY UPDATE `cluster_id`=VALUES(`cluster_id`)
insert into cluster ...
```

解释：

> 在MySQL数据库中，如果在insert语句后面带上ON DUPLICATE KEY UPDATE 子句，而要插入的行与`表中现有记录的惟一索引或主键`中产生重复值，那么就会发生旧行的更新；如果插入的行数据与现有`表中记录的唯一索引或者主键`不重复，则执行新纪录插入操作。
>
> **说通俗点就是数据库中存在某个记录时，执行这个语句会更新，而不存在这条记录时，就会插入。**

参考：

`https://www.cnblogs.com/better-farther-world2099/articles/11737376.html`

`https://www.cnblogs.com/baichunyu/p/15076702.html`

***目前问题***

创建集群的时候会更新主机

主机（192.168.1.1, 192.168.1.2） 属于集群1

创建集群2（主机 ssh_ip 也是192.168.1.1, 192.168.1.2）

创建成功

192.168.1.1, 192.168.1.2 属于集群2

集群1无对应主机

解决方案

事务 `create host`、`create cluster` 分开执行

详见 `https://pddzl.github.io/blog/backend/gorm/tutorial.html#事务`

## 查询

### 检索单个对象

GORM 提供了 `First`、`Take`、`Last` 方法，以便从数据库中检索单个对象。当查询数据库时它添加了 `LIMIT 1` 条件，且没有找到记录时，它会返回 `ErrRecordNotFound` 错误

```go
// 获取第一条记录（主键升序）
db.First(&user)
// SELECT * FROM users ORDER BY id LIMIT 1;

// 获取一条记录，没有指定排序字段
db.Take(&user)
// SELECT * FROM users LIMIT 1;

// 获取最后一条记录（主键降序）
db.Last(&user)
// SELECT * FROM users ORDER BY id DESC LIMIT 1;

result := db.First(&user)
result.RowsAffected // 返回找到的记录数
result.Error        // returns error or nil

// 检查 ErrRecordNotFound 错误
errors.Is(result.Error, gorm.ErrRecordNotFound)
```

### 检索全部对象

```go
// 获取全部记录
var users []User
result := db.Find(&users)
// SELECT * FROM users;

result.RowsAffected // 返回找到的记录数，相当于 `len(users)`
result.Error        // returns error
```

### Joins

关于 `join` 的介绍详见 `https://pddzl.github.io/blog/db/mysql/join.html`

具体代码详见 `https://github.com/pddzl/td27-admin -> GetUsers 获取所有用户`

```go
type UserResult struct {
  CreatedAt   time.Time `json:"createdAt"`
  ID          uint
  Username    string `json:"username"` // 用户名
  Phone       string `json:"phone"`    // 手机号
  Email       string `json:"email"`    // 邮箱
  Active      bool   `json:"active"`   // 是否活跃
  RoleModelID uint   `json:"roleId"`   // 角色ID
  RoleName    string `json:"role"`     // 角色名
}

var userResults []systemRes.UserResult

db.Select("sys_user.id,sys_user.username,sys_user.phone,sys_user.email,sys_user.active,sys_user.role_model_id,sys_role.role_name").Joins("left join sys_role on sys_user.role_model_id = sys_role.id").Scan(&userResults)
```

## 更新

### 保存所有字段

`Save` 会保存所有的字段，即使字段是零值

```go
b.First(&user)

user.Name = "jinzhu 2"
user.Age = 100
db.Save(&user)
// UPDATE users SET name='jinzhu 2', age=100, birthday='2016-01-01', updated_at = '2013-11-17 21:34:10' WHERE id=111;
```

### 更新单个列

```go
db.Model(&Email{}).Where("id = ?", 2).Update("email", "pddzl5@163.com")
```

### 更新多列

`Updates` 方法支持 `struct` 和 `map[string]interface{}` 参数。当使用 `struct` 更新时，默认情况下，GORM 只会更新非零值的字段

```go
// 根据 `struct` 更新属性，只会更新非零值的字段
db.Model(&user).Updates(User{Name: "hello", Age: 18, Active: false})
// UPDATE users SET name='hello', age=18, updated_at = '2013-11-17 21:34:10' WHERE id = 111;

// 根据 `map` 更新属性
db.Model(&user).Updates(map[string]interface{}{"name": "hello", "age": 18, "active": false})
// UPDATE users SET name='hello', age=18, active=false, updated_at='2013-11-17 21:34:10' WHERE id=111;
```

::: warning
当使用 struct 进行更新时，GORM 只会更新非零值的字段。 你可以使用 map 更新字段，或者使用 Select 指定要更新的字段
:::

### 更新选定字段

如果您想要在更新时选定、忽略某些字段，您可以使用 `Select`、`Omit`

```go
// Select with Map
// User's ID is `111`:
db.Model(&user).Select("name").Updates(map[string]interface{}{"name": "hello", "age": 18, "active": false})
// UPDATE users SET name='hello' WHERE id=111;

db.Model(&user).Omit("name").Updates(map[string]interface{}{"name": "hello", "age": 18, "active": false})
// UPDATE users SET age=18, active=false, updated_at='2013-11-17 21:34:10' WHERE id=111;

// Select with Struct (select zero value fields)
db.Model(&user).Select("Name", "Age").Updates(User{Name: "new_name", Age: 0})
// UPDATE users SET name='new_name', age=0 WHERE id=111;

// Select all fields (select all fields include zero value fields)
db.Model(&user).Select("*").Updates(User{Name: "jinzhu", Role: "admin", Age: 0})

// Select all fields but omit Role (select all fields include zero value fields)
db.Model(&user).Select("*").Omit("Role").Updates(User{Name: "jinzhu", Role: "admin", Age: 0})
```

## 删除

删除一条记录时，删除对象需要指定主键，否则会触发 **批量 Delete**

```go
// Email 的 ID 是 `10`
db.Delete(&email)
// DELETE from emails where id = 10;

// 带额外条件的删除
db.Where("name = ?", "pdd").Delete(&email)
// DELETE from emails where id = 10 AND name = "pdd";
```

### 根据主键删除

GORM 允许通过主键(可以是复合主键)和内联条件来删除对象，它可以使用数字

```go
db.Delete(&User{}, 10)
// DELETE FROM users WHERE id = 10;

db.Delete(&User{}, "10")
// DELETE FROM users WHERE id = 10;

db.Delete(&users, []int{1,2,3})
// DELETE FROM users WHERE id IN (1,2,3);
```

### 批量删除

GORM默认不允许批量删除，对此你必须加一些条件，或者使用原生SQL，或者启用 `AllowGlobalUpdate` 模式

```go
db.Delete(&User{}).Error // gorm.ErrMissingWhereClause

db.Where("1 = 1").Delete(&User{})
// DELETE FROM `users` WHERE 1=1

db.Exec("DELETE FROM users")
// DELETE FROM users

db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&User{})
// DELETE FROM users
```

### 软删除

如果你的模型里面包含`gorm.DeleteAt`（`gorm.Model`提供）字段，会执行软删除。

记录不会被删除，而是把`DeleteAt`字段设置为当前时间，Query请求的时候不会显示出这个字段。

`Unscoped`会执行物理的删除

```go
db.Unscoped().Delete(&order)
// DELETE FROM orders WHERE id=10;
```

### 阻止全局删除

如果在没有任何条件的情况下执行批量删除，GORM 不会执行该操作，并返回 ErrMissingWhereClause 错误

对此，你必须加一些条件，或者使用原生 SQL，或者启用 AllowGlobalUpdate 模式，例如：

```go
db.Delete(&User{}).Error // gorm.ErrMissingWhereClause

db.Where("1 = 1").Delete(&User{})
// DELETE FROM `users` WHERE 1=1

db.Exec("DELETE FROM users")
// DELETE FROM users

db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&User{})
// DELETE FROM users
```
