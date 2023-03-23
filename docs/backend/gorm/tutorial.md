---
outline: deep
---

# 教程

## 自定义数据类型

GORM 提供了少量接口，使用户能够为 GORM 定义支持的数据类型

### Scanner/Valuer

自定义的数据类型必须实现`Scanner`和`Valuer`接口，以便让 GORM 知道如何将该类型接收、保存到数据库

```go
// 网络
{
  "network": {
    "internal_network": {
      "net_start": "192.168.1.1",
      "net_end": "192.168.1.10",
      "prefix": 24
    },
    "management_network": {
      "net_start": "192.168.1.1",
      "net_end": "192.168.1.10",
      "prefix": 24
    },
  }
}

type Networks map[string]map[string]string

func (c Networks) Value() (driver.Value, error) {
  b, err := json.Marshal(c)
  return string(b), err
}

func (c *Networks) Scan(input interface{}) error {
  return json.Unmarshal(input.([]byte), c)
}

// SDN
{
  internal_vlan_id: "",
  external_vlan_range: "",
  vroute_template: "",
  mirror_url: "",
  mirror_tag: "",
  arnet_vlan_range: "",
}

type SDN map[string]string

func (c SDN) Value() (driver.Value, error) {
  b, err := json.Marshal(c)
  return string(b), err
}

func (c *SDN) Scan(input interface{}) error {
  return json.Unmarshal(input.([]byte), c)
}

type Cluster struct {
  global.ARSDN_MODEL
  Name         string      `gorm:"not null;unique;comment:'集群名称'"`
  CType        string      `gorm:"type:enum('master','slave');default:'master';comment:'主从类型'"`
  MasterIp     string      `gorm:"comment:'主集群IP'"`
  MasterPort   uint        `gorm:"comment:'主集群Port'"`
  MasterPass   string      `gorm:"type:varchar(2000);comment:'主集群密码'"`
  Desc         string      `gorm:"comment:'集群描述'"`
  SdnVersion   string      `gorm:"type:enum('arSdn_3.1', 'arSdn_3.2');comment:'SDN版本'"`
  BackendType  string      `gorm:"type:enum('KVM','VMware');comment:'后端集群类型'"`
  BackendIp    string      `gorm:"not null;unique;comment:'后端集群IP'"`
  BackendPort  uint        `gorm:"not null;comment:'后端集群端口'"`
  BackendUser  string      `gorm:"comment:'VMware账号'"`
  BackendPass  string      `gorm:"comment:'VMware密码'"`
  Network      Networks    `gorm:"not null;type:json;comment:'网络'"`
  Sdn          SDN         `gorm:"not null;type:json;comment:'SDN参数'"`
  Status       int         `gorm:"not null;comment:'集群状态'"`
  Hosts        []HostModel `gorm:"constraint:OnDelete:CASCADE;comment:'主机'"`
}
```

## 事务

```go
// 事务创建集群、主机
err = db.Transaction(func(tx *gorm.DB) error {
  // 创建主机
  if err = tx.Create(cluster.Hosts).Error; err != nil {
    // 返回任何错误都会回滚事务
    return err
  }

  // 创建集群
  if err = tx.Create(cluster).Error; err != nil {
    return err
  }

  // 返回 nil 提交事务
  return nil
})
```
