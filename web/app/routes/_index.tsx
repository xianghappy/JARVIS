import type { MetaFunction } from "@remix-run/node";
import { useAtomValue, useSetAtom } from "jotai";
import ky from "ky";
import { useLayoutEffect } from "react";
import { authServiceAtom } from "~/atoms/app";
import {
  chatMessagesAtom,
  insertLoadedAssistantChatMessageAtom,
  insertUserChatMessageAtom,
  loadingAssistantChatMessageAtom,
  updateLoadingAssistantChatMessageAtom,
} from "~/atoms/chat";
import ChatInput from "~/components/ChatInput";
import ChatMessage from "~/components/ChatMessage";
import { StreamingItem } from "~/schemas/streaming";

export const meta: MetaFunction = () => {
  return [
    { title: "JARVIS" },
    { name: "description", content: "Welcome to AI!" },
  ];
};

export default function Index() {
  const authService = useAtomValue(authServiceAtom);

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

  useLayoutEffect(() => {
    authService.signIn();
  }, []);

  return (
    <div className="flex h-screen p-4">
      <div className="flex w-[260px]">sidebar</div>

      <div className="flex-1 flex flex-col items-center gap-2 p-4 bg-white rounded-lg">
        <div className="flex-1 flex flex-col gap-2 w-full">
          {chatMessages.map((message) => (
            <ChatMessage key={message.id} value={message} />
          ))}

          {loadingAssistantChatMessage && (
            <ChatMessage value={loadingAssistantChatMessage} />
          )}
        </div>

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
