package com.adminapplication.utils;

import lombok.Getter;
import lombok.Setter;

/**
 * 服务端 发送 给 客户端的数据格式
 */
@Getter
@Setter
public class ResultMessage {

    private boolean isSystem;

    private String fromName;

    private Object message;//如果是系统消息就是数组
}
