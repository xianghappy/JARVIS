import { atom } from "jotai";
import { v4 as uuidv4 } from "uuid";
import { ChatMessageRead } from "~/schemas/chat";

export const chatMessagesAtom = atom<ChatMessageRead[]>([]);
export const loadingAssistantChatMessageAtom = atom<ChatMessageRead | null>(
  null
);

export const insertUserChatMessageAtom = atom(
  null,
  (get, set, content: string) => {
    const newMessage: ChatMessageRead = {
      id: uuidv4(),
      role: "user",
      content,
      reasoningContent: "",
    };

    const newChatMessages = [...get(chatMessagesAtom), newMessage];
    set(chatMessagesAtom, newChatMessages);

    return newChatMessages;
  }
);

export const updateLoadingAssistantChatMessageAtom = atom(
  null,
  (get, set, appendContent?: string, appendReasoningContent?: string) => {
    let message = get(loadingAssistantChatMessageAtom);

    if (!message) {
      message = {
        id: uuidv4(),
        role: "assistant",
        content: "",
        reasoningContent: "",
      };
    }

    message.content = message.content + appendContent;
    message.reasoningContent =
      message.reasoningContent + (appendReasoningContent ?? "");

    set(loadingAssistantChatMessageAtom, message);
  }
);

export const insertLoadedAssistantChatMessageAtom = atom(null, (get, set) => {
  const message = get(loadingAssistantChatMessageAtom);
  if (message) {
    set(chatMessagesAtom, (prev) => [...prev, message]);
    set(loadingAssistantChatMessageAtom, null);
  }
});
