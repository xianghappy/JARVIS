package com.adminapplication.utils;

import lombok.Getter;
import lombok.Setter;

/**
 * 客户端 -》 服务器 的数据格式
 */
@Getter
@Setter
public class Message {

    //指定接收人
    private String toName;

    //发送消息
    private String message;
}
