# platform

## 核心框架
Spring Boot 2.6.3

##工具库
#Lombok
用于简化代码（自动生成 Getter/Setter、构造函数等），版本由 Spring Boot 父 POM 管理（默认与 Spring Boot 2.6.3 兼容）。

#Apache Commons Lang3 3.10
提供字符串、集合等工具类。

#Fastjson 1.2.83
阿里巴巴的 JSON 序列化/反序列化库。

#Hutool 5.7.21
国产工具库，提供文件操作、加密、日期处理等工具类。

## 开发环境
JDK 8
Spring Boot 2.6.3
#依赖管理和构建工具。
Maven


## 项目启动地址
本地运行：localhost:8080
群聊：localhost:8080/api/ws/sendAll
指定人员聊：localhost:8080/api/ws/{username}

##启动类：
PlatformApplication
