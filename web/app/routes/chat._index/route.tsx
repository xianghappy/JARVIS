import { useAtomValue, useSetAtom } from "jotai";
import ky from "ky";
import {
  chatMessagesAtom,
  insertLoadedAssistantChatMessageAtom,
  insertUserChatMessageAtom,
  loadingAssistantChatMessageAtom,
  updateLoadingAssistantChatMessageAtom,
} from "~/atoms/chat";
import ChatInput from "~/components/chat/ChatInput";
import ChatMessage from "~/components/chat/ChatMessage";
import ChatSetting from "~/components/chat/ChatSetting";
import ChatUserGroup from "~/components/chat/ChatUserGroup";
import { StreamingItem } from "~/schemas/streaming";

export default function ChatIndex() {
  const chatMessages = useAtomValue(chatMessagesAtom);
  const insertUserChatMessage = useSetAtom(insertUserChatMessageAtom);
  const loadingAssistantChatMessage = useAtomValue(
    loadingAssistantChatMessageAtom
  );
  const updateLoadingAssistantChatMessage = useSetAtom(
    updateLoadingAssistantChatMessageAtom
  );
  const insertLoadedAssistantChatMessage = useSetAtom(
    insertLoadedAssistantChatMessageAtom
  );

  return (
    <div className="flex-1 flex flex-col items-center gap-2 bg-white rounded-lg">
      <div className="flex items-center px-2 h-[56px] w-full border-b">
        <ChatUserGroup className="mr-auto" />

        <ChatSetting />
      </div>

      <div className="flex-1 flex flex-col gap-2 w-full">
        {chatMessages.map((message) => (
          <ChatMessage key={message.id} value={message} />
        ))}

        {loadingAssistantChatMessage && (
          <ChatMessage value={loadingAssistantChatMessage} />
        )}
      </div>

      <div className="flex justify-center w-full p-4">
        <ChatInput
          className="w-1/2"
          onSend={async (inputValue: string) => {
            const newChatMessages = insertUserChatMessage(inputValue);

            const response = await ky.post("http://localhost:8001/chat", {
              json: {
                messages: newChatMessages,
              },
            });

            if (!response.body) {
              throw new Error("No response body");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            // eslint-disable-next-line no-constant-condition
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const streamingTexts = decoder.decode(value).split("\n\n");
              streamingTexts.forEach((text) => {
                if (text.startsWith("data:")) {
                  const item = JSON.parse(
                    text.substring(5).trim()
                  ) as StreamingItem;

                  updateLoadingAssistantChatMessage(
                    item.content,
                    item.reasoningContent
                  );
                }
              });
            }

            insertLoadedAssistantChatMessage();
          }}
        />
      </div>
    </div>
  );
}
