package com.adminapplication.service;

import cn.hutool.log.Log;
import cn.hutool.log.LogFactory;
import com.adminapplication.utils.Message;
import com.adminapplication.utils.MessageUtils;
import com.alibaba.fastjson.JSON;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 指定对象发送消息
 */
//@ServerEndpoint(value = "/api/ws/{username}",configurator = GetHttpSessionConfigurator.class)
@ServerEndpoint(value = "/api/ws/{username}")
@Component
public class WebSocketSingleServer {


    static Log log = LogFactory.get(WebSocketSingleServer.class);
    /**
     * 静态变量，用来记录当前在线连接数。应该把它设计成线程安全的。
     */
    private static int onlineCount = 0;
    /**
     * concurrent包的线程安全Set，用来存放每个客户端对应的MyWebSocket对象。
     */
    private static ConcurrentHashMap<String, WebSocketSingleServer> webSocketMap = new ConcurrentHashMap<>();
    /**
     * 与某个客户端的连接会话，需要通过它来指定客户端发送数据
     */
    private Session session;

//    //声明一个HttpSession对象
//    private HttpSession httpSession;
    /**
     * 接收userId
     */
    private String username = "";

    /**
     * 连接建立成功调用的方法
     */
    @OnOpen
    public void onOpen(Session session,@PathParam("username") String username, EndpointConfig endpointConfig) {

        //设置长连接时间
        session.setMaxIdleTimeout(1000 * 60 * 60 * 3);

        this.session = session;
//        //获取httpSession对象
//        HttpSession httpSession = (HttpSession) endpointConfig.getUserProperties().get(HttpSession.class.getName());
//        this.httpSession = httpSession;
//
//        //从httpSession对象中获取用户名
//        String username = (String) httpSession.getAttribute("user");
        this.username = username;

        if (webSocketMap.containsKey(username)) {
            webSocketMap.remove(username);
            webSocketMap.put(username, this);
        } else {
            webSocketMap.put(username, this);
            //加入set中
            addOnlineCount();
            //在线数加1
        }

        log.info("用户连接:" + username + ",当前在线人数为:" + getOnlineCount());

        //将当前在线用户的用户名推送给所有的客户端
        //1.获取消息 //服务器 -> 客户端发送消息
        String message = MessageUtils.getMessage(true, null, getNames());
        //调用系统推送
        broadcastAllUsers(message);
    }

    private Set<String> getNames() {
        return webSocketMap.keySet();
    }

    /**
     * 连接关闭调用的方法
     */
    @OnClose
    public void onClose() {
        if (webSocketMap.containsKey(username)) {
            webSocketMap.remove(username);
            //从set中删除
            subOnlineCount();

            //将当前在线用户的用户名推送给所有的客户端
            //1.获取消息 //服务器 -> 客户端发送消息
            String message = MessageUtils.getMessage(true, null, getNames());
            //调用系统推送
            broadcastAllUsers(message);
        }
        log.info("用户退出:" + username + ",当前在线人数为:" + getOnlineCount());
    }

    /**
     * 收到客户端消息后调用的方法
     *
     * @param message 客户端发送过来的消息
     */
    @OnMessage
    public void onMessage(String message, Session session) {
        log.info("用户消息:" + username + ",报文:" + message);
        //可以群发消息
        //消息保存到数据库、redis
        if (StringUtils.isNotBlank(message)) {
            try {
                //解析发送的报文
                Message mess = JSON.parseObject(message, Message.class);

                //需要发送的指定对象
                String toName = mess.getToName();
                //传送给对应toUserId用户的websocket
                if (StringUtils.isNotBlank(toName) && webSocketMap.containsKey(toName)) {
                    //获取推送指定用户的消息格式
                    String resultMsg = MessageUtils.getMessage(false, this.username, mess.getMessage());
                    webSocketMap.get(toName).sendMessage(resultMsg);
                } else {
                    log.error("请求的toName:" + toName + "不在该服务器上");
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * @param session
     * @param error
     */
    @OnError
    public void onError(Session session, Throwable error) {
        log.error("用户错误:" + this.username + ",原因:" + error.getMessage());
        error.printStackTrace();
    }

    /**
     * 实现服务器主动推送
     */
    public void sendMessage(String message) throws IOException {
        this.session.getBasicRemote().sendText(message);
    }

    public void broadcastAllUsers(String message)  {
        try {
            ConcurrentHashMap.KeySetView<String, WebSocketSingleServer> strings = webSocketMap.keySet();
            for (String name : strings) {
                WebSocketSingleServer webSocketSingleServer = webSocketMap.get(name);
                webSocketSingleServer.session.getBasicRemote().sendText(message);
            }
        }catch (Exception e){
            e.printStackTrace();
        }

    }


    public static synchronized int getOnlineCount() {
        return onlineCount;
    }

    public static synchronized void addOnlineCount() {
        WebSocketSingleServer.onlineCount++;
    }

    public static synchronized void subOnlineCount() {
        WebSocketSingleServer.onlineCount--;
    }
}
