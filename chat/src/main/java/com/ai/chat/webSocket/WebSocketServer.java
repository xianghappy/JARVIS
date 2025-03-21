package com.ai.chat.webSocket;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.apache.commons.lang3.StringUtils;

//@ServerEndpoint(value = "/ws/{type}/{username}")
@ServerEndpoint(value = "/ws/{type}/{sessionId}")
@Component
//@Slf4j
public class WebSocketServer {

    private static final Logger log = LoggerFactory.getLogger(WebSocketServer.class);


//    static Log log = LogFactory.get(WebSocketServer.class);
    /**
     * 静态变量，用来记录当前在线连接数。应该把它设计成线程安全的。
     */
    private static int onlineCount = 0;
    /**
     * concurrent包的线程安全Set，用来存放每个客户端对应的MyWebSocket对象。
     */
    private static ConcurrentHashMap<String, WebSocketServer> webSocketMap = new ConcurrentHashMap<>();
    /**
     * 与某个客户端的连接会话，需要通过它来给客户端发送数据
     */
    private Session session;
    /**
     * 接收userId
     */
    private String username = "";

    /**
     * 接收sessionId
     */
    private String sessionId = "";

    /**
     * 用户类型
     */
    private String type = "";


    /**
     * 连接建立成功调用的方法
     */
    @OnOpen
    public void onOpen(Session session, @PathParam("sessionId") String sessionId, @PathParam("type") String type) {

//        //前台用户socket
//        if ("userMessage".equals(type)) {
//            //处理token
//            JwtUtils jwtUtils = new JwtUtils();
//            String[] claims = jwtUtils.parsingToken(username);
//            username = claims[0];
//
//        }
        //设置长连接时间
        session.setMaxIdleTimeout(1000*60*60*3);

        this.session = session;
//        this.username = username;
        this.sessionId = session.getId();
        this.type = type;

        if (webSocketMap.containsKey(sessionId)) {
            webSocketMap.remove(sessionId);
            webSocketMap.put(sessionId, this);

            //加入set中
        } else {
            webSocketMap.put(sessionId, this);
            //加入set中
            addOnlineCount();
            //在线数加1
        }

        log.info("用户连接:" + sessionId + ",当前在线人数为:" + getOnlineCount());

        try {
            sendMessage("连接成功");
        } catch (IOException e) {
            log.error("用户:" + sessionId + ",网络异常!!!!!!");
        }
    }

    /**
     * 连接关闭调用的方法
     */
    @OnClose
    public void onClose() {
//        if (webSocketMap.containsKey(username)) {
//            webSocketMap.remove(username);
//            //从set中删除
//            subOnlineCount();
//        }
//        log.info("用户退出:" + username + ",当前在线人数为:" + getOnlineCount());
        if (webSocketMap.containsKey(sessionId)) {
            webSocketMap.remove(sessionId);
            //从set中删除
            subOnlineCount();
        }
        log.info("用户退出:" + sessionId + ",当前在线人数为:" + getOnlineCount());
    }

    /**
     * 收到客户端消息后调用的方法
     *
     * @param message 客户端发送过来的消息
     */
    @OnMessage
    public void onMessage(String message, Session session) {
        log.info("用户消息:" + sessionId + ",报文:" + message);
        //可以群发消息
        //消息保存到数据库、redis
        if (StringUtils.isNotBlank(message)) {
            try {
                //解析发送的报文
                JSONObject jsonObject = JSON.parseObject(message);
                //追加发送人(防止串改)
                jsonObject.put("fromUserId", this.sessionId);
                String toUserId = jsonObject.getString("toUserId");
                //传送给对应toUserId用户的websocket
                if (StringUtils.isNotBlank(toUserId) && webSocketMap.containsKey(toUserId)) {
                    webSocketMap.get(toUserId).sendMessage(jsonObject.toJSONString());
                } else {
                    log.error("请求的userId:" + toUserId + "不在该服务器上");
                    //否则不在这个服务器上，发送到mysql或者redis
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
        log.error("用户错误:" + this.sessionId + ",原因:" + error.getMessage());
        error.printStackTrace();
    }

    /**
     * 实现服务器主动推送
     */
    public void sendMessage(String message) throws IOException {
        this.session.getBasicRemote().sendText(message);
    }

    /**
     * 群发消息
     *
     * @param message
     * @throws IOException
     */
    public static void BroadCastInfo(String message) {

        Iterator<Map.Entry<String, WebSocketServer>> iter = webSocketMap.entrySet().iterator();
        log.info("iter是："+JSON.toJSONString(iter));
        while (iter.hasNext()) {

            Map.Entry<String, WebSocketServer> next = iter.next();
            String key = next.getKey();
            log.info("next.getKey()是："+next.getKey());
            WebSocketServer value = next.getValue();
            log.info("next.getValue()是："+next.getValue());
            sendInfo(message, value.sessionId);
        }
    }

    /**
     * 发送自定义消息
     */
    public static void sendInfo(String message, @PathParam("userId") String userId) {
        log.info("发送消息到:" + userId + "，报文:" + message);
        if (StringUtils.isNotBlank(userId) && webSocketMap.containsKey(userId)) {
            try {
                webSocketMap.get(userId).sendMessage(message);
            } catch (IOException e) {
                e.printStackTrace();
            }
        } else {
            log.error("用户" + userId + ",不在线！");
        }
    }

    public static synchronized int getOnlineCount() {
        return onlineCount;
    }

    public static synchronized void addOnlineCount() {
        WebSocketServer.onlineCount++;
    }

    public static synchronized void subOnlineCount() {
        WebSocketServer.onlineCount--;
    }
}
