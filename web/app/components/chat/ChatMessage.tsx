import { Text } from "@mantine/core";
import clsx from "clsx";
import { memo } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessageRead } from "~/schemas/chat";

export interface ChatMessageProps {
  value: ChatMessageRead;
}

export default memo(function ChatMessage(props: ChatMessageProps) {
  const { value } = props;

  return (
    <div
      className={clsx(
        "flex flex-col p-2 border rounded-lg",
        value.role === "user" && "w-2/3 ml-auto"
      )}
    >
      <Text size="xs" c="dimmed" bg="gray.1">
        {value.reasoningContent}
      </Text>
      <Markdown remarkPlugins={[remarkGfm]}>{value.content}</Markdown>
    </div>
  );
});
