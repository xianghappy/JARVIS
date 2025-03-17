import { Button, TextInput } from "@mantine/core";
import clsx from "clsx";
import { memo, useState } from "react";

export interface ChatInputProps {
  value: string;
  className?: string;
  onChange: (value: string) => void;
  onSend: () => Promise<void>;
}

export default memo(function ChatInput(props: ChatInputProps) {
  const { value, className, onChange, onSend } = props;

  const [sending, setSending] = useState(false);

  return (
    <div className={clsx("flex gap-2", className)}>
      <TextInput
        className="flex-1"
        placeholder="Ask me anything"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Button
        onClick={async () => {
          try {
            setSending(true);
            await onSend();
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
