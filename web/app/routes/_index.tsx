import { Text } from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";
import ky from "ky";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChatInput from "~/components/ChatInput";
import { StreamingItem } from "~/models/Streaming";

export const meta: MetaFunction = () => {
  return [
    { title: "JARVIS" },
    { name: "description", content: "Welcome to AI!" },
  ];
};

export default function Index() {
  const [value, setValue] = useState("");

  const [reasoningContent, setReasoningContent] = useState("");
  const [content, setContent] = useState("");

  return (
    <div className="flex h-screen p-4">
      <div className="flex w-[260px]">sidebar</div>

      <div className="flex-1 flex flex-col items-center gap-2 p-4 bg-white rounded-lg">
        <div className="flex-1 flex flex-col w-full overflow-y-auto">
          <Text size="xs" c="dimmed" bg="gray.1">
            {reasoningContent}
          </Text>
          <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
        </div>

        <ChatInput
          className="w-1/2"
          value={value}
          onChange={setValue}
          onSend={async () => {
            setReasoningContent("");
            setContent("");

            const response = await ky.post("http://localhost:8001/chat", {
              json: {
                messages: [
                  {
                    role: "user",
                    content: value,
                  },
                ],
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

                  if (item.reasoning_content) {
                    setReasoningContent(
                      (prev) => prev + item.reasoning_content
                    );
                  }

                  if (item.content) {
                    setContent((prev) => prev + item.content);
                  }
                }
              });
            }
          }}
        />
      </div>
    </div>
  );
}
