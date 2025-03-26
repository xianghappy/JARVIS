import { Button, TextInput } from "@mantine/core";
import TiptapDocument from "@tiptap/extension-document";
import TiptapFocus from "@tiptap/extension-focus";
import TiptapParagraph from "@tiptap/extension-paragraph";
import TiptapPlaceholder from "@tiptap/extension-placeholder";
import TiptapText from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
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

  const editor = useEditor({
    shouldRerenderOnTransaction: false,
    immediatelyRender: false,
    autofocus: "start",
    editable: sending,
    extensions: [
      TiptapDocument,
      TiptapParagraph,
      TiptapText,
      TiptapFocus,
      TiptapPlaceholder.configure({
        placeholder: "Ask anything...",
      }),
    ],
    onUpdate: (editorProps) => {
      setInputValue(editorProps.editor.getText());
    },
  });

  return (
    <div
      className={clsx(
        "flex flex-col gap-4 p-2 border rounded-lg shadow-lg",
        className
      )}
    >
      <TextInput
        className="flex-1 border-none"
        placeholder="Ask me anything"
        disabled={sending}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <EditorContent className="hidden" editor={editor} content={inputValue} />

      <div className="flex">
        <div className="flex-1 "></div>
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
    </div>
  );
});
