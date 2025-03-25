package com.adminapplication.utils;


import javax.websocket.Session;

public class SessionBean {

    private Session session;

    private Integer clientId;

    public SessionBean() {
    }

    public SessionBean(Session session, Integer clientId) {
        this.session = session;
        this.clientId = clientId;
    }

    public Session getSession() {
        return session;
    }

    public void setSession(Session session) {
        this.session = session;
    }

    public Integer getClientId() {
        return clientId;
    }

    public void setClientId(Integer clientId) {
        this.clientId = clientId;
    }
}
