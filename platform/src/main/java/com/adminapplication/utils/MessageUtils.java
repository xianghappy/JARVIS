package com.adminapplication.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringUtils;

public class MessageUtils {

    /**
     *
     * @param isSystemMessage 是否为系统消息
     * @param fromName
     * @param message 发送信息内容
     * @return
     */
    public static String getMessage(boolean isSystemMessage,String fromName,Object message){
        try {
            ResultMessage resultMessage = new ResultMessage();
            resultMessage.setSystem(isSystemMessage);
            resultMessage.setMessage(message);
            if(StringUtils.isNotBlank(fromName)){
                resultMessage.setFromName(fromName);
            }
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.writeValueAsString(resultMessage);
        }catch (JsonProcessingException e){
            e.printStackTrace();
        }
        return null;

    }

}
