import { Button, TextInput } from "@mantine/core";
import clsx from "clsx";
import { memo, useState } from "react";

export interface ChatInputProps {
  className?: string;
  onSend: (inputValue: string) => Promise<void>;
}

export default memo(function ChatInput(props: ChatInputProps) {
  const { className, onSend } = props;

  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);

  return (
    <div className={clsx("flex gap-2", className)}>
      <TextInput
        className="flex-1"
        placeholder="Ask me anything"
        disabled={sending}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <Button
        disabled={sending}
        onClick={async () => {
          try {
            setSending(true);
            await onSend(inputValue);
            setInputValue("");
          } finally {
            setSending(false);
          }
        }}
        loading={sending}
      >
        Send
      </Button>
    </div>
  );
});
