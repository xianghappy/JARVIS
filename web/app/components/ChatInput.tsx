import { Button, TextInput } from "@mantine/core";
import { memo } from "react";

export interface ChatInputProps {
  onSend: () => void;
}

export default memo(function ChatInput(props: ChatInputProps) {
  const { onSend } = props;

  return (
    <div className="flex-1 flex gap-2">
      <TextInput className="flex-1" placeholder="Ask me anything" />
      <Button onClick={onSend}>Send</Button>
    </div>
  );
});
