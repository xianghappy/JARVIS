package com.adminapplication.service;

import cn.hutool.log.Log;
import cn.hutool.log.LogFactory;
import com.adminapplication.utils.SessionBean;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@ServerEndpoint(value = "/api/ws/sendAll")
@Component
public class WebSocketSendAllServer {

    static Log log = LogFactory.get(WebSocketSendAllServer.class);

    /**
     * concurrent包的线程安全Set，用来存放每个客户端对应的MyWebSocket对象。
     */
    private static ConcurrentHashMap<String, SessionBean> webSocketMap = new ConcurrentHashMap<>();

    /**
     * 分配给每个加入群聊的人一个专属id
     */
    private static AtomicInteger CLIENT_ID_SEQUENCE ;

    /**
     * 群聊内容
     */
    private static StringBuffer stringBuffer;

    static {
        CLIENT_ID_SEQUENCE = new AtomicInteger(0);
        stringBuffer = new StringBuffer();
    }
    /**
     * 与某个客户端的连接会话，需要通过它来指定客户端发送数据
     */
    private Session session;

    /**
     * 当前连接用户clientId
     */
    private String clientId;

    /**
     * 连接建立成功调用的方法
     */
    @OnOpen
    public void onOpen(Session session, EndpointConfig endpointConfig) {

        //设置长连接时间
        session.setMaxIdleTimeout(1000 * 60 * 60 * 3);
        SessionBean sessionBean = new SessionBean();
        sessionBean.setSession(session);
        sessionBean.setClientId(CLIENT_ID_SEQUENCE.getAndIncrement());
        this.clientId = String.valueOf(sessionBean.getClientId());
//        this.session = session;

//        this.clientId = CLIENT_ID_SEQUENCE.getAndIncrement();

        if (webSocketMap.containsKey(String.valueOf(sessionBean.getClientId()))) {
            webSocketMap.remove(String.valueOf(sessionBean.getClientId()));
            webSocketMap.put(String.valueOf(sessionBean.getClientId()), sessionBean);
        } else {
            webSocketMap.put(String.valueOf(sessionBean.getClientId()), sessionBean);

            String message = "客户端 " + sessionBean.getClientId() + " 连接成功"+"<br/>";
            stringBuffer.append(message);
//            //将当前在线用户的用户名推送给所有的客户端
//            //1.获取消息 //服务器 -> 客户端发送消息
//            String message = MessageUtils.getMessage(false, null,msg);
            //调用系统推送
            broadcastAllUsers(stringBuffer.toString());
        }



    }

    private Set<String> getNames() {
        return webSocketMap.keySet();
    }

    /**
     * 连接关闭调用的方法
     */
    @OnClose
    public void onClose() {
        if (webSocketMap.containsKey(this.clientId)) {
            webSocketMap.remove(this.clientId);

            //将当前在线用户的用户名推送给所有的客户端
            //1.获取消息 //服务器 -> 客户端发送消息
            String message = "客户端 " + this.clientId + " 已下线"+"<br/>";
            stringBuffer.append(message);
//            String message = MessageUtils.getMessage(false, null, msg);
            //调用系统推送
            broadcastAllUsers(stringBuffer.toString());
        }

    }

    /**
     * 收到客户端消息后调用的方法
     *
     * @param message 客户端发送过来的消息
     */
    @OnMessage
    public void onMessage(String message, Session session) {
        log.info("用户消息:" + this.clientId + ",报文:" + message);
        //可以群发消息
        //消息保存到数据库、redis
        if (StringUtils.isNotBlank(message)) {
            try {
//                //解析发送的报文
//                Message mess = JSON.parseObject(message, Message.class);
//                String resultMsg = MessageUtils.getMessage(false, null, mess.getMessage());
                //调用系统推送
                String msg = "客户端 " + this.clientId + "：" + message+"<br/>";
                stringBuffer.append(msg);
                broadcastAllUsers(stringBuffer.toString());
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
        log.error("用户错误:" + this.clientId + ",原因:" + error.getMessage());
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
            ConcurrentHashMap.KeySetView<String, SessionBean> strings = webSocketMap.keySet();
            System.out.println("webSocketMap是："+webSocketMap.keySet());
            for (String name : strings) {
                SessionBean sessionBean = webSocketMap.get(name);
                sessionBean.getSession().getBasicRemote().sendText(message);
            }
        }catch (Exception e){
            e.printStackTrace();
        }

    }


}
