---
layout: post
title: Umbraco 8 custom database usage
---

This is a placeholder with some information for future completion.

## Creating tables
```c#
[TableName("Directors")]
[PrimaryKey("Id", autoIncrement = true)]
[ExplicitColumns]
public class Director
{
    [Column("Id")]
    [PrimaryKeyColumn(AutoIncrement = true)]
    public int Id { get; set; }

    [Column("FirstName")]
    public string FirstName { get; set; }

    [Column("LastName")]
    public string LastName { get; set; }

    [Column("Biography")]
    [SpecialDbType(SpecialDbTypes.NTEXT)]
    [NullSetting(NullSetting = NullSettings.Null)]
    public string Biography { get; set; }
}
```