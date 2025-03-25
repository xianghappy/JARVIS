package com.adminapplication.utils;

import lombok.Getter;
import lombok.Setter;

/**
 * 用于登录响应给客户端数据
 */
@Getter
@Setter
public class Result {

    private boolean flag;

    private String message;
}
