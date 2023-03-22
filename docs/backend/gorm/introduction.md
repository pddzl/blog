---
outline: deep
---

# 入门指南

## 声明模型

```go
type Cluster struct {
  ID           uint           `gorm:"primarykey"` // 主键ID
  CreatedAt    time.Time      // 创建时间
  UpdatedAt    time.Time      // 更新时间
  DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"` // 删除时间
  Name         string         `gorm:"not null;unique;comment:'集群名称'"`
  CType        string         `gorm:"type:enum('master','slave');default:'master';comment:'主从类型'"`
  MasterIp     string         `gorm:"comment:'主集群IP'"`
  MasterPort   uint           `gorm:"comment:'主集群Port'"`
  MasterPass   string         `gorm:"type:varchar(2000);comment:'主集群密码'"`
  Desc         string         `gorm:"comment:'集群描述'"`
  SdnVersion   string         `gorm:"type:enum('arSdn_3.1', 'arSdn_3.2');comment:'SDN版本'"`
  BackendType  string         `gorm:"type:enum('KVM','VMware');comment:'后端集群类型'"`
  BackendIp    string         `gorm:"not null;unique;comment:'后端集群IP'"`
  BackendPort  uint           `gorm:"not null;comment:'后端集群端口'"`
  BackendUser  string         `gorm:"comment:'VMware账号'"`
  BackendPass  string         `gorm:"comment:'VMware密码'"`
  Network      Networks       `gorm:"not null;type:json;comment:'网络'"`
  Sdn          SDN            `gorm:"not null;type:json;comment:'SDN参数'"`
  Status       int            `gorm:"not null;comment:'集群状态'"`
  Hosts        []HostModel    `gorm:"constraint:OnDelete:CASCADE;comment:'主机'"` // 一对多
}
```

`Networks`、`SDN` 是自定义数据类型，详情见自定义数据类型章节

对应MySQL中的类型

```shell
mysql> desc clusters;
+----------------+------------------------+------+-----+---------+----------------+
| Field          | Type                   | Null | Key | Default | Extra          |
+----------------+------------------------+------+-----+---------+----------------+
| id             | bigint unsigned        | NO   | PRI | NULL    | auto_increment |
| created_at     | datetime               | YES  |     | NULL    |                |
| updated_at     | datetime               | YES  |     | NULL    |                |
| deleted_at     | datetime               | YES  | MUL | NULL    |                |
| name           | varchar(191)           | NO   | UNI | NULL    |                |
| c_type         | enum('master','slave') | YES  |     | master  |                |
| master_ip      | varchar(191)           | YES  |     | NULL    |                |
| master_port    | bigint unsigned        | YES  |     | NULL    |                |
| master_pass    | varchar(2000)          | YES  |     | NULL    |                |
| desc           | varchar(191)           | YES  |     | NULL    |                |
| sdn_version    | enum('arSdn_3.1')      | YES  |     | NULL    |                |
| backend_type   | enum('KVM','VMware')   | YES  |     | NULL    |                |
| backend_ip     | varchar(191)           | NO   | UNI | NULL    |                |
| backend_port   | bigint unsigned        | NO   |     | NULL    |                |
| backend_user   | varchar(191)           | YES  |     | NULL    |                |
| backend_pass   | varchar(191)           | YES  |     | NULL    |                |
| network        | json                   | NO   |     | NULL    |                |
| sdn            | json                   | NO   |     | NULL    |                |
| status         | bigint                 | NO   |     | NULL    |                |
| latest_task_id | varchar(191)           | YES  |     | NULL    |                |
+----------------+------------------------+------+-----+---------+----------------+
```

### 字段标签

| 标签名 | 说明 |
| ----- | --- |
| column | 指定 db 列名 |
| type | 列数据类型，type:enum('KVM','VMware')|

## 连接到数据库

GORM 官方支持的数据库类型有：MySQL, PostgreSQL, SQlite, SQL Server

### MySQL

```go
import (
  "gorm.io/driver/mysql"
  "gorm.io/gorm"
)

// 不建立外键
func gormConfig() *gorm.Config {
  config := &gorm.Config{DisableForeignKeyConstraintWhenMigrating: true}
  return config
}

func GormMysql() *gorm.DB {
  dsn := "root:td27@2021@tcp(127.0.0.1:3306)/dbname?charset=utf8mb4&parseTime=True&loc=Local"
  mysqlConfig := mysql.Config{
    DSN:                       dsn,   // DSN data source name
    DefaultStringSize:         256,   // string 类型字段的默认长度
    DisableDatetimePrecision:  true,  // 禁用 datetime 精度，MySQL 5.6 之前的数据库不支持
    DontSupportRenameIndex:    true,  // 重命名索引时采用删除并新建的方式，MySQL 5.7 之前的数据库和 MariaDB 不支持重命名索引
    DontSupportRenameColumn:   true,  // 用 `change` 重命名列，MySQL 8 之前的数据库和 MariaDB 不支持重命名列
    SkipInitializeWithVersion: false, // 根据版本自动配置
  }
  if db, err := gorm.Open(mysql.New(mysqlConfig), gormConfig()); err != nil {
    log.Println("mysql connect fail")
    return nil
  } else {
    return db
  }
}
```
