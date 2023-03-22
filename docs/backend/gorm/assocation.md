---
outline: deep
---

# 关联

## Belongs to

`belongs to`会与另一个模型建立了一对一的连接。这种模型的每一个实例都“属于”另一个模型的一个实例。

例如，您的应用包含 cluster 和 host，并且每个 host 能且只能被分配给一个 cluster。下面的类型就表示这种关系。注意，在`Host`对象中，有一个和`Cluster`一样的ClusterID。默认情况下，`ClusterID`被隐含地用来在`Host`和`Cluster`之间创建一个外键关系，因此必须包含在`Host`结构体中才能填充`Cluster`内部结构体。

```go
// Host 属于 Cluster，ClusterID是外键
type Host struct {
  gorm.Model
  HostName  string  `gorm:"column:hostname;not null;unique"`
  SshIp     string  `gorm:"not null;unique"`
  ClusterID uint    // 外键
  Cluster   Cluster
}

type Cluster struct {
  gorm.Model
  Name  string  `gorm:"not null;unique"`
}
```

## Has One

`has one`与另一个模型建立一对一的关联，但它和一对一关系有些许不同。这种关联表明一个模型的每个实例都包含或拥有另一个模型的一个实例。

例如，您的应用包含 cluster 和 host 模型，且每个 cluster 只能有一个 host。

```go
// Cluster有一个Host，ClusterID是外键
type Cluster struct {
  gorm.Model
  Name  string  `gorm:"not null;unique"`
  Host  Host    `gorm:"constraint:OnDelete:CASCADE"`
}

type Host struct {
  gorm.Model
  ClusterID uint    // 外键
  HostName  string  `gorm:"column:hostname;not null;unique"`
  SshIp     string  `gorm:"not null;unique"`
}
```

## Has Many

`has many`与另一个模型建立了一对多的连接。不同于`has one`，拥有者可以有零或多个关联模型。

例如，您的应用包含cluster和host模型，且每个cluster可以有多个host。

```go
// Cluster有多个Host，ClusterID是外键
type Cluster struct {
  gorm.Model
  Name  string  `gorm:"not null;unique"`
  Hosts []Host  `gorm:"constraint:OnDelete:CASCADE"`
}

type Host struct {
  gorm.Model
  ClusterID uint    // 外键
  HostName  string  `gorm:"column:hostname;not null;unique"`
  SshIp     string  `gorm:"not null;unique"`
}
```

## Many To Many

多对多会在两张表之间添加一张连接表

例如：模板表、任务表，模板表的每条记录包含多条任务。与一对多的区别：**一对多中每条记录含有的多条记录必须是唯一的，不能被其它记录包含了**

<img src="./images/m2m.png" alt="manytomany" style="zoom:45%" />

```go
package main

import (
  "gorm.io/driver/mysql"
  "gorm.io/gorm"
  "time"
)

type CommonMODEL struct {
  ID        uint           `gorm:"primarykey"` // 主键ID
  CreatedAt time.Time      // 创建时间
  UpdatedAt time.Time      // 更新时间
  DeletedAt gorm.DeletedAt `gorm:"index" json:"-"` // 删除时间
}

// 模板表
type TemplateModel struct {
  CommonMODEL
  Name    string      `json:"name" gorm:"not null;unique"`
  Tasks   []TaskModel `json:"tasks" gorm:"many2many:template_tasks"`
  Comment string      `json:"comment"`
}

// 任务表
type TaskModel struct {
  CommonMODEL
  Name    string `json:"name" gorm:"not null;unique"`
  Comment string `json:"comment"`
}

func main() {
  client, err := gorm.Open(mysql.Open("root:huayun2021@(127.0.0.1)/gorm?charset=utf8mb4&parseTime=True&loc=Local"),
    &gorm.Config{DisableForeignKeyConstraintWhenMigrating: true})
  if err != nil {
    panic(err)
  }
  db, _ := client.DB()
  defer db.Close()

  // 初始化表
  client.AutoMigrate(&TemplateModel{}, &TaskModel{})

  var task1, task2, task3 TaskModel
  task1.ID = 1
  task1.Name = "task1"
  task2.ID = 2
  task2.Name = "task2"
  task3.ID = 3
  task3.Name = "task3"

  var template1, template2 TemplateModel
  template1.Name = "template1"
  template2.Name = "template2"

  tTasks1 := make([]TaskModel, 2)
  tTasks1[0] = task1
  tTasks1[1] = task2
  template1.Tasks = tTasks1

  tTasks2 := make([]TaskModel, 3)
  tTasks2[0] = task1
  tTasks2[1] = task2
  tTasks2[2] = task3
  template2.Tasks = tTasks2

  // 创建任务
  client.Create(&task1)
  client.Create(&task2)
  client.Create(&task3)

  // 创建模板
  client.Create(&template1)
  client.Create(&template2)
}
```

验证

```shell
mysql> select * from task_models;
+----+-------------------------+-------------------------+------------+-------+---------+
| id | created_at              | updated_at              | deleted_at | name  | comment |
+----+-------------------------+-------------------------+------------+-------+---------+
|  1 | 2022-07-09 15:47:05.219 | 2022-07-09 15:47:05.219 | NULL       | task1 |         |
|  2 | 2022-07-09 15:47:05.228 | 2022-07-09 15:47:05.228 | NULL       | task2 |         |
|  3 | 2022-07-09 15:47:05.236 | 2022-07-09 15:47:05.236 | NULL       | task3 |         |
+----+-------------------------+-------------------------+------------+-------+---------+
3 rows in set (0.00 sec)

mysql> select * from template_models;
+----+-------------------------+-------------------------+------------+-----------+---------+
| id | created_at              | updated_at              | deleted_at | name      | comment |
+----+-------------------------+-------------------------+------------+-----------+---------+
|  1 | 2022-07-09 15:47:05.242 | 2022-07-09 15:47:05.242 | NULL       | template1 |         |
|  2 | 2022-07-09 15:47:05.279 | 2022-07-09 15:47:05.279 | NULL       | template2 |         |
+----+-------------------------+-------------------------+------------+-----------+---------+
2 rows in set (0.00 sec)

mysql> select * from template_tasks;
+-------------------+---------------+
| template_model_id | task_model_id |
+-------------------+---------------+
|                 1 |             1 |
|                 1 |             2 |
|                 2 |             1 |
|                 2 |             2 |
|                 2 |             3 |
+-------------------+---------------+
5 rows in set (0.01 sec)
```

## 关联模式

### 查找关联

查找template ID为1包含的所有任务

```go
var tasks []TaskModel
var template TemplateModel
template.ID = 1
client.Model(&template).Association("Tasks").Find(&tasks)

for _, t := range tasks {
  fmt.Println(t.Name)
}

name -> task1
name -> task2
```

### 添加关联

template ID为1的记录添加任务3

```go
var task TaskModel
task.ID = 3
var template TemplateModel
template.ID = 1
client.Model(&template).Association("Tasks").Append(&task)
```

### 替换关联

template ID为1的记录目前的任务为1、2、3，现替换为4

```go
var task TaskModel
task.ID = 4
task.Name = "task4"
var template TemplateModel
template.ID = 1
client.Model(&template).Association("Tasks").Replace(&task)
```

## 预加载

GORM 允许在 Preload 的其它 SQL 中直接加载关系，例如：

```go
// Cluster有多个Host，ClusterID是外键
type Cluster struct {
  gorm.Model
  Name  string  `gorm:"not null;unique"`
  Hosts []Host  `gorm:"constraint:OnDelete:CASCADE"`
}

type Host struct {
  gorm.Model
  ClusterID uint    // 外键
  HostName  string  `gorm:"column:hostname;not null;unique"`
  SshIp     string  `gorm:"not null;unique"`
}

// 查找 cluster 时预加载相关 host
db.Preload("Hosts").Find(&cluster)
// SELECT * FROM clusters;
// SELECT * FROM hosts WHERE cluster_id = 1;
```
